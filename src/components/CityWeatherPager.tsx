import { ReactNode, useEffect, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { locationSourceCacheKey, LocationSource } from '../types/location';

interface CityWeatherPagerProps {
  rotation: LocationSource[];
  activeIndex: number;
  onPageIndexChange: (index: number) => void;
  renderPage: (source: LocationSource, index: number) => ReactNode;
}

export function CityWeatherPager({
  rotation,
  activeIndex,
  onPageIndexChange,
  renderPage,
}: CityWeatherPagerProps) {
  const listRef = useRef<FlatList<LocationSource>>(null);
  const pageWidth = Dimensions.get('window').width;
  const syncedIndexRef = useRef(activeIndex);

  useEffect(() => {
    if (rotation.length === 0 || syncedIndexRef.current === activeIndex) {
      return;
    }

    syncedIndexRef.current = activeIndex;
    listRef.current?.scrollToIndex({ index: activeIndex, animated: true });
  }, [activeIndex, rotation.length]);

  const handlePageSettled = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    if (index < 0 || index >= rotation.length || index === syncedIndexRef.current) {
      return;
    }

    syncedIndexRef.current = index;
    onPageIndexChange(index);
  };

  return (
    <FlatList
      ref={listRef}
      style={styles.list}
      data={rotation}
      horizontal
      pagingEnabled
      scrollEnabled={rotation.length > 1}
      showsHorizontalScrollIndicator={false}
      bounces={rotation.length > 1}
      keyExtractor={(source, index) => `${locationSourceCacheKey(source)}-${index}`}
      getItemLayout={(_, index) => ({
        length: pageWidth,
        offset: pageWidth * index,
        index,
      })}
      initialScrollIndex={Math.min(activeIndex, Math.max(rotation.length - 1, 0))}
      onScrollToIndexFailed={(info) => {
        listRef.current?.scrollToOffset({
          offset: info.averageItemLength * info.index,
          animated: false,
        });
      }}
      onMomentumScrollEnd={handlePageSettled}
      renderItem={({ item, index }) => (
        <View style={[styles.page, { width: pageWidth }]}>{renderPage(item, index)}</View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
