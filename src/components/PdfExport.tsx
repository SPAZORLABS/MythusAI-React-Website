import React from 'react';
import { PdfExportComponentProps } from '../types/pdf';
import { usePdfExport } from '@/hooks/usePdfExport';

/**
 * PdfExport component wrapper
 * Provides a render prop pattern for PDF export functionality
 */
export const PdfExport: React.FC<PdfExportComponentProps> = ({
  children,
  ...options
}) => {
  const { exportPdf, busy, error } = usePdfExport(options);

  return (
    <>
      {children({ exportPdf, busy, error })}
    </>
  );
};

export default PdfExport;