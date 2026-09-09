export const DEED_IDS = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
  'quran',
  'dhikr',
  'charity',
] as const;

export type DeedId = (typeof DEED_IDS)[number];

export type CompletedDeeds = Record<DeedId, boolean>;

export type DayRecord = {
  date: string;
  completed: CompletedDeeds;
};

export type DaySummary = {
  date: string;
  completedCount: number;
  percentage: number;
  isComplete: boolean;
};

export type StoredRecords = Record<string, DayRecord>;

export const createEmptyCompleted = (): CompletedDeeds => ({
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
  quran: false,
  dhikr: false,
  charity: false,
});

export const createDayRecord = (date: string): DayRecord => ({
  date,
  completed: createEmptyCompleted(),
});

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const shiftDateKey = (dateKey: string, amount: number) => {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
};

export const countCompleted = (completed: CompletedDeeds) =>
  DEED_IDS.filter((id) => completed[id]).length;

export const summarize = (record: DayRecord): DaySummary => {
  const completedCount = countCompleted(record.completed);
  return {
    date: record.date,
    completedCount,
    percentage: Math.round((completedCount / DEED_IDS.length) * 100),
    isComplete: completedCount === DEED_IDS.length,
  };
};

export const getCurrentStreak = (records: StoredRecords, today: string) => {
  let cursor = today;
  if (!records[today] || !summarize(records[today]).isComplete) {
    cursor = shiftDateKey(today, -1);
  }

  let streak = 0;
  while (records[cursor] && summarize(records[cursor]).isComplete) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
};

export const getBestStreak = (records: StoredRecords) => {
  const completeDates = Object.values(records)
    .filter((record) => summarize(record).isComplete)
    .map((record) => record.date)
    .sort();

  let best = 0;
  let running = 0;
  completeDates.forEach((date, index) => {
    running =
      index > 0 && date === shiftDateKey(completeDates[index - 1], 1)
        ? running + 1
        : 1;
    best = Math.max(best, running);
  });
  return best;
};