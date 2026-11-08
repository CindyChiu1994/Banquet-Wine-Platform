const taipeiCalendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
});

// Shift calendar dates rather than elapsed hours or the device's local date.
export function taipeiDateAfter(days: number, now = new Date()): string {
  const parts = taipeiCalendar.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(p => p.type === type)!.value);
  const date = new Date(0);
  date.setUTCFullYear(part('year'), part('month') - 1, part('day'));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const earliestBanquetDateTime = (now = new Date()) => taipeiDateAfter(3, now) + 'T00:00';

export function validateNewRequestDate(value: string, now = new Date()): void {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('請填寫有效的宴客日期與時間');
  const [, y, m, d, h, minute] = match.map(Number);
  const parsed = new Date(0);
  parsed.setUTCFullYear(y, m - 1, d);
  parsed.setUTCHours(h, minute, 0, 0);
  if (y < 1 || parsed.getUTCFullYear() !== y || parsed.getUTCMonth() !== m - 1 ||
      parsed.getUTCDate() !== d || parsed.getUTCHours() !== h || parsed.getUTCMinutes() !== minute) {
    throw new Error('請填寫有效的宴客日期與時間');
  }
  const minimum = earliestBanquetDateTime(now);
  if (value < minimum) {
    throw new Error(`宴客日期至少須提前三個日曆日，最早可選 ${minimum.replace('T', ' ')}（Asia/Taipei）`);
  }
}
