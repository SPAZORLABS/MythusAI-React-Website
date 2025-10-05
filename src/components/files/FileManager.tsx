import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Upload,
  FileText,
  Trash2,
  PlayCircle,
  Download,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Eye,
  FileX,
  ExternalLink
} from 'lucide-react';
import { fileService, PDFFile } from '@/services/api/fileService';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PDFViewer } from '../newScreenplay';

interface FileManagerProps {
  trigger?: React.ReactNode;
  onFileSelect?: (filename: string) => void;
  selectedFile?: string | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type SortBy = 'name' | 'size' | 'date';

const FileManager: React.FC<FileManagerProps> = ({
  trigger,
  onFileSelect,
  selectedFile: externalSelectedFile,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;

  const [files, setFiles] = useState<PDFFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [internalSelectedPdf, setInternalSelectedPdf] = useState<string | null>(null);
  const selectedPdf = externalSelectedFile !== undefined ? externalSelectedFile : internalSelectedPdf;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy] = useState<SortBy>('name');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');

  // Animation variants
  const containerVariants: Variants = { 
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: 100,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.15
      }
    }
  };

  const uploadVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    },
    drag: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  const pdfViewerVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: 50,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  // Load files when component mounts or sheet opens
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fileService.listFiles();
      setFiles(response.pdfs);
      setFilteredFiles(response.pdfs);
    } catch (err: any) {
      setError(`Failed to load files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort files
  useEffect(() => {
    let filtered = files.filter(file =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = a.filename.localeCompare(b.filename);
          break;
        case 'size':
          compareValue = a.size - b.size;
          break;
        case 'date':
          compareValue = a.filename.localeCompare(b.filename);
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredFiles(filtered);
  }, [files, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, loadFiles]);

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFile = droppedFiles.find(file => file.name.toLowerCase().endsWith('.pdf'));

    if (pdfFile) {
      handleFileUpload(pdfFile);
    } else {
      setError('Only PDF files are allowed');
    }
  };

  // Handle file upload
  const handleFileUpload = async (file?: File, event?: React.ChangeEvent<HTMLInputElement>) => {
    const fileToUpload = file || event?.target.files?.[0];
    if (!fileToUpload) return;

    if (!fileToUpload.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fileService.uploadFile(fileToUpload);
      setSuccess(`File "${response.filename}" uploaded successfully`);
      await loadFiles();
    } catch (err: any) {
      setError(`Failed to upload file: ${err.message}`);
    } finally {
      setUploading(false);
      if (event) {
        event.target.value = '';
      }
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    setDeleting(filename);
    setError(null);
    setSuccess(null);

    try {
      await fileService.deleteFile(filename);
      setSuccess(`File "${filename}" deleted successfully`);
      await loadFiles();
    } catch (err: any) {
      setError(`Failed to delete file: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // Handle PDF file click for viewing
  const handleViewPdf = async (filename: string) => {
    setPdfLoading(true);
    setInternalSelectedPdf(filename);
    
    if (onFileSelect) {
      onFileSelect(filename);
    }
    
    setTimeout(() => {
      setPdfLoading(false);
    }, 300);
  };

  // Close PDF viewer
  const closePdfViewer = () => {
    setInternalSelectedPdf(null);
    setPdfLoading(false);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Close PDF viewer when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setInternalSelectedPdf(null);
      setPdfLoading(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2 hover:bg-accent transition-colors">
      <FileText className="h-4 w-4" />
      File Manager
    </Button>
  );

  const renderFileItem = (file: PDFFile, index: number) => {
    const isProcessing = processing === file.filename;
    const isDeleting = deleting === file.filename;
    const isLoading = isProcessing || isDeleting;
  
    return (
      <motion.div
        key={file.filename}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group flex items-center gap-3 p-3 rounded-md hover:bg-accent/50 cursor-pointer",
          selectedPdf === file.filename && "bg-primary/5 border border-primary/20"
        )}
        onClick={() => handleViewPdf(file.filename)}
        role="button"
        aria-label={`Open ${file.filename}`}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative flex-shrink-0">
          <motion.div 
            className="w-10 h-10 bg-red-50 dark:bg-red-950/20 rounded-md flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <FileText className="h-5 w-5 text-red-500" />
          </motion.div>
          {isLoading && (
            <motion.div 
              className="absolute inset-0 bg-background/80 rounded-md flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2
                className={cn(
                  "h-4 w-4 animate-spin",
                  isDeleting ? "text-destructive" : "text-primary"
                )}
              />
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p
            className="text-sm font-medium truncate leading-tight"
            title={file.filename}
          >
            {file.filename}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{fileService.formatFileSize(file.size)}</span>
            <span>•</span>
            <span>PDF Document</span>
          </div>
        </div>

        <motion.div 
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <ContextMenu>
            <ContextMenuTrigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-44">
              <ContextMenuItem
                onClick={() => handleViewPdf(file.filename)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                View PDF
              </ContextMenuItem>

              <ContextMenuItem
                onClick={async () => {
                  try {
                    const blob = await fileService.downloadFile(file.filename);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Download failed:', err);
                  }
                }}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </ContextMenuItem>

              <ContextMenuSeparator />

              <ContextMenuItem
                onClick={() => handleDeleteFile(file.filename)}
                disabled={isDeleting}
                className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete File
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-2xl p-0 flex flex-col bg-white"
        size={selectedPdf ? 'custom' : 'md'}
        customSize={selectedPdf ? '90vw' : undefined}
        showCloseButton={true}
        onClose={() => setIsOpen(false)}
        expandable={true}
        defaultExpanded={false}
        onExpandChange={(expanded) => {
          console.log('Sheet expanded:', expanded)
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="file-manager-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full flex flex-col"
            >
              {/* Header */}
              <motion.div 
                className="flex items-center justify-between p-6 border-b border-border bg-muted/30"
                variants={itemVariants}
              >
                <div>
                  <SheetTitle className="text-xl font-semibold">File Manager</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground mt-1">
                    Manage and process your PDF documents
                  </SheetDescription>
                </div>
              </motion.div>

              <div className={`flex-1 ${selectedPdf ? 'flex' : 'flex flex-col'} overflow-hidden h-full`}>
                {/* File Management Section */}
                <motion.div 
                  className={`${selectedPdf ? 'w-96 flex-shrink-0 border-r border-border' : 'w-full'} flex flex-col`}
                  variants={itemVariants}
                >
                  <div className="p-6 space-y-6">
                    {/* Upload Section */}
                    <motion.div
                      variants={uploadVariants}
                      whileHover="hover"
                      animate={dragActive ? "drag" : "visible"}
                      className="relative"
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(undefined, e)}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={cn(
                          "group relative flex flex-col items-center justify-center",
                          "border-2 border-dashed rounded-xl p-8 cursor-pointer",
                          "transition-colors hover:border-primary/60",
                          uploading ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/30',
                          dragActive && 'border-primary bg-primary/10'
                        )}
                      >
                        <div className="flex flex-col items-center space-y-4">
                          {uploading ? (
                            <motion.div 
                              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </motion.div>
                          ) : (
                            <motion.div 
                              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Upload className="h-6 w-6 text-primary" />
                            </motion.div>
                          )}
                          <div className="text-center space-y-2">
                            <p className="text-sm font-medium">
                              {uploading ? 'Uploading your file...' : 'Drop your PDF here or click to browse'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports PDF files up to 10MB
                            </p>
                          </div>
                        </div>
                      </label>
                    </motion.div>
                  </div>

                  {/* Status Messages */}
                  <AnimatePresence>
                    {(error || success) && (
                      <motion.div 
                        className="px-6 pb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {error && (
                          <Alert variant="destructive" className="border-none bg-destructive/10">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">{error}</AlertDescription>
                          </Alert>
                        )}

                        {success && (
                          <Alert className="border-none bg-green-50 dark:bg-green-950/20">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-sm text-green-700 dark:text-green-300">{success}</AlertDescription>
                          </Alert>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Files List Header */}
                  <motion.div className="px-6 pb-4" variants={itemVariants}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">
                        Documents {filteredFiles.length > 0 && `(${filteredFiles.length}${filteredFiles.length !== files.length ? ` of ${files.length}` : ''})`}
                      </h3>
                    </div>
                  </motion.div>

                  {/* Files List */}
                  <div className="flex-1 pb-6 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {loading ? (
                        <motion.div 
                          className="flex items-center justify-center py-12"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Loading files...</p>
                          </div>
                        </motion.div>
                      ) : filteredFiles.length === 0 ? (
                        <motion.div 
                          className="text-center py-12"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            {searchTerm ? <FileX className="h-8 w-8 text-muted-foreground" /> : <FileText className="h-8 w-8 text-muted-foreground" />}
                          </div>
                          <h4 className="text-lg font-medium mb-2">
                            {searchTerm ? 'No files found' : 'No documents yet'}
                          </h4>
                          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            {searchTerm
                              ? `No files match "${searchTerm}". Try a different search term.`
                              : 'Upload your first PDF document to get started with file processing.'
                            }
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="space-y-2"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {filteredFiles.map((file, index) => renderFileItem(file, index))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* PDF Viewer Section */}
                <AnimatePresence mode="wait">
                  {selectedPdf && (
                    <motion.div 
                      key={selectedPdf}
                      variants={pdfViewerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex-1 h-full min-h-[85vh] flex items-center justify-center"
                    >
                      <PDFViewer filename={selectedPdf} onClose={closePdfViewer} className="h-full w-full"/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

export default FileManager;
