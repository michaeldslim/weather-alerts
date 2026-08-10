import { WeatherAlert, WeatherAlertSeverity } from '../types/alert';

const NWS_USER_AGENT = 'Weather Alerts/1.3.0 (com.mike008.weatheralerts)';

const SEVERITY_ORDER: Record<WeatherAlertSeverity, number> = {
  Extreme: 0,
  Severe: 1,
  Moderate: 2,
  Minor: 3,
  Unknown: 4,
};

interface NwsAlertProperties {
  id: string;
  event: string;
  headline: string;
  severity?: string;
  description?: string;
  areaDesc?: string;
  expires?: string;
}

interface NwsAlertsResponse {
  features?: Array<{
    properties: NwsAlertProperties;
  }>;
}

function normalizeSeverity(value?: string): WeatherAlertSeverity {
  switch (value) {
    case 'Extreme':
    case 'Severe':
    case 'Moderate':
    case 'Minor':
      return value;
    default:
      return 'Unknown';
  }
}

function mapNwsAlert(properties: NwsAlertProperties): WeatherAlert {
  return {
    id: properties.id,
    event: properties.event,
    headline: properties.headline,
    severity: normalizeSeverity(properties.severity),
    description: properties.description ?? '',
    areaDesc: properties.areaDesc ?? '',
    expires: properties.expires ?? '',
  };
}

export async function fetchWeatherAlerts(
  latitude: number,
  longitude: number
): Promise<WeatherAlert[]> {
  const params = new URLSearchParams({
    point: `${latitude},${longitude}`,
  });

  try {
    const response = await fetch(
      `https://api.weather.gov/alerts/active?${params.toString()}`,
      {
        headers: {
          Accept: 'application/geo+json',
          'User-Agent': NWS_USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data: NwsAlertsResponse = await response.json();
    const alerts = (data.features ?? []).map((feature) => mapNwsAlert(feature.properties));

    return alerts.sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    );
  } catch {
    return [];
  }
}
