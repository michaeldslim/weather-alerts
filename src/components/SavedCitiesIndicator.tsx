import { StyleSheet, View } from 'react-native';

interface SavedCitiesIndicatorProps {
  count: number;
  activeIndex: number;
  accentColor: string;
}

export function SavedCitiesIndicator({
  count,
  activeIndex,
  accentColor,
}: SavedCitiesIndicatorProps) {
  if (count <= 1) {
    return null;
  }

  return (
    <View style={styles.row} accessibilityLabel={`City ${activeIndex + 1} of ${count}`}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex
              ? { backgroundColor: accentColor, opacity: 1 }
              : { backgroundColor: accentColor, opacity: 0.35 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
