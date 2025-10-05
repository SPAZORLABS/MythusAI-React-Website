import { ExclusionState, DomExclusionOptions } from '../types/pdf';

/**
 * DOM exclusion utilities for PDF export
 * Handles temporarily hiding elements during capture and restoring them afterward
 */

const HTML2CANVAS_IGNORE = 'data-html2canvas-ignore';
const NO_PRINT_ATTRIBUTE = 'data-no-print';

/**
 * Apply exclusions to DOM elements before capture
 * @param targetElement - The root element to search within
 * @param options - Exclusion options
 * @returns State object to restore elements later
 */
export function applyExclusions(
  targetElement: HTMLElement,
  options: DomExclusionOptions = {}
): ExclusionState {
  const { excludeSelectors = [], respectDataAttributes = true } = options;
  const excludedElements: HTMLElement[] = [];
  const originalAttributes = new Map<HTMLElement, string | null>();

  // Add CSS override to handle oklch colors
  const style = document.createElement('style');
  style.textContent = `
    /* Override oklch colors with fallback colors for html2canvas */
    * {
      color: rgb(0, 0, 0) !important;
      background-color: rgb(255, 255, 255) !important;
      border-color: rgb(0, 0, 0) !important;
    }
    /* Preserve specific color schemes */
    .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
    .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
    .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
    .bg-white { background-color: rgb(255, 255, 255) !important; }
    .text-gray-600 { color: rgb(75, 85, 99) !important; }
    .text-gray-900 { color: rgb(17, 24, 39) !important; }
    .text-black { color: rgb(0, 0, 0) !important; }
    .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
    .border-black { border-color: rgb(0, 0, 0) !important; }
  `;
  document.head.appendChild(style);

  // Find elements to exclude
  const elementsToExclude = new Set<HTMLElement>();

  // 1. Elements matching excludeSelectors
  excludeSelectors.forEach(selector => {
    try {
      const elements = targetElement.querySelectorAll(selector);
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          elementsToExclude.add(el);
        }
      });
    } catch (error) {
      console.warn(`Invalid selector "${selector}":`, error);
    }
  });

  // 2. Elements with data-no-print attribute (map to data-html2canvas-ignore)
  if (respectDataAttributes) {
    const noPrintElements = targetElement.querySelectorAll(`[${NO_PRINT_ATTRIBUTE}]`);
    noPrintElements.forEach(el => {
      if (el instanceof HTMLElement) {
        elementsToExclude.add(el);
      }
    });
  }

  // 3. Elements already marked with data-html2canvas-ignore
  const alreadyIgnored = targetElement.querySelectorAll(`[${HTML2CANVAS_IGNORE}]`);
  alreadyIgnored.forEach(el => {
    if (el instanceof HTMLElement) {
      elementsToExclude.add(el);
    }
  });

  // Apply exclusions
  elementsToExclude.forEach(element => {
    // Store original attribute value
    const originalValue = element.getAttribute(HTML2CANVAS_IGNORE);
    originalAttributes.set(element, originalValue);

    // Add exclusion attribute
    element.setAttribute(HTML2CANVAS_IGNORE, 'true');
    excludedElements.push(element);
  });

  // Store the style element for cleanup
  (originalAttributes as any).styleElement = style;

  return {
    excludedElements,
    originalAttributes,
  };
}

/**
 * Restore DOM elements after capture
 * @param state - State object from applyExclusions
 */
export function restoreExclusions(state: ExclusionState): void {
  const { excludedElements, originalAttributes } = state;

  excludedElements.forEach(element => {
    const originalValue = originalAttributes.get(element);
    
    if (originalValue === null) {
      // Remove attribute if it wasn't originally present
      element.removeAttribute(HTML2CANVAS_IGNORE);
    } else {
      // Restore original value
      element.setAttribute(HTML2CANVAS_IGNORE, originalValue || 'true');
    }
  });

  // Remove the CSS override style element
  const styleElement = (originalAttributes as any).styleElement;
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement);
  }
}

/**
 * Get all elements that should be excluded from capture
 * @param targetElement - The root element to search within
 * @param options - Exclusion options
 * @returns Array of elements that will be excluded
 */
export function getExcludedElements(
  targetElement: HTMLElement,
  options: DomExclusionOptions = {}
): HTMLElement[] {
  const { excludeSelectors = [], respectDataAttributes = true } = options;
  const excludedElements = new Set<HTMLElement>();

  // Elements matching excludeSelectors
  excludeSelectors.forEach(selector => {
    try {
      const elements = targetElement.querySelectorAll(selector);
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          excludedElements.add(el);
        }
      });
    } catch (error) {
      console.warn(`Invalid selector "${selector}":`, error);
    }
  });

  // Elements with data-no-print attribute
  if (respectDataAttributes) {
    const noPrintElements = targetElement.querySelectorAll(`[${NO_PRINT_ATTRIBUTE}]`);
    noPrintElements.forEach(el => {
      if (el instanceof HTMLElement) {
        excludedElements.add(el);
      }
    });
  }

  // Elements with data-html2canvas-ignore attribute
  const ignoredElements = targetElement.querySelectorAll(`[${HTML2CANVAS_IGNORE}]`);
  ignoredElements.forEach(el => {
    if (el instanceof HTMLElement) {
      excludedElements.add(el);
    }
  });

  return Array.from(excludedElements);
}

/**
 * Check if an element should be excluded from capture
 * @param element - Element to check
 * @returns True if element should be excluded
 */
export function shouldExcludeElement(element: HTMLElement): boolean {
  return (
    element.hasAttribute(HTML2CANVAS_IGNORE) ||
    element.hasAttribute(NO_PRINT_ATTRIBUTE)
  );
}

/**
 * Temporarily mark elements for exclusion during capture
 * This is a convenience function that applies and restores exclusions
 * @param targetElement - The root element to search within
 * @param options - Exclusion options
 * @param captureFn - Function to execute during exclusion
 * @returns Promise that resolves when capture is complete
 */
export async function withExclusions<T>(
  targetElement: HTMLElement,
  options: DomExclusionOptions,
  captureFn: () => Promise<T>
): Promise<T> {
  const exclusionState = applyExclusions(targetElement, options);
  
  try {
    return await captureFn();
  } finally {
    restoreExclusions(exclusionState);
  }
}