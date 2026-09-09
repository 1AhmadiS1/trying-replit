import type { StoredRecords } from '@/domain/deeds';

export const STORAGE_KEY = 'good-deeds-tracker.records.v1';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const browserStorage = (): StorageLike | undefined =>
  typeof window === 'undefined' ? undefined : window.localStorage;

export const readRecords = (storage = browserStorage()): StoredRecords => {
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (!saved) return {};
    return JSON.parse(saved) as StoredRecords;
  } catch {
    return {};
  }
};

export const saveRecords = (
  records: StoredRecords,
  storage = browserStorage(),
) => {
  storage?.setItem(STORAGE_KEY, JSON.stringify(records));
};