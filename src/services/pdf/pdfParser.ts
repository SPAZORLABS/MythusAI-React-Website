import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface ParsedPdfData {
  text: string;
  pages: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
  };
}

/**
 * Parse PDF file and extract text content
 */
export const parsePdfFile = async (file: File): Promise<ParsedPdfData> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    
    let fullText = '';
    const numPages = pdf.numPages;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items into a single string
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    // Get PDF metadata
    const metadata = await pdf.getMetadata();
    
    return {
      text: fullText.trim(),
      pages: numPages,
      metadata: metadata.info
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF.');
  }
};

/**
 * Convert File to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:application/pdf;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validate PDF file
 */
export const validatePdfFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'Please select a PDF file.' };
  }
  
  // Check file size (limit to 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 50MB.' };
  }
  
  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'File appears to be empty.' };
  }
  
  return { isValid: true };
};

/**
 * Extract script formatting information (scene headings, character names, etc.)
 */
export const extractScriptFormatting = (text: string) => {
  const lines = text.split('\n');
  const scenes: string[] = [];
  const characters: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Scene headings (usually start with INT. or EXT.)
    if (/^(INT\.|EXT\.|INTERIOR|EXTERIOR)/i.test(line)) {
      scenes.push(line);
    }
    
    // Character names (usually all caps, centered, before dialogue)
    if (/^[A-Z\s]+$/.test(line) && line.length > 2 && line.length < 30) {
      // Check if the next line looks like dialogue
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && !nextLine.match(/^[A-Z\s]+$/)) {
        if (!characters.includes(line)) {
          characters.push(line);
        }
      }
    }
  }
  
  return {
    scenes: scenes.slice(0, 20), // Limit to first 20 scenes for preview
    characters: [...new Set(characters)].slice(0, 20) // Remove duplicates and limit
  };
};

export default {
  parsePdfFile,
  fileToBase64,
  validatePdfFile,
  extractScriptFormatting
}; 