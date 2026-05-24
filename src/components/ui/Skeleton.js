import React from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
} from '../../theme';

import Card from './Card';

export const Skeleton = ({
  width,
  height,
  borderRadius = radius.sm,
  style,
}) => {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export default Skeleton;

export const SkeletonCard = () => (
  <Card style={styles.card}>
    <View style={styles.row}>
      <Skeleton
        width={46}
        height={46}
        borderRadius={radius.md}
      />

      <View style={styles.content}>
        <Skeleton
          width="72%"
          height={14}
        />

        <Skeleton
          width="46%"
          height={12}
        />
      </View>

      <Skeleton
        width={64}
        height={24}
        borderRadius={radius.full}
      />
    </View>
  </Card>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.skeleton,
  },
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
});
