import { useCallback, useEffect, useRef, useState } from 'react';
import { loadTemperatureUnit, saveTemperatureUnit } from '../services/preferencesStorage';
import { TemperatureUnit } from '../utils/temperature';

interface UseTemperatureUnitResult {
  unit: TemperatureUnit;
  toggleUnit: () => void;
}

export function useTemperatureUnit(
  defaultUnit: TemperatureUnit = 'F'
): UseTemperatureUnitResult {
  const [unit, setUnit] = useState<TemperatureUnit>(defaultUnit);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void loadTemperatureUnit().then((stored) => {
      if (cancelled || hydratedRef.current) {
        return;
      }

      if (stored) {
        setUnit(stored);
      }

      hydratedRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleUnit = useCallback(() => {
    hydratedRef.current = true;
    setUnit((prev) => {
      const next = prev === 'F' ? 'C' : 'F';
      void saveTemperatureUnit(next);
      return next;
    });
  }, []);

  return { unit, toggleUnit };
}
