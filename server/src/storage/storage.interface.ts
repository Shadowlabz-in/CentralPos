export interface StorageProvider {
  save(file: Express.Multer.File): Promise<string>;
  delete(url: string): Promise<void>;
}
