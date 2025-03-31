import { storageService, StorageType } from "./storageService";

export const localStorageWrapper = {
  setItem: <T>(key: string, value: T): void => {
    storageService.setItem(StorageType.LOCAL, key, value);
  },
  getItem: <T>(key: string): T | null => {
    return storageService.getItem<T>(StorageType.LOCAL, key);
  },
  removeItem: (key: string): void => {
    storageService.removeItem(StorageType.LOCAL, key);
  },
  clear: (): void => {
    storageService.clear(StorageType.LOCAL);
  },
};
