import { StorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';

export const storage: StorageProvider = new LocalStorageProvider();
