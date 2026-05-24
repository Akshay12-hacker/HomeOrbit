import React from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

import {
  layout,
  spacing,
} from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

import PlotCard from './PlotCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(layout.carouselCard, SCREEN_WIDTH - 48);
const ITEM_GAP = spacing.md;

export default function PlotCarousel({
  plots = [],
  activeIndex = 0,
  onChange,
}) {
  const { colors } = useTheme();
  const scrollX = React.useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    container: {
      marginTop: -20,
      zIndex: 20,
    },
    content: {
      paddingHorizontal: spacing.screen,
      paddingVertical: spacing.sm,
    },
    cardWrap: {
      width: CARD_WIDTH,
      marginRight: ITEM_GAP,
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 7,
      backgroundColor: colors.surfaceDeep,
    },
    dotActive: {
      width: 24,
      backgroundColor: colors.primary,
    },
  });

  const handleMomentumEnd = React.useCallback(
    (event) => {
      const index = Math.round(
        event.nativeEvent.contentOffset.x / (CARD_WIDTH + ITEM_GAP)
      );

      onChange?.(index);
    },
    [onChange]
  );

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={plots}
        horizontal
        snapToInterval={CARD_WIDTH + ITEM_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + ITEM_GAP),
            index * (CARD_WIDTH + ITEM_GAP),
            (index + 1) * (CARD_WIDTH + ITEM_GAP),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.94, 1, 0.94],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.cardWrap,
                { transform: [{ scale }] },
              ]}
            >
              <PlotCard
                plot={item}
                index={index}
              />
            </Animated.View>
          );
        }}
      />

      {plots.length > 1 ? (
        <View style={styles.dots}>
          {plots.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
