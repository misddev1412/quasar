import { buildApiUrl } from './apiConfig';

interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    url: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    provider: string;
  }[];
  message?: string;
  error?: string;
}

export interface UploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export class UploadService {
  private static getAuthToken(): string | null {
    // Get token from localStorage using the same key as trpc.ts
    return localStorage.getItem('admin_access_token') || sessionStorage.getItem('admin_access_token');
  }

  // For now, always use local storage (direct upload)
  // TODO: Add proper storage provider detection via API endpoint
  private static async getStorageProvider(): Promise<'local' | 's3'> {
    // Always return 'local' for now since the backend is configured for local storage
    return 'local';
  }

  static async uploadSingle(
    file: File, 
    options: UploadOptions & { alt?: string; caption?: string } = {}
  ): Promise<UploadResponse> {
    try {
      const storageProvider = await this.getStorageProvider();
      
      if (storageProvider === 's3') {
        return await this.uploadSingleWithPresignedUrl(file, options);
      } else {
        return await this.uploadSingleDirect(file, options);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // Upload using presigned URLs (for S3)
  private static async uploadSingleWithPresignedUrl(
    file: File,
    options: UploadOptions & { alt?: string; caption?: string } = {}
  ): Promise<UploadResponse> {
    // Step 1: Generate presigned URL
    const token = this.getAuthToken();
    const presignedResponse = await fetch(buildApiUrl('/api/upload/presigned-url/single'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        folder: options.folder || 'general',
      }),
    });

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to generate presigned URL`);
    }

    const presignedResult = await presignedResponse.json();
    const presignedUrl = presignedResult.data;

    // Step 2: Upload file directly to S3 using presigned URL
    const uploadResponse = await fetch(presignedUrl.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
      signal: options.signal,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload ${file.name} to S3`);
    }

    // Step 3: Confirm upload and save media record
    const confirmResponse = await fetch(buildApiUrl('/api/upload/confirm-upload'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        url: presignedUrl.downloadUrl,
        filename: presignedUrl.filename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        folder: options.folder || 'general',
        alt: options.alt || file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt
        caption: options.caption || '',
      }),
    });

    if (!confirmResponse.ok) {
      throw new Error(`Failed to confirm upload for ${file.name}`);
    }

    const confirmResult = await confirmResponse.json();

    return {
      success: true,
      data: [confirmResult.data],
      message: confirmResult.message,
    };
  }

  // Upload directly to server (for local storage)
  private static async uploadSingleDirect(
    file: File,
    options: UploadOptions & { alt?: string; caption?: string } = {}
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    if (options.alt) {
      formData.append('alt', options.alt);
    }
    if (options.caption) {
      formData.append('caption', options.caption);
    }

    const token = this.getAuthToken();
    const response = await fetch(buildApiUrl('/api/upload/single'), {
      method: 'POST',
      body: formData,
      signal: options.signal,
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: [result.data],
      message: result.message,
    };
  }

  static async uploadMultiple(
    files: File[], 
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    try {
      const storageProvider = await this.getStorageProvider();
      
      if (storageProvider === 's3') {
        return await this.uploadMultipleWithPresignedUrls(files, options);
      } else {
        return await this.uploadMultipleDirect(files, options);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // Upload multiple files using presigned URLs (for S3)
  private static async uploadMultipleWithPresignedUrls(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    // Step 1: Generate presigned URLs for all files
    const token = this.getAuthToken();
    const presignedResponse = await fetch(buildApiUrl('/api/upload/presigned-url/gallery'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        files: files.map(file => ({
          filename: file.name,
          contentType: file.type,
        })),
        folder: options.folder || 'general',
      }),
    });

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to generate presigned URLs`);
    }

    const presignedResult = await presignedResponse.json();
    const presignedUrls = presignedResult.data;

    // Step 2: Upload files directly to S3 using presigned URLs
    const uploadPromises = files.map(async (file, index) => {
      const presignedUrl = presignedUrls[index];
      
      const uploadResponse = await fetch(presignedUrl.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        signal: options.signal,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${file.name} to S3`);
      }

      return {
        file,
        presignedUrl,
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Step 3: Confirm uploads and save media records
    const confirmPromises = uploadResults.map(async ({ file, presignedUrl }) => {
      const confirmResponse = await fetch(buildApiUrl('/api/upload/confirm-upload'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          url: presignedUrl.downloadUrl,
          filename: presignedUrl.filename,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          folder: options.folder || 'general',
          alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt
          caption: '',
        }),
      });

      if (!confirmResponse.ok) {
        throw new Error(`Failed to confirm upload for ${file.name}`);
      }

      return await confirmResponse.json();
    });

    const confirmResults = await Promise.all(confirmPromises);

    return {
      success: true,
      data: confirmResults.map(result => result.data),
      message: `${files.length} files uploaded successfully`,
    };
  }

  // Upload multiple files directly to server (for local storage)
  private static async uploadMultipleDirect(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    const token = this.getAuthToken();
    const response = await fetch(buildApiUrl('/api/upload/multiple'), {
      method: 'POST',
      body: formData,
      signal: options.signal,
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  }

  static async uploadGallery(
    files: File[], 
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    try {
      const storageProvider = await this.getStorageProvider();
      
      if (storageProvider === 's3') {
        return await this.uploadGalleryWithPresignedUrls(files, options);
      } else {
        return await this.uploadGalleryDirect(files, options);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  // Upload gallery using presigned URLs (for S3)
  private static async uploadGalleryWithPresignedUrls(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    // Step 1: Generate presigned URLs for all files
    const token = this.getAuthToken();
    const presignedResponse = await fetch(buildApiUrl('/api/upload/presigned-url/gallery'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        files: files.map(file => ({
          filename: file.name,
          contentType: file.type,
        })),
        folder: options.folder || 'gallery',
      }),
    });

    if (!presignedResponse.ok) {
      const errorData = await presignedResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to generate presigned URLs`);
    }

    const presignedResult = await presignedResponse.json();
    const presignedUrls = presignedResult.data;

    // Step 2: Upload files directly to S3 using presigned URLs
    const uploadPromises = files.map(async (file, index) => {
      const presignedUrl = presignedUrls[index];
      
      const uploadResponse = await fetch(presignedUrl.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        signal: options.signal,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload ${file.name} to S3`);
      }

      return {
        file,
        presignedUrl,
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Step 3: Confirm uploads and save media records
    const confirmPromises = uploadResults.map(async ({ file, presignedUrl }) => {
      const confirmResponse = await fetch(buildApiUrl('/api/upload/confirm-upload'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          url: presignedUrl.downloadUrl,
          filename: presignedUrl.filename,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          folder: options.folder || 'gallery',
          alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt
          caption: '',
        }),
      });

      if (!confirmResponse.ok) {
        throw new Error(`Failed to confirm upload for ${file.name}`);
      }

      return await confirmResponse.json();
    });

    const confirmResults = await Promise.all(confirmPromises);

    return {
      success: true,
      data: confirmResults.map(result => result.data),
      message: `${files.length} files uploaded successfully`,
    };
  }

  // Upload gallery directly to server (for local storage)
  private static async uploadGalleryDirect(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    const token = this.getAuthToken();
    const response = await fetch(buildApiUrl('/api/upload/gallery'), {
      method: 'POST',
      body: formData,
      signal: options.signal,
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      message: result.message,
    };
  }

  // Utility method to upload with progress tracking
  static uploadWithProgress(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append(files.length === 1 ? 'file' : 'files', file);
      });
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }

      // Set up progress tracking
      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            options.onProgress!(progress);
          }
        });
      }

      // Set up abort signal
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      }

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              data: Array.isArray(result.data) ? result.data : [result.data],
              message: result.message,
            });
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was cancelled'));
      });

      const token = this.getAuthToken();
      const endpoint = files.length === 1 ? 'single' : 'multiple';
      
      xhr.open('POST', buildApiUrl(`/api/upload/${endpoint}`));
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.send(formData);
    });
  }
}
