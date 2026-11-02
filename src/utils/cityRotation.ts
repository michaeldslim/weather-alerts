import {
  locationSourcesEqual,
  LocationSource,
  SavedCity,
  savedCityToManualSource,
} from '../types/location';

/** Fixed swipe order: GPS, optional one-off manual city, then saved cities (newest first). */
export function buildCityRotation(
  savedCities: SavedCity[],
  activeSource?: LocationSource
): LocationSource[] {
  const manualSources = savedCities.map(savedCityToManualSource);
  const rotation: LocationSource[] = [{ type: 'gps' }];

  if (
    activeSource?.type === 'manual' &&
    !manualSources.some((source) => locationSourcesEqual(source, activeSource))
  ) {
    rotation.push(activeSource);
  }

  rotation.push(...manualSources);

  if (manualSources.length === 0 && activeSource?.type !== 'manual') {
    return [{ type: 'gps' }];
  }

  return rotation;
}

export function findRotationIndex(
  rotation: LocationSource[],
  activeSource: LocationSource
): number {
  const index = rotation.findIndex((source) => locationSourcesEqual(source, activeSource));
  return index >= 0 ? index : 0;
}
