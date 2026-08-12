function getDeviceCalendarDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTimezoneCalendarDateKey(timezone: string, date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** City local clock; adds a date prefix when their calendar day differs from the device. */
export function formatLocalTime(timezone: string, date = new Date()): string {
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);

  const cityDate = getTimezoneCalendarDateKey(timezone, date);
  const deviceDate = getDeviceCalendarDateKey(date);

  if (cityDate === deviceDate) {
    return time;
  }

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(date);

  return `${dateLabel} · ${time}`;
}
