import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEED_IDS,
  createDayRecord,
  getBestStreak,
  getCurrentStreak,
  shiftDateKey,
  summarize,
  type DayRecord,
  type StoredRecords,
} from './deeds.ts';
import {
  readRecords,
  saveRecords,
  STORAGE_KEY,
  type StorageLike,
} from '../state/store.ts';

const completeDay = (date: string): DayRecord => ({
  date,
  completed: Object.fromEntries(DEED_IDS.map((id) => [id, true])) as DayRecord['completed'],
});

const partialDay = (date: string, completedIds: (typeof DEED_IDS)[number][]) => {
  const record = createDayRecord(date);
  completedIds.forEach((id) => {
    record.completed[id] = true;
  });
  return record;
};

const recordsWith = (...days: DayRecord[]): StoredRecords =>
  Object.fromEntries(days.map((day) => [day.date, day]));

const memoryStorage = (): StorageLike & { values: Map<string, string> } => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
};

test('a newly created day has 0 completed deeds', () => {
  assert.equal(summarize(createDayRecord('2026-09-09')).completedCount, 0);
});

test('checking and unchecking a deed changes its state', () => {
  const day = createDayRecord('2026-09-09');
  day.completed.fajr = true;
  assert.equal(day.completed.fajr, true);
  day.completed.fajr = false;
  assert.equal(day.completed.fajr, false);
});

test('a day is complete only when all 8 deeds are completed', () => {
  assert.equal(summarize(completeDay('2026-09-09')).isComplete, true);
  assert.equal(summarize(partialDay('2026-09-09', ['fajr'])).isComplete, false);
});

test('current streak counts consecutive completed days and excludes an incomplete today', () => {
  const records = recordsWith(
    completeDay('2026-09-07'),
    completeDay('2026-09-08'),
    partialDay('2026-09-09', ['fajr']),
  );
  assert.equal(getCurrentStreak(records, '2026-09-09'), 2);
});

test('an incomplete previous day breaks the current streak', () => {
  const records = recordsWith(
    completeDay('2026-09-06'),
    partialDay('2026-09-07', ['fajr']),
    completeDay('2026-09-08'),
    completeDay('2026-09-09'),
  );
  assert.equal(getCurrentStreak(records, '2026-09-09'), 2);
});

test('best streak is the highest consecutive run in stored history', () => {
  const records = recordsWith(
    completeDay('2026-09-01'),
    completeDay('2026-09-02'),
    completeDay('2026-09-03'),
    partialDay('2026-09-04', ['fajr']),
    completeDay('2026-09-06'),
    completeDay('2026-09-07'),
  );
  assert.equal(getBestStreak(records), 3);
});

test('completion percentage is completed deeds divided by 8', () => {
  assert.equal(
    summarize(partialDay('2026-09-09', ['fajr', 'dhuhr'])).percentage,
    25,
  );
});

test('records can be saved and loaded from localStorage', () => {
  const storage = memoryStorage();
  const records = recordsWith(completeDay('2026-09-09'));
  saveRecords(records, storage);
  assert.equal(storage.values.has(STORAGE_KEY), true);
  assert.deepEqual(readRecords(storage), records);
});

test('date shifting stays stable across consecutive days', () => {
  assert.equal(shiftDateKey('2026-09-09', -1), '2026-09-08');
  assert.equal(shiftDateKey('2026-09-09', 1), '2026-09-10');
});