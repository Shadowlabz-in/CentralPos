import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from './storage.interface';
import { config } from '../config';

export class LocalStorageProvider implements StorageProvider {
  async save(file: Express.Multer.File): Promise<string> {
    return `/uploads/${file.filename}`;
  }

  async delete(url: string): Promise<void> {
    const filename = url.replace('/uploads/', '');
    const filepath = path.join(config.upload.dir, filename);
    try {
      await fs.unlink(filepath);
    } catch {
      // file may already be missing
    }
  }
}
