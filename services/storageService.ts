
import { BrandProfile } from '../types';
import { DEFAULT_BRAND_PROFILE } from '../constants';

const DB_NAME = 'TempleMountDB';
const STORE_NAME = 'brandProfile';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const saveBrandProfile = async (profile: BrandProfile): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(profile, 'current_profile');

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadBrandProfile = async (): Promise<BrandProfile> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current_profile');

    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        // Ensure styleReferenceImages exists for backward compatibility
        resolve({
          ...DEFAULT_BRAND_PROFILE,
          ...result,
          styleReferenceImages: result.styleReferenceImages || []
        });
      } else {
        resolve(DEFAULT_BRAND_PROFILE);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
};
