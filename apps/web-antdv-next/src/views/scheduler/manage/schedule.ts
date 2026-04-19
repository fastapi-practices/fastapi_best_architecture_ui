import type { TaskSchedulerResult } from '#/api';

import { Cron } from 'croner';

const periodLabelMap: Record<string, string> = {
  days: '天',
  hours: '小时',
  minutes: '分钟',
  seconds: '秒',
};

const periodToSeconds: Record<string, number> = {
  days: 86_400,
  hours: 3600,
  minutes: 60,
  seconds: 1,
};

function getScheduleLabel(row: TaskSchedulerResult): string {
  if (row.type === 0) {
    const label =
      periodLabelMap[row.interval_period || 'seconds'] || row.interval_period;
    return `每 ${row.interval_every || '?'} ${label}`;
  }
  return row.crontab || '';
}

function getNextRuns(row: TaskSchedulerResult): Date[] {
  try {
    if (row.type === 0) {
      const every = row.interval_every;
      const period = row.interval_period || 'seconds';
      if (!every || every <= 0) return [];
      const intervalMs = every * (periodToSeconds[period] || 1) * 1000;
      const baseTime = row.last_run_time
        ? new Date(row.last_run_time)
        : new Date();
      return Array.from(
        { length: 5 },
        (_, i) => new Date(baseTime.getTime() + intervalMs * (i + 1)),
      );
    }
    if (!row.crontab) return [];
    return new Cron(row.crontab).nextRuns(5);
  } catch {
    return [];
  }
}

export { getNextRuns, getScheduleLabel };
