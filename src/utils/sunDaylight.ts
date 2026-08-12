function formatDurationMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatDaylightDuration(daylightMinutes: number): string {
  return formatDurationMinutes(daylightMinutes);
}

export function formatTimeInTimezone(isoTime: string, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(isoTime));
}

export function buildSunStatus(
  sunrise: string,
  sunset: string,
  nextSunrise: string | null,
  now = Date.now()
): string {
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();

  if (now < sunriseMs) {
    return `Sunrise in ${formatDurationMinutes(Math.round((sunriseMs - now) / 60_000))}`;
  }

  if (now < sunsetMs) {
    return `Dark in ${formatDurationMinutes(Math.round((sunsetMs - now) / 60_000))}`;
  }

  if (nextSunrise) {
    const nextSunriseMs = new Date(nextSunrise).getTime();
    return `Sunrise in ${formatDurationMinutes(Math.round((nextSunriseMs - now) / 60_000))}`;
  }

  return '';
}

export function computeDaylightMinutes(sunrise: string, sunset: string): number {
  const durationMs = new Date(sunset).getTime() - new Date(sunrise).getTime();
  return Math.max(0, Math.round(durationMs / 60_000));
}
