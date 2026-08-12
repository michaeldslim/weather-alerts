import { AirQuality } from '../types/weather';
import { getAirQualityCategory } from '../utils/airQuality';

interface OpenMeteoAirQualityResponse {
  current: {
    us_aqi: number;
    pm2_5: number;
  };
}

export async function fetchAirQuality(
  latitude: number,
  longitude: number
): Promise<AirQuality | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'us_aqi,pm2_5',
    timezone: 'auto',
  });

  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`
    );

    if (!response.ok) {
      return null;
    }

    const data: OpenMeteoAirQualityResponse = await response.json();
    const aqi = Math.round(data.current.us_aqi);

    return {
      aqi,
      category: getAirQualityCategory(aqi),
      pm25: Math.round(data.current.pm2_5 * 10) / 10,
    };
  } catch {
    return null;
  }
}
