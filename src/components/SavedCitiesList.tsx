import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { reorderSavedCities } from '../services/savedCitiesStorage';
import { SavedCity } from '../types/location';
import { WeatherTheme } from '../utils/weatherTheme';

const ROW_HEIGHT = 48;
/** Swap with neighbor after dragging this fraction of a row (lower = less finger travel). */
const SWAP_THRESHOLD = ROW_HEIGHT * 0.34;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function citiesOrderKey(cities: SavedCity[]): string {
  return cities.map((city) => city.id).join(',');
}

function applyAdjacentSwaps(
  cities: SavedCity[],
  draggingId: number,
  gestureDy: number
): { cities: SavedCity[]; visualDy: number } {
  let list = cities;
  let from = list.findIndex((city) => city.id === draggingId);
  if (from < 0) {
    return { cities: list, visualDy: gestureDy };
  }

  let visualDy = gestureDy;
  let changed = false;

  while (visualDy > SWAP_THRESHOLD && from < list.length - 1) {
    list = reorderSavedCities(list, from, from + 1);
    visualDy -= ROW_HEIGHT;
    from += 1;
    changed = true;
  }

  while (visualDy < -SWAP_THRESHOLD && from > 0) {
    list = reorderSavedCities(list, from, from - 1);
    visualDy += ROW_HEIGHT;
    from -= 1;
    changed = true;
  }

  if (!changed) {
    return { cities: list, visualDy };
  }

  return { cities: list, visualDy };
}

interface SavedCitiesListProps {
  cities: SavedCity[];
  theme: WeatherTheme;
  onSelectCity: (city: SavedCity) => void;
  onRemoveCity: (city: SavedCity) => void;
  onReorder: (cities: SavedCity[]) => void;
}

interface SavedCityRowProps {
  city: SavedCity;
  theme: WeatherTheme;
  isDragging: boolean;
  dragOffset: Animated.Value;
  onSelect: () => void;
  onRemove: () => void;
  onDragGrant: () => void;
  onDragMove: (dy: number) => void;
  onDragEnd: () => void;
}

function SavedCityRow({
  city,
  theme,
  isDragging,
  dragOffset,
  onSelect,
  onRemove,
  onDragGrant,
  onDragMove,
  onDragEnd,
}: SavedCityRowProps) {
  const dragHandlersRef = useRef({ onDragGrant, onDragMove, onDragEnd });
  dragHandlersRef.current = { onDragGrant, onDragMove, onDragEnd };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 2 || Math.abs(gesture.dx) < Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        dragHandlersRef.current.onDragGrant();
      },
      onPanResponderMove: (_, gesture) => {
        dragHandlersRef.current.onDragMove(gesture.dy);
      },
      onPanResponderRelease: () => {
        dragHandlersRef.current.onDragEnd();
      },
      onPanResponderTerminate: () => {
        dragHandlersRef.current.onDragEnd();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.savedRow,
        { borderBottomColor: 'rgba(255,255,255,0.15)' },
        isDragging && {
          transform: [{ translateY: dragOffset }],
          zIndex: 2,
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          backgroundColor: 'rgba(0,0,0,0.15)',
        },
      ]}
    >
      <View
        {...panResponder.panHandlers}
        style={styles.dragHandle}
        accessibilityRole="adjustable"
        accessibilityLabel={`Reorder ${city.label}`}
        accessibilityHint="Drag up or down to change order"
      >
        <Text style={[styles.dragHandleIcon, { color: theme.text }]}>≡</Text>
      </View>
      <Pressable
        style={styles.savedRowMain}
        onPress={onSelect}
        disabled={isDragging}
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${city.label}`}
      >
        <Text style={[styles.resultName, { color: theme.text }]} numberOfLines={1}>
          {city.label}
        </Text>
      </Pressable>
      <Pressable
        onPress={onRemove}
        disabled={isDragging}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${city.label}`}
      >
        <Text style={[styles.removeText, { color: theme.text }]}>Remove</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SavedCitiesList({
  cities,
  theme,
  onSelectCity,
  onRemoveCity,
  onReorder,
}: SavedCitiesListProps) {
  const [ordered, setOrdered] = useState(cities);
  const orderedRef = useRef(cities);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const draggingIdRef = useRef<number | null>(null);
  const dragOffset = useRef(new Animated.Value(0)).current;
  const orderKeyDuringDragRef = useRef('');

  useEffect(() => {
    orderedRef.current = ordered;
  }, [ordered]);

  useEffect(() => {
    if (draggingId === null) {
      setOrdered(cities);
      orderedRef.current = cities;
    }
  }, [cities, draggingId]);

  const beginDrag = (cityId: number) => {
    draggingIdRef.current = cityId;
    setDraggingId(cityId);
    orderKeyDuringDragRef.current = citiesOrderKey(orderedRef.current);
    dragOffset.setValue(0);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const moveDrag = (dy: number) => {
    const activeId = draggingIdRef.current;
    if (activeId === null) {
      return;
    }

    const { cities: nextList, visualDy } = applyAdjacentSwaps(
      orderedRef.current,
      activeId,
      dy
    );

    dragOffset.setValue(visualDy);

    const nextKey = citiesOrderKey(nextList);
    if (nextKey !== orderKeyDuringDragRef.current) {
      orderKeyDuringDragRef.current = nextKey;
      LayoutAnimation.configureNext({
        duration: 180,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'easeInEaseOut' },
        delete: { type: 'easeInEaseOut', property: 'opacity' },
      });
      setOrdered(nextList);
      void Haptics.selectionAsync();
    }
  };

  const endDrag = () => {
    if (draggingIdRef.current === null) {
      return;
    }

    const finalize = () => {
      onReorder(orderedRef.current);
      draggingIdRef.current = null;
      setDraggingId(null);
      dragOffset.setValue(0);
    };

    Animated.spring(dragOffset, {
      toValue: 0,
      useNativeDriver: true,
      tension: 280,
      friction: 22,
    }).start(({ finished }) => {
      if (finished) {
        finalize();
      }
    });
  };

  if (ordered.length === 0) {
    return null;
  }

  return (
    <View style={styles.savedSection}>
      <Text style={[styles.savedSectionTitle, { color: theme.text }]}>Saved cities</Text>
      <Text style={[styles.savedSectionHint, { color: theme.text }]}>
        Drag ≡ up or down to reorder
      </Text>
      {ordered.map((city) => (
        <SavedCityRow
          key={city.id}
          city={city}
          theme={theme}
          isDragging={draggingId === city.id}
          dragOffset={dragOffset}
          onSelect={() => onSelectCity(city)}
          onRemove={() => onRemoveCity(city)}
          onDragGrant={() => beginDrag(city.id)}
          onDragMove={moveDrag}
          onDragEnd={endDrag}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  savedSection: {
    marginBottom: 8,
    maxHeight: 280,
  },
  savedSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.75,
    marginBottom: 2,
  },
  savedSectionHint: {
    fontSize: 12,
    opacity: 0.55,
    marginBottom: 4,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: ROW_HEIGHT,
  },
  dragHandle: {
    height: ROW_HEIGHT,
    minWidth: 36,
    paddingRight: 8,
    paddingLeft: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandleIcon: {
    fontSize: 18,
    fontWeight: '700',
    opacity: 0.65,
  },
  savedRowMain: {
    flex: 1,
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingRight: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
  },
});