export interface PdfExportOptions {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'pt' | 'mm' | 'in' | 'px';
  format?: 'a4' | 'a3' | 'letter' | 'legal';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale?: number;
  excludeSelectors?: string[];
  onBeforeCapture?: () => void | Promise<void>;
  onAfterCapture?: () => void | Promise<void>;
}

export interface PdfExportState {
  busy: boolean;
  error: string | null;
}

export interface PdfExportHook extends PdfExportState {
  exportPdf: () => Promise<void>;
}

// Legacy type alias for backward compatibility
export type PdfExportReturn = PdfExportHook;

export interface PdfExportComponentProps {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  unit?: 'pt' | 'mm' | 'in' | 'px';
  format?: 'a4' | 'a3' | 'letter' | 'legal';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale?: number;
  excludeSelectors?: string[];
  onBeforeCapture?: () => void | Promise<void>;
  onAfterCapture?: () => void | Promise<void>;
  children: (props: PdfExportHook) => React.ReactNode;
}

export interface PageDimensions {
  width: number;
  height: number;
  printableWidth: number;
  printableHeight: number;
}

export interface CanvasCaptureOptions {
  scale: number;
  excludeSelectors: string[];
  onBeforeCapture?: () => void | Promise<void>;
  onAfterCapture?: () => void | Promise<void>;
}

export interface ImageSlice {
  canvas: HTMLCanvasElement;
  yOffset: number;
  height: number;
}

// Additional types for backward compatibility
export type PdfFormat = 'a4' | 'a3' | 'letter' | 'legal';
export type PdfOrientation = 'portrait' | 'landscape';

// Constants
export const PDF_FORMATS = {
  A4: 'a4' as const,
  A3: 'a3' as const,
  LETTER: 'letter' as const,
  LEGAL: 'legal' as const,
} as const;

// PDF page dimensions in points
export const PDF_DIMENSIONS = {
  a4: { width: 595.28, height: 841.89 },
  a3: { width: 841.89, height: 1190.55 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
} as const;

// DOM exclusion utilities
export interface ExclusionState {
  excludedElements: HTMLElement[];
  originalAttributes: Map<HTMLElement, string | null>;
}

export interface DomExclusionOptions {
  excludeSelectors?: string[];
  respectDataAttributes?: boolean;
}

// Legacy type aliases for backward compatibility
export type PdfExportProps = PdfExportComponentProps;