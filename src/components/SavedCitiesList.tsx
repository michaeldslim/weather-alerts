import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { reorderSavedCities } from '../services/savedCitiesStorage';
import { SavedCity } from '../types/location';
import { WeatherTheme } from '../utils/weatherTheme';

const ROW_HEIGHT = 49;

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
      onMoveShouldSetPanResponder: () => true,
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
          elevation: 2,
          backgroundColor: 'rgba(0,0,0,0.12)',
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
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${city.label}`}
      >
        <Text style={[styles.resultName, { color: theme.text }]} numberOfLines={1}>
          {city.label}
        </Text>
      </Pressable>
      <Pressable
        onPress={onRemove}
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
    dragOffset.setValue(0);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const moveDrag = (dy: number) => {
    const activeId = draggingIdRef.current;
    if (activeId === null) {
      return;
    }

    dragOffset.setValue(dy);
    setOrdered((prev) => {
      const from = prev.findIndex((city) => city.id === activeId);
      if (from < 0) {
        return prev;
      }

      const target = Math.max(
        0,
        Math.min(prev.length - 1, from + Math.round(dy / ROW_HEIGHT))
      );
      if (from === target) {
        return prev;
      }

      return reorderSavedCities(prev, from, target);
    });
  };

  const endDrag = () => {
    if (draggingIdRef.current !== null) {
      onReorder(orderedRef.current);
    }
    draggingIdRef.current = null;
    setDraggingId(null);
    dragOffset.setValue(0);
  };

  if (ordered.length === 0) {
    return null;
  }

  return (
    <View style={styles.savedSection}>
      <Text style={[styles.savedSectionTitle, { color: theme.text }]}>Saved cities</Text>
      <Text style={[styles.savedSectionHint, { color: theme.text }]}>
        Drag ≡ to reorder swipe order
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
    minHeight: ROW_HEIGHT,
  },
  dragHandle: {
    paddingVertical: 12,
    paddingRight: 8,
    paddingLeft: 2,
    justifyContent: 'center',
  },
  dragHandleIcon: {
    fontSize: 18,
    fontWeight: '700',
    opacity: 0.65,
  },
  savedRowMain: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.85,
  },
});