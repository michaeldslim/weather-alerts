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
  const desired = `${year}-${month}-${day}T${hour}:${minute}`;

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

  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(utcGuess)).map((part) => [part.type, part.value])
    );
    const formatted = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;

    if (formatted === desired) {
      return new Date(utcGuess);
    }

    const formattedMinutes =
      Number(parts.hour) * 60 + Number(parts.minute);
    const desiredMinutes = Number(hour) * 60 + Number(minute);
    utcGuess -= (formattedMinutes - desiredMinutes) * 60_000;
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
