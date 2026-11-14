export function getTimezoneCalendarDateKey(timezone: string, date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Open-Meteo local ISO timestamps (no offset) → UTC instant for the city's wall clock. */
export function parseOpenMeteoLocalTime(isoLocal: string, timeZone: string): Date {
  if (/[Zz]|[+-]\d{2}:\d{2}$/.test(isoLocal)) {
    return new Date(isoLocal);
  }

  const normalized = isoLocal.length === 10 ? `${isoLocal}T12:00` : isoLocal;
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    return new Date(isoLocal);
  }

  const [, year, month, day, hour, minute] = match;

  let utcGuess = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const desiredYear = Number(year);
  const desiredMonth = Number(month);
  const desiredDay = Number(day);
  const desiredHour = Number(hour);
  const desiredMinute = Number(minute);
  const desiredLocalMs = Date.UTC(
    desiredYear,
    desiredMonth - 1,
    desiredDay,
    desiredHour,
    desiredMinute
  );

  for (let attempt = 0; attempt < 6; attempt++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(utcGuess)).map((part) => [part.type, part.value])
    );
    const formattedYear = Number(parts.year);
    const formattedMonth = Number(parts.month);
    const formattedDay = Number(parts.day);
    let formattedHour = Number(parts.hour);
    if (formattedHour === 24) {
      formattedHour = 0;
    }
    const formattedMinute = Number(parts.minute);

    if (
      formattedYear === desiredYear &&
      formattedMonth === desiredMonth &&
      formattedDay === desiredDay &&
      formattedHour === desiredHour &&
      formattedMinute === desiredMinute
    ) {
      return new Date(utcGuess);
    }

    const formattedLocalMs = Date.UTC(
      formattedYear,
      formattedMonth - 1,
      formattedDay,
      formattedHour,
      formattedMinute
    );
    utcGuess -= formattedLocalMs - desiredLocalMs;
  }

  return new Date(utcGuess);
}

/** Milliseconds until the next `:00` second in `timezone` (for minute-aligned clock ticks). */
export function msUntilNextMinuteInTimezone(timezone: string, date = new Date()): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      second: 'numeric',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  const second = Number(parts.second ?? 0);
  return Math.max(0, (60 - second) * 1000 - date.getMilliseconds());
}

/** City local date and clock in the city's timezone (e.g. `Nov 1 · 3:45 PM`). */
export function formatLocalTime(timezone: string, date = new Date()): string {
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(date);

  return `${dateLabel} · ${time}`;
}
