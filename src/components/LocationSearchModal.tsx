import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchCities } from '../services/geocodingApi';
import { LocationResult } from '../types/location';
import { WeatherTheme } from '../utils/weatherTheme';

interface LocationSearchModalProps {
  visible: boolean;
  theme: WeatherTheme;
  onClose: () => void;
  onSelect: (location: LocationResult) => void;
  onUseCurrentLocation: () => void;
}

export function LocationSearchModal({
  visible,
  theme,
  onClose,
  onSelect,
  onUseCurrentLocation,
}: LocationSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setSearchError(null);
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const cities = await searchCities(query);
        setResults(cities);
      } catch {
        setSearchError('Failed to search cities');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, visible]);

  const handleSelect = (location: LocationResult) => {
    onSelect(location);
    onClose();
  };

  const handleUseCurrentLocation = () => {
    onUseCurrentLocation();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaProvider>
        <LocationSearchSheet
          theme={theme}
          query={query}
          setQuery={setQuery}
          results={results}
          searching={searching}
          searchError={searchError}
          onClose={onClose}
          onSelect={handleSelect}
          onUseCurrentLocation={handleUseCurrentLocation}
        />
      </SafeAreaProvider>
    </Modal>
  );
}

interface LocationSearchSheetProps {
  theme: WeatherTheme;
  query: string;
  setQuery: (value: string) => void;
  results: LocationResult[];
  searching: boolean;
  searchError: string | null;
  onClose: () => void;
  onSelect: (location: LocationResult) => void;
  onUseCurrentLocation: () => void;
}

function LocationSearchSheet({
  theme,
  query,
  setQuery,
  results,
  searching,
  searchError,
  onClose,
  onSelect,
  onUseCurrentLocation,
}: LocationSearchSheetProps) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const listMaxHeight = keyboardHeight > 0 ? 140 : 260;

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.gradient[0],
            paddingBottom: 20 + insets.bottom,
            marginBottom: Math.max(keyboardHeight - insets.bottom, 0),
          },
        ]}
      >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Search City</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={[styles.close, { color: theme.text }]}>Close</Text>
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Enter city name..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            style={[styles.input, { color: theme.text, borderColor: 'rgba(255,255,255,0.2)' }]}
            autoCorrect={false}
            autoCapitalize="words"
          />

          {searching && (
            <ActivityIndicator style={styles.loader} color={theme.text} />
          )}

          {searchError && (
            <Text style={[styles.message, { color: theme.text }]}>{searchError}</Text>
          )}

          {!searching && query.trim().length >= 2 && results.length === 0 && !searchError && (
            <Text style={[styles.message, { color: theme.text }]}>No cities found</Text>
          )}

          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            style={[styles.list, { maxHeight: listMaxHeight }]}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={[styles.resultRow, { borderBottomColor: 'rgba(255,255,255,0.15)' }]}
              >
                <Text style={[styles.resultName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.resultMeta, { color: theme.text }]}>
                  {item.admin1 ? `${item.admin1}, ` : ''}
                  {item.country}
                </Text>
              </Pressable>
            )}
          />

          <Pressable
            onPress={onUseCurrentLocation}
            style={[styles.currentLocationButton, { backgroundColor: theme.cardBackground }]}
          >
            <Text style={[styles.currentLocationText, { color: theme.text }]}>
              Use current location
            </Text>
          </Pressable>
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  close: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  loader: {
    marginVertical: 12,
  },
  message: {
    textAlign: 'center',
    opacity: 0.8,
    marginVertical: 12,
  },
  list: {
    flexGrow: 0,
    maxHeight: 260,
  },
  resultRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultMeta: {
    fontSize: 13,
    opacity: 0.75,
  },
  currentLocationButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
