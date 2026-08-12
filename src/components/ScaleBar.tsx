import { StyleSheet, View } from 'react-native';

export interface ScaleSegment {
  upTo: number;
  color: string;
}

interface ScaleBarProps {
  value: number;
  max: number;
  segments: ScaleSegment[];
  markerColor?: string;
}

export function ScaleBar({
  value,
  max,
  segments,
  markerColor = '#FFFFFF',
}: ScaleBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const markerPercent = max > 0 ? (clamped / max) * 100 : 0;

  let segmentStart = 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View style={styles.segmentsRow}>
          {segments.map((segment, index) => {
            const widthPercent = ((segment.upTo - segmentStart) / max) * 100;
            segmentStart = segment.upTo;
            return (
              <View
                key={index}
                style={[styles.segment, { width: `${widthPercent}%`, backgroundColor: segment.color }]}
              />
            );
          })}
        </View>
        <View
          style={[
            styles.marker,
            { left: `${markerPercent}%`, backgroundColor: markerColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'visible',
    justifyContent: 'center',
  },
  segmentsRow: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: 4,
    height: 16,
    borderRadius: 2,
    marginLeft: -2,
    top: -3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 2,
  },
});
