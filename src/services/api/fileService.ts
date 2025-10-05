import axiosClient from '@/api/axiosClient';

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

  // Upload a PDF file
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Include access token as query param to satisfy backend validation
    const accessToken = (window as any).__getAccessToken?.();
    const uploadUrl = accessToken ? `/pdf/upload?token=${encodeURIComponent(accessToken)}` : '/pdf/upload';

    const response = await this.api.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data as UploadResponse;
  }

  // List all uploaded PDF files
  async listFiles(): Promise<ListResponse> {
    const accessToken = (window as any).__getAccessToken?.();
    const response = await this.api.get('/pdf/list?token=' + accessToken);
    return response.data as ListResponse;
  }

  // Process an uploaded PDF file
  async processFile(filename: string): Promise<ProcessResponse> {
    const accessToken = (window as any).__getAccessToken?.();
    const response = await this.api.post('/pdf/process?token=' + accessToken, { filename});
    return response.data as ProcessResponse;
  }

  async processFileToScript(screenplay_id: string, filename: string): Promise<ProcessResponse> {
    const accessToken = (window as any).__getAccessToken?.();
    const response = await this.api.post(`/pdf/process/${screenplay_id}?token=${accessToken}`, { filename });
    return response.data as ProcessResponse;
  }

  // Delete a PDF file
  async deleteFile(filename: string): Promise<DeleteResponse> {
    const accessToken = (window as any).__getAccessToken?.();
    const response = await this.api.delete(`/pdf/${filename}?token=${accessToken}`);
    return response.data as DeleteResponse;
  }

  // Get PDF file URL for viewing
  getPdfViewUrl(filename: string): string {
    const accessToken = (window as any).__getAccessToken?.();
    const baseUrl = `${this.api.defaults.baseURL}/pdf/view/${filename}`;
    
    if (accessToken) {
      return `${baseUrl}?token=${encodeURIComponent(accessToken)}`;
    }
    
    return baseUrl;
  }

  // Get PDF file as blob for download
  async downloadFile(filename: string): Promise<Blob> {
    const accessToken = (window as any).__getAccessToken?.();
    const response = await this.api.get(`/pdf/download/${filename}?token=${accessToken}`, {
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