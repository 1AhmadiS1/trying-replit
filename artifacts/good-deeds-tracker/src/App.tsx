import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  BookOpen,
  CalendarDays,
  Check,
  CloudSun,
  Flame,
  HeartHandshake,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  type LucideIcon,
} from 'lucide-react';
import {
  createDayRecord,
  getBestStreak,
  getCurrentStreak,
  summarize,
  toDateKey,
  type DayRecord,
  type DeedId,
} from '@/domain/deeds';
import { readRecords, saveRecords } from '@/state/store';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type Deed = {
  id: DeedId;
  name: string;
  icon: LucideIcon;
  note: string;
};

const DEEDS: Deed[] = [
  { id: 'fajr', name: 'Fajr', icon: Sunrise, note: 'The dawn prayer' },
  { id: 'dhuhr', name: 'Dhuhr', icon: Sun, note: 'The midday prayer' },
  { id: 'asr', name: 'Asr', icon: CloudSun, note: 'The afternoon prayer' },
  { id: 'maghrib', name: 'Maghrib', icon: Sunset, note: 'The sunset prayer' },
  { id: 'isha', name: 'Isha', icon: Moon, note: 'The night prayer' },
  { id: 'quran', name: 'Quran', icon: BookOpen, note: 'A little reading' },
  { id: 'dhikr', name: 'Dhikr', icon: Sparkles, note: 'Remembering Allah' },
  { id: 'charity', name: 'Charity', icon: HeartHandshake, note: 'A generous act' },
];

const formatToday = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);

const formatHistoryDate = (dateKey: string) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`));

function Home() {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const [records, setRecords] = useState<Record<string, DayRecord>>(() => readRecords());
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const todayRecord = records[todayKey] ?? createDayRecord(todayKey);
  const todaySummary = summarize(todayRecord);
  const currentStreak = getCurrentStreak(records, todayKey);
  const bestStreak = getBestStreak(records);
  const history = Object.values(records)
    .filter((record) => record.date !== todayKey)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(summarize);

  const toggleDeed = useCallback((deedId: DeedId) => {
    setRecords((previous) => {
      const previousRecord = previous[todayKey] ?? createDayRecord(todayKey);
      const nextValue = !previousRecord.completed[deedId];
      return {
        ...previous,
        [todayKey]: {
          date: todayKey,
          completed: { ...previousRecord.completed, [deedId]: nextValue },
        },
      };
    });
    const deedName = DEEDS.find((deed) => deed.id === deedId)?.name ?? 'Deed';
    setLastAction(`${deedName} ${todayRecord.completed[deedId] ? 'set aside for now' : 'is counted'}.`);
  }, [todayKey, todayRecord.completed]);

  return (
    <main className="app-shell">
      <div className="page-wrap">
        <header className="stagger-in flex items-center justify-between border-b border-[hsl(var(--border)/.75)] py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_7px_16px_rgba(35,77,67,.18)]" aria-hidden="true">
              <span className="h-4 w-4 rotate-45 rounded-[4px] border-2 border-[hsl(var(--accent))]" />
            </div>
            <div>
              <p className="display-face text-lg font-semibold leading-none tracking-tight">Mizan</p>
              <p className="mono-label mt-1 text-[hsl(var(--muted-foreground))]">a daily practice</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-right sm:flex">
            <CalendarDays className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden="true" />
            <p className="mono-label text-[hsl(var(--muted-foreground))]" data-testid="text-current-date">{formatToday(today)}</p>
          </div>
        </header>

        <section className="grid gap-8 pb-10 pt-12 sm:pb-14 sm:pt-16 lg:grid-cols-[1fr_310px] lg:items-end lg:gap-16">
          <div className="stagger-in delay-1">
            <p className="mono-label mb-5 text-[hsl(var(--primary))]">Today, gently</p>
            <h1 className="display-face max-w-[650px] text-[clamp(2.7rem,7vw,5.8rem)] font-medium leading-[.96] text-[hsl(var(--foreground))]">
              Keep what<br className="hidden sm:block" /> brings you closer.
            </h1>
            <p className="mt-6 max-w-[480px] text-base leading-7 text-[hsl(var(--muted-foreground))]">
              Eight small places to return to. No pressure to fill them all at once.
            </p>
          </div>

          <div className="stagger-in delay-2 card-surface relative overflow-hidden p-6 sm:p-7">
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[hsl(var(--accent)/.25)] blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="mono-label text-[hsl(var(--muted-foreground))]">Today's rhythm</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-.05em]" data-testid="text-completion-count">
                  {todaySummary.completedCount}<span className="ml-1 text-lg font-normal text-[hsl(var(--muted-foreground))]">/ 8</span>
                </p>
              </div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `conic-gradient(hsl(var(--primary)) ${todaySummary.percentage}%, hsl(var(--muted) / .8) 0)` }}>
                <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[hsl(var(--card))]">
                  <span className="font-mono text-sm font-medium text-[hsl(var(--primary))]" data-testid="text-completion-percentage">{todaySummary.percentage}%</span>
                </div>
              </div>
            </div>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]" aria-label={`${todaySummary.percentage}% complete`}>
              <div className="progress-fill h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${todaySummary.percentage}%` }} />
            </div>
            <p className="mt-4 text-sm leading-5 text-[hsl(var(--muted-foreground))]" data-testid="status-today">
              {todaySummary.isComplete ? 'A full day, held with care.' : `${8 - todaySummary.completedCount} ${8 - todaySummary.completedCount === 1 ? 'place' : 'places'} still open today.`}
            </p>
          </div>
        </section>

        <section className="grid gap-6 pb-12 md:grid-cols-[1fr_275px] md:gap-8">
          <div className="stagger-in delay-3 card-surface p-5 sm:p-7">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mono-label text-[hsl(var(--muted-foreground))]">A simple return</p>
                <h2 className="display-face mt-2 text-2xl font-semibold">Today's deeds</h2>
              </div>
              <p className="hidden text-right text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:block">Tap a line<br />when it is done.</p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {DEEDS.map((deed) => {
                const Icon = deed.icon;
                const complete = todayRecord.completed[deed.id];
                return (
                  <button
                    key={deed.id}
                    type="button"
                    className={`deed-button group flex min-h-[76px] items-center gap-3 rounded-2xl border px-4 py-3 text-left ${complete ? 'is-complete' : 'bg-[hsl(var(--background)/.22)]'}`}
                    aria-pressed={complete}
                    data-testid={`button-toggle-${deed.id}`}
                    onClick={() => toggleDeed(deed.id)}
                  >
                    <span className="check-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card)/.65)] text-[hsl(var(--muted-foreground))]">
                      {complete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-4 w-4" strokeWidth={1.7} />}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold ${complete ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>{deed.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-[hsl(var(--muted-foreground))]">{deed.note}</span>
                    </span>
                    <span className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full ${complete ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--border))]'}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            {lastAction && (
              <p key={lastAction} className="complete-note mt-5 flex items-center gap-2 text-xs text-[hsl(var(--primary))]" role="status" data-testid="status-last-action">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {lastAction}
              </p>
            )}
          </div>

          <aside className="stagger-in delay-4 grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-4">
            <div className="card-surface flex min-h-[128px] flex-col justify-between p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="mono-label text-[hsl(var(--muted-foreground))]">Current streak</p>
                <Flame className="h-4 w-4 text-[hsl(var(--accent))]" aria-hidden="true" />
              </div>
              <p className="display-face text-4xl font-semibold" data-testid="text-current-streak">{currentStreak}<span className="ml-1 text-base font-normal text-[hsl(var(--muted-foreground))]">{currentStreak === 1 ? 'day' : 'days'}</span></p>
            </div>
            <div className="card-surface flex min-h-[128px] flex-col justify-between p-5 sm:p-6">
              <p className="mono-label text-[hsl(var(--muted-foreground))]">Best streak</p>
              <p className="display-face text-4xl font-semibold" data-testid="text-best-streak">{bestStreak}<span className="ml-1 text-base font-normal text-[hsl(var(--muted-foreground))]">{bestStreak === 1 ? 'day' : 'days'}</span></p>
            </div>
          </aside>
        </section>

        <section className="stagger-in delay-4 border-t border-[hsl(var(--border)/.75)] pb-16 pt-10 sm:pb-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="mono-label text-[hsl(var(--muted-foreground))]">A quiet record</p>
              <h2 className="display-face mt-2 text-2xl font-semibold">Previous days</h2>
            </div>
            {history.length > 0 && <p className="text-xs text-[hsl(var(--muted-foreground))]">{history.length} {history.length === 1 ? 'day' : 'days'} kept</p>}
          </div>
          {history.length > 0 ? (
            <div className="card-surface overflow-hidden" data-testid="list-history">
              {history.map((day, index) => (
                <div key={day.date} className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-4 sm:px-6 ${index !== history.length - 1 ? 'border-b border-[hsl(var(--border)/.65)]' : ''}`} data-testid={`row-history-${day.date}`}>
                  <div>
                    <p className="text-sm font-semibold">{formatHistoryDate(day.date)}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{day.isComplete ? 'A complete day' : 'A day in progress'}</p>
                  </div>
                  <p className="font-mono text-xs text-[hsl(var(--muted-foreground))]" data-testid={`text-history-count-${day.date}`}>{day.completedCount}/8</p>
                  <p className={`min-w-12 text-right font-mono text-xs ${day.isComplete ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`text-history-percentage-${day.date}`}>{day.percentage}%</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-surface flex min-h-[148px] items-center gap-5 border-dashed px-6 py-7 sm:px-8" data-testid="empty-history">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dashed border-[hsl(var(--primary)/.35)] text-[hsl(var(--primary))]">
                <CalendarDays className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <div>
                <p className="display-face text-lg font-semibold">Your first page is still open.</p>
                <p className="mt-1 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">Completed days will gather here quietly, without rankings or noise.</p>
              </div>
            </div>
          )}
        </section>

        <footer className="flex items-center justify-between border-t border-[hsl(var(--border)/.75)] py-6 text-xs text-[hsl(var(--muted-foreground))]">
          <span className="display-face text-sm font-semibold text-[hsl(var(--foreground))]">Mizan</span>
          <span>Kept on this device.</span>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
