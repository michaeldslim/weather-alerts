import { useEffect, useState } from 'react';
import { WeatherData } from '../types/weather';
import { isCurrentlyDaylight, resolveIsDayForWeather } from '../utils/sunDaylight';

export function useCityDaylight(weather: WeatherData | null): boolean {
  const [isDay, setIsDay] = useState(() =>
    weather ? resolveIsDayForWeather(weather) : true
  );

  useEffect(() => {
    if (!weather) {
      setIsDay(true);
      return;
    }

    const update = () => {
      setIsDay(resolveIsDayForWeather(weather));
    };

    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [weather]);

  return isDay;
}
