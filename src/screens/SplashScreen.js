import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { COLORS, FONTS, SPACING } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;
const SLIDE_HEIGHT = Math.min(550, Math.max(1000, SCREEN_HEIGHT * 0.46));

const splashSlides = [
  {
    id: 'property',
    title: 'Find your next home',
    subtitle: 'Explore well-managed apartments and society details in one calm place.',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'community',
    title: 'Stay close to your society',
    subtitle: 'Track updates, maintenance, receipts, and resident activity with less effort.',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'payments',
    title: 'Manage payments clearly',
    subtitle: 'Keep expenses, dues, and society funds organized from the first tap.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const sliderRef = React.useRef(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.92)).current;
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [activeSlide, setActiveSlide] = React.useState(0);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, navigation, scaleAnim]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      const nextSlide = (activeSlide + 1) % splashSlides.length;
      sliderRef.current?.scrollToIndex({ index: nextSlide, animated: true });
      setActiveSlide(nextSlide);
    }, 3600);

    return () => clearInterval(intervalId);
  }, [activeSlide]);

  const handleGetStarted = React.useCallback(() => {
    navigation.replace('Login');
  }, [navigation]);

  const handleMomentumEnd = React.useCallback((event) => {
    const nextSlide = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    setActiveSlide(nextSlide);
  }, []);

  const renderSlide = React.useCallback(({ item }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.slideImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(8,21,64,0.88)']}
        style={styles.imageShade}
      />
      <View style={styles.slideCopy}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </View>
    </View>
  ), []);

  return (
    <LinearGradient
      colors={[COLORS.navyDark, COLORS.navy, COLORS.navyLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >

          <Animated.FlatList
            ref={sliderRef}
            data={splashSlides}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            snapToInterval={SLIDE_WIDTH}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={handleMomentumEnd}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: SLIDE_WIDTH,
              offset: SLIDE_WIDTH * index,
              index,
            })}
          />
          <View style={styles.dots}>
            {splashSlides.map((slide, index) => {
              const inputRange = [
                (index - 1) * SLIDE_WIDTH,
                index * SLIDE_WIDTH,
                (index + 1) * SLIDE_WIDTH,
              ];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const dotOpacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.45, 1, 0.45],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={slide.id}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity: activeSlide === index ? 1 : dotOpacity,
                    },
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + SPACING.xl,
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.welcome}>Welcome to HomeOrbit</Text>
        <Button
          title="Let's get started"
          onPress={handleGetStarted}
          variant="accent"
          style={styles.cta}
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop: 76,
    paddingBottom: 210,
  },
  hero: {
    width: SLIDE_WIDTH,
    alignItems: 'center',
  },
  slide: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  slideImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
  },
  slideCopy: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.lg,
  },
  slideTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    lineHeight: 34,
  },
  slideSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: FONTS.sizes.base,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  dot: {
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  welcome: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  cta: {
    width: '100%',
    marginTop: SPACING.lg,
  },
});
