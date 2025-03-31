import { storageService, StorageType } from "./storageService";

export const sessionStorageWrapper = {
  setItem: <T>(key: string, value: T): void => {
    storageService.setItem(StorageType.SESSION, key, value);
  },
  getItem: <T>(key: string): T | null => {
    return storageService.getItem<T>(StorageType.SESSION, key);
  },
  removeItem: (key: string): void => {
    storageService.removeItem(StorageType.SESSION, key);
  },
  clear: (): void => {
    storageService.clear(StorageType.SESSION);
  },
};
