import { useEffect, useState } from 'react';
import { formatLocalTime, msUntilNextMinuteInTimezone } from '../utils/localTime';

export function useLocalTime(timezone: string | undefined): string {
  const [localTime, setLocalTime] = useState(() =>
    timezone ? formatLocalTime(timezone) : ''
  );

  useEffect(() => {
    if (!timezone) {
      setLocalTime('');
      return;
    }

    const tick = () => {
      setLocalTime(formatLocalTime(timezone));
    };

    tick();

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, msUntilNextMinuteInTimezone(timezone));

    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [timezone]);

  return localTime;
}
