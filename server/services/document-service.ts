import * as fs from 'fs/promises';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { z } from 'zod';

export interface DocumentUpload {
  originalName: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
}

export interface StoredDocument {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedAt: Date;
}

export class DocumentService {
  private storageDir: string;
  private allowedTypes: Set<string>;
  private maxFileSize: number; // in bytes

  constructor() {
    this.storageDir = path.join(process.cwd(), 'uploads', 'documents');
    this.allowedTypes = new Set([
      'application/pdf',
      'text/markdown',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]);
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.ensureStorageDirectory();
  }

  /**
   * Ensure the storage directory exists
   */
  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.access(this.storageDir);
    } catch (error) {
      await fs.mkdir(this.storageDir, { recursive: true });
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(upload: DocumentUpload): { valid: boolean; error?: string } {
    if (!this.allowedTypes.has(upload.mimeType)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé. Types acceptés: PDF, Markdown, Texte`
      };
    }

    if (upload.size > this.maxFileSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille maximale: ${this.maxFileSize / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Get file extension from mime type
   */
  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'application/pdf': '.pdf',
      'text/markdown': '.md',
      'text/plain': '.txt',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
    };
    return mimeToExt[mimeType] || '.txt';
  }

  /**
   * Upload and store a document
   */
  async uploadDocument(upload: DocumentUpload): Promise<{
    success: boolean;
    document?: StoredDocument;
    error?: string;
  }> {
    try {
      const validation = this.validateFile(upload);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const fileName = this.generateFileName(upload.originalName);
      const filePath = path.join(this.storageDir, fileName);

      await fs.writeFile(filePath, upload.buffer);

      const document: StoredDocument = {
        id: randomBytes(16).toString('hex'),
        fileName,
        originalName: upload.originalName,
        fileType: this.getFileType(upload.mimeType),
        fileSize: upload.size,
        filePath: filePath,
        uploadedAt: new Date(),
      };

      return { success: true, document };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { 
        success: false, 
        error: 'Erreur lors du téléchargement du document' 
      };
    }
  }

  /**
   * Get file type from mime type
   */
  private getFileType(mimeType: string): string {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType === 'text/markdown') return 'md';
    if (mimeType === 'text/plain') return 'txt';
    if (mimeType.includes('word')) return 'doc';
    return 'unknown';
  }

  /**
   * Read document content
   */
  async readDocument(filePath: string): Promise<{
    success: boolean;
    content?: Buffer;
    error?: string;
  }> {
    try {
      const content = await fs.readFile(filePath);
      return { success: true, content };
    } catch (error) {
      console.error('Error reading document:', error);
      return { 
        success: false, 
        error: 'Document non trouvé ou inaccessible' 
      };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Get document metadata
   */
  async getDocumentMetadata(filePath: string): Promise<{
    size: number;
    mtime: Date;
    exists: boolean;
  }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        mtime: stats.mtime,
        exists: true,
      };
    } catch (error) {
      return {
        size: 0,
        mtime: new Date(),
        exists: false,
      };
    }
  }

  /**
   * Extract text content from markdown files
   */
  async extractMarkdownContent(filePath: string): Promise<{
    success: boolean;
    content?: string;
    error?: string;
  }> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { 
        success: false, 
        error: 'Impossible de lire le contenu du fichier markdown' 
      };
    }
  }

  /**
   * Create a workshop document attachment
   */
  async attachDocumentToWorkshop(
    documentId: string, 
    workshopId: number, 
    stepIndex?: number
  ): Promise<boolean> {
    // This would typically involve database operations
    // For now, we'll just return true
    // The actual implementation would be in the storage layer
    return true;
  }

  /**
   * List documents for a workshop
   */
  async getWorkshopDocuments(workshopId: number): Promise<StoredDocument[]> {
    // This would typically involve database operations
    // For now, we'll return an empty array
    // The actual implementation would be in the storage layer
    return [];
  }

  /**
   * Get allowed file types for upload
   */
  getAllowedFileTypes(): string[] {
    return Array.from(this.allowedTypes);
  }

  /**
   * Get maximum file size
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }
}

export default DocumentService;