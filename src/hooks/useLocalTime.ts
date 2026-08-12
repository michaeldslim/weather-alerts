import { useEffect, useState } from 'react';
import { formatLocalTime } from '../utils/localTime';

export function useLocalTime(timezone: string | undefined): string {
  const [localTime, setLocalTime] = useState(() =>
    timezone ? formatLocalTime(timezone) : ''
  );

  useEffect(() => {
    if (!timezone) {
      setLocalTime('');
      return;
    }

    setLocalTime(formatLocalTime(timezone));
    const timer = setInterval(() => {
      setLocalTime(formatLocalTime(timezone));
    }, 60_000);

    return () => clearInterval(timer);
  }, [timezone]);

  return localTime;
}
