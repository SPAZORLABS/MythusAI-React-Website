import axiosClient from '@/api/axiosClient';
import WebStore from '@/services/webStorage';

export interface PDFFile {
  filename: string;
  size: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  size: number;
}

export interface ListResponse {
  success: boolean;
  pdfs: PDFFile[];
  total_count: number;
}

export interface ProcessResponse {
  message: string;
  screenplay_id: string;
  scenes_count: number;
  scenes: any[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

class FileService {
  private api = axiosClient;
  
  private shouldMock(error?: any): boolean {
    const mockEnabled = import.meta.env.VITE_MOCK_API === 'true';
    if (mockEnabled) return true;
    const msg = String(error?.message || '');
    return /ECONNREFUSED|ERR_NETWORK|Network Error/i.test(msg);
  }

  // Local storage for mock files
  private store = new WebStore<{ pdfs: PDFFile[]; blobs: Record<string, string> }>({
    name: 'files',
    defaults: { pdfs: [], blobs: {} },
  });

  private async readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  // Upload a PDF file
  async uploadFile(file: File): Promise<UploadResponse> {
    if (this.shouldMock()) {
      const dataUrl = await this.readFileAsDataUrl(file);
      const filename = file.name;
      const size = file.size;
      const current = this.store.store;
      const exists = current.pdfs.some(f => f.filename === filename);
      const pdfMeta: PDFFile = { filename, size };
      current.blobs[filename] = dataUrl;
      current.pdfs = exists
        ? current.pdfs.map(f => (f.filename === filename ? pdfMeta : f))
        : [...current.pdfs, pdfMeta];
      this.store.store = current;
      return { success: true, message: 'Mock upload complete', filename, size } as UploadResponse;
    }
    const formData = new FormData();
    formData.append('file', file);
    const uploadUrl = `/pdf/upload`;
    const response = await this.api.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data as UploadResponse;
  }

  async listFiles(): Promise<ListResponse> {
    if (this.shouldMock()) {
      const { pdfs } = this.store.store;
      return { success: true, pdfs, total_count: pdfs.length } as ListResponse;
    }
    const response = await this.api.get('/pdf/list');
    return response.data as ListResponse;
  }

  // Process an uploaded PDF file
  async processFile(filename: string): Promise<ProcessResponse> {
    if (this.shouldMock()) {
      return {
        message: 'Mock processing started',
        screenplay_id: 'sp-mock',
        scenes_count: 3,
        scenes: [],
      } as ProcessResponse;
    }
    const response = await this.api.post('/pdf/process', { filename});
    return response.data as ProcessResponse;
  }

  async processFileToScript(screenplay_id: string, filename: string): Promise<ProcessResponse> {
    if (this.shouldMock()) {
      return {
        message: 'Mock processing complete',
        screenplay_id,
        scenes_count: 3,
        scenes: [
          { id: 'scene-1', sceneNumber: 1, heading: 'INT. OFFICE - DAY', content: 'Mock content', timeOfDay: 'day', location: 'Office', characters: [] },
          { id: 'scene-2', sceneNumber: 2, heading: 'EXT. PARK - DAY', content: 'Mock content', timeOfDay: 'day', location: 'Park', characters: [] },
          { id: 'scene-3', sceneNumber: 3, heading: 'INT. RESTAURANT - NIGHT', content: 'Mock content', timeOfDay: 'night', location: 'Restaurant', characters: [] },
        ],
      } as ProcessResponse;
    }
    const response = await this.api.post(`/pdf/process/${screenplay_id}`, { filename });
    return response.data as ProcessResponse;
  }

  // Delete a PDF file
  async deleteFile(filename: string): Promise<DeleteResponse> {
    if (this.shouldMock()) {
      const current = this.store.store;
      current.pdfs = current.pdfs.filter(f => f.filename !== filename);
      delete current.blobs[filename];
      this.store.store = current;
      return { success: true, message: 'Mock delete complete' } as DeleteResponse;
    }
    const response = await this.api.delete(`/pdf/${filename}`);
    return response.data as DeleteResponse;
  }

  // Get PDF file URL for viewing
  getPdfViewUrl(filename: string): string {
    if (this.shouldMock()) {
      const dataUrl = this.store.get('blobs')[filename];
      return dataUrl || '';
    }
    const baseUrl = `${this.api.defaults.baseURL}/pdf/view/${filename}`;
    return baseUrl;
  }

  // Get PDF file as blob for download
  async downloadFile(filename: string): Promise<Blob> {
    if (this.shouldMock()) {
      const dataUrl = this.store.get('blobs')[filename];
      if (!dataUrl) throw new Error('File not found');
      const res = await fetch(dataUrl);
      return await res.blob();
    }
    const response = await this.api.get(`/pdf/download/${filename}`, {
      responseType: 'blob'
    });
    return response.data as Blob;
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const fileService = new FileService();