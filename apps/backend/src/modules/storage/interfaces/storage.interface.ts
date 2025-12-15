export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  provider: 'local' | 's3';
}

export interface StorageConfig {
  provider: 'local' | 's3';
  maxFileSize: number;
  allowedFileTypes: string[];
}

export interface LocalStorageConfig extends StorageConfig {
  provider: 'local';
  uploadPath: string;
  baseUrl: string;
}

export interface S3StorageConfig extends StorageConfig {
  provider: 's3';
  accessKey: string;
  secretKey: string;
  region: string;
  bucket: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  cdnUrl?: string;
}

export interface FileUploadOptions {
  folder?: string;
  filename?: string;
  allowedTypes?: string[];
  maxSize?: number;
}
