import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Download } from 'lucide-react';
import { fileService } from '@/services/api/fileService';
import { useAuth } from '@/auth/AuthProvider';

interface PDFViewerProps {
  filename: string;
  onClose: () => void;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ filename, onClose, className }) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const effectiveToken = accessToken || (window as any).__getAccessToken?.();

  // Compute PDF URL with token
  const pdfUrl = useMemo(() => fileService.getPdfViewUrl(filename), [filename, effectiveToken]);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [pdfUrl]);

  return (
    <div className={`w-full min-h-[600px] flex flex-col bg-white border rounded-xl shadow ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <span className="font-medium text-sm truncate" title={filename}>{filename}</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" title="Download" onClick={() => {
            const baseURL = fileService["api"].defaults.baseURL;
            const url = `${baseURL}/pdf/download/${filename}${effectiveToken ? `?token=${encodeURIComponent(effectiveToken)}` : ''}`;
            window.open(url, '_blank');
          }}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Open in new tab" onClick={() => window.open(pdfUrl, '_blank')}>
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Close" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* PDF Content */}
      <div className="flex-1 relative bg-gray-50 flex items-center justify-center" style={{ minHeight: '500px' }}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <span className="text-xs text-gray-500">Loading PDF...</span>
          </div>
        )}
        {error ? (
          <div className="text-center">
            <span className="text-red-500 text-sm">{error}</span>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            title={`PDF Preview - ${filename}`}
            className="w-full h-full min-h-[500px] border-none"
            onLoad={() => setLoading(false)}
            onError={() => { setLoading(false); setError('Failed to load PDF'); }}
          />
        )}
      </div>
      {/* Footer */}
      <div className="p-2 border-t text-xs text-gray-400">PDF Preview</div>
    </div>
  );
};

export default PDFViewer;