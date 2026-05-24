import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';

import { markOnboardingSeen } from '../../storage/appStorage';
import { shadows, spacing, radius, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Modern Society\nManagement',
    subtitle: 'Manage your community with ease. Track maintenance, digital receipts, and stay updated with official notices.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000',
    accent: '#4F46E5',
  },
  {
    id: '2',
    title: 'Secure Digital\nPayments',
    subtitle: 'Instant payment verification for society dues. Secure, transparent, and always available at your fingertips.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000',
    accent: '#10B981',
  },
  {
    id: '3',
    title: 'Stay Connected\nAlways',
    subtitle: 'Instant alerts for society events and critical updates. Your community is now just a tap away.',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000',
    accent: '#F5A623',
  },
];

const Slide = ({ slide, index, scrollX, colors }) => {
  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [1.2, 1, 1.2],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 0.5) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.5) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolate.CLAMP
    );
    const translateY = interpolate(
      scrollX.value,
      [(index - 0.5) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 0.5) * SCREEN_WIDTH],
      [40, 0, 40],
      Extrapolate.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[StyleSheet.absoluteFill, imageStyle]}>
        <Image source={{ uri: slide.image }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(2,6,23,0.3)', 'rgba(2,6,23,0.95)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View style={[styles.content, contentStyle]}>
        <View style={[styles.accentBar, { backgroundColor: slide.accent }]} />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>
    </View>
  );
};

export default function OnboardingScreen({ navigation }) {
  const { colors } = useTheme();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / SCREEN_WIDTH);
      // Run on JS thread
    }
  });

  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: SCREEN_WIDTH * (currentIndex + 1),
        animated: true,
      });
    } else {
      await markOnboardingSeen();
      navigation.replace('Auth');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {SLIDES.map((slide, index) => (
          <Slide key={slide.id} slide={slide} index={index} scrollX={scrollX} colors={colors} />
        ))}
      </Animated.ScrollView>

      {/* FOOTER OVERLAY */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const dotStyle = useAnimatedStyle(() => {
              const width = interpolate(
                scrollX.value,
                [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
                [10, 24, 10],
                Extrapolate.CLAMP
              );
              const opacity = interpolate(
                scrollX.value,
                [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
                [0.4, 1, 0.4],
                Extrapolate.CLAMP
              );
              return { width, opacity };
            });

            return <Animated.View key={index} style={[styles.dot, dotStyle]} />;
          })}
        </View>

        <TouchableOpacity 
          activeOpacity={0.85} 
          onPress={handleNext}
          style={[styles.nextBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'GET STARTED' : 'CONTINUE'}
          </Text>
        </TouchableOpacity>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity 
            onPress={async () => {
              await markOnboardingSeen();
              navigation.replace('Auth');
            }}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>SKIP TOUR</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  pager: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 32,
    paddingBottom: SCREEN_HEIGHT * 0.28,
  },
  accentBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginTop: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  pagination: {
    flexDirection: 'row',
    height: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  nextBtn: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  skipBtn: {
    marginTop: 24,
    padding: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
