import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PdfExportOptions, PdfExportHook, PDF_DIMENSIONS } from '@/types/pdf';
import { applyExclusions, restoreExclusions } from '@/utils/domExclude';

// Helper: replace inputs/selects/textarea with text spans so values render in canvas
function replaceFormControls(targetElement: HTMLElement) {
  const replacements: Array<{ parent: Node; clone: HTMLElement; original: HTMLElement; nextSibling: ChildNode | null }> = [];

  const controls = targetElement.querySelectorAll('input, textarea, select');
  controls.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;

    const computed = window.getComputedStyle(el);
    const span = document.createElement('span');

    let text = '';
    if (el instanceof HTMLInputElement) {
      text = el.value || el.placeholder || '';
    } else if (el instanceof HTMLTextAreaElement) {
      text = el.value || el.placeholder || '';
    } else if (el instanceof HTMLSelectElement) {
      text = el.selectedOptions[0]?.text || el.value || '';
    }

    span.textContent = text;
    span.style.display = 'inline-block';
    span.style.whiteSpace = 'pre-wrap';
    span.style.wordBreak = 'break-word';
    span.style.lineHeight = computed.lineHeight;
    span.style.fontFamily = computed.fontFamily;
    span.style.fontSize = computed.fontSize;
    span.style.fontWeight = computed.fontWeight as any;
    span.style.color = '#000';
    span.style.padding = computed.padding;
    span.style.margin = computed.margin;
    span.style.textAlign = computed.textAlign as any;
    span.style.width = '100%';
    span.style.background = 'transparent';
    span.setAttribute('data-html2canvas-clone', 'true');

    const parent = el.parentNode as Node;
    const nextSibling = el.nextSibling;
    if (parent) {
      replacements.push({ parent, clone: span, original: el, nextSibling });
      parent.replaceChild(span, el);
    }
  });

  return {
    restore() {
      replacements.forEach(({ parent, clone, original, nextSibling }) => {
        try {
          if (nextSibling) {
            parent.insertBefore(original, nextSibling);
            (parent as HTMLElement).removeChild(clone);
          } else {
            parent.replaceChild(original, clone);
          }
        } catch {
          // no-op
        }
      });
    }
  };
}

/**
 * React hook for PDF export functionality
 * Provides a canvas-snapshot pipeline: HTML → canvas → PNG → PDF
 */
export function usePdfExport(options: PdfExportOptions): PdfExportHook {
  const {
    targetRef,
    filename = 'export.pdf',
    orientation = 'portrait',
    unit = 'pt',
    format = 'a4',
    margin = { top: 24, right: 24, bottom: 24, left: 24 },
    scale = 2,
    excludeSelectors = [],
    onBeforeCapture,
    onAfterCapture,
  } = options;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPdf = useCallback(async (): Promise<void> => {
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      // Validate target element
      const targetElement = targetRef.current;
      if (!targetElement) {
        throw new Error('Target element not found. Make sure the ref is properly set.');
      }

      // Get page dimensions
      const pageDimensions = PDF_DIMENSIONS[format];
      const pageWidth = orientation === 'landscape' ? pageDimensions.height : pageDimensions.width;
      const pageHeight = orientation === 'landscape' ? pageDimensions.width : pageDimensions.height;

      // Calculate printable area
      const printableWidth = pageWidth - margin.left - margin.right;
      const printableHeight = pageHeight - margin.top - margin.bottom;

      // Call before capture callback
      onBeforeCapture?.();

      // Apply exclusions
      const exclusionState = applyExclusions(targetElement, { excludeSelectors, respectDataAttributes: true });

      // Replace form controls with static spans so values appear in snapshot
      const controlReplacement = replaceFormControls(targetElement);

      // Capture the element to canvas
      const canvas = await html2canvas(targetElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: targetElement.scrollWidth,
        height: targetElement.scrollHeight,
        ignoreElements: (element) => {
          // Skip elements that might have problematic CSS
          return element.hasAttribute('data-html2canvas-ignore');
        }
      } as any);

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit,
        format,
      });

      // Calculate scaling to fit page width
      const imageWidth = canvas.width;
      const imageHeight = canvas.height;
      const scaleToFit = printableWidth / imageWidth;
      const scaledWidth = imageWidth * scaleToFit;
      const scaledHeight = imageHeight * scaleToFit;

      // Convert canvas to image data
      const imageData = canvas.toDataURL('image/png');

      if (scaledHeight <= printableHeight) {
        // Single page
        pdf.addImage(
          imageData,
          'PNG',
          margin.left,
          margin.top,
          scaledWidth,
          scaledHeight
        );
      } else {
        // Multi-page
        const pagesNeeded = Math.ceil(scaledHeight / printableHeight);
        
        for (let page = 0; page < pagesNeeded; page++) {
          if (page > 0) {
            pdf.addPage();
          }

          // Calculate source and destination coordinates
          const sourceY = (page * printableHeight) / scaleToFit;
          const sourceHeight = Math.min(
            printableHeight / scaleToFit,
            imageHeight - sourceY
          );
          const destHeight = sourceHeight * scaleToFit;

          // Create a temporary canvas for this page slice
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          
          if (!pageCtx) {
            throw new Error('Failed to create canvas context for page slice');
          }

          pageCanvas.width = imageWidth;
          pageCanvas.height = sourceHeight;

          // Draw the slice
          pageCtx.drawImage(
            canvas,
            0, sourceY, imageWidth, sourceHeight,
            0, 0, imageWidth, sourceHeight
          );

          // Add to PDF
          const pageImageData = pageCanvas.toDataURL('image/png');
          pdf.addImage(
            pageImageData,
            'PNG',
            margin.left,
            margin.top,
            scaledWidth,
            destHeight
          );
        }
      }

      // Save PDF
      pdf.save(filename);

      // Restore replaced controls and exclusions
      controlReplacement.restore();
      restoreExclusions(exclusionState);

      // Call after capture callback
      onAfterCapture?.();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during PDF export';
      setError(errorMessage);
      console.error('PDF export error:', err);
      throw err;
    } finally {
      // Ensure restoration in case of early errors
      try {
        const targetElement = targetRef.current as HTMLElement | null;
        if (targetElement) {
          const clones = targetElement.querySelectorAll('[data-html2canvas-clone="true"]');
          clones.forEach((clone) => {
            const parent = clone.parentNode;
            if (parent) parent.removeChild(clone);
          });
        }
      } catch {/* ignore */}
      setBusy(false);
    }
  }, [
    targetRef,
    filename,
    orientation,
    unit,
    format,
    margin,
    scale,
    excludeSelectors,
    onBeforeCapture,
    onAfterCapture,
    busy,
  ]);

  return {
    exportPdf,
    busy,
    error,
  };
}