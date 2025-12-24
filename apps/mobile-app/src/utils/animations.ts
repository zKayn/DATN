import { Animated } from 'react-native';

/**
 * Animation timing constants
 * Based on Nike/Adidas design system for smooth, responsive interactions
 */
export const ANIMATION_TIMING = {
  fast: 200,
  medium: 350,
  slow: 500,
};

/**
 * Spring animation configuration
 * Provides natural, bouncy feel similar to Nike app interactions
 */
export const SPRING_CONFIG = {
  tension: 40,
  friction: 7,
  useNativeDriver: true,
};

/**
 * Create a fade-in animation
 * @param animValue - Animated.Value to animate
 * @param delay - Optional delay before animation starts (ms)
 * @param duration - Animation duration (ms)
 * @returns Animated.CompositeAnimation
 */
export const createFadeIn = (
  animValue: Animated.Value,
  delay = 0,
  duration = ANIMATION_TIMING.medium
): Animated.CompositeAnimation => {
  return Animated.timing(animValue, {
    toValue: 1,
    duration,
    delay,
    useNativeDriver: true,
  });
};

/**
 * Create a fade-out animation
 * @param animValue - Animated.Value to animate
 * @param duration - Animation duration (ms)
 * @returns Animated.CompositeAnimation
 */
export const createFadeOut = (
  animValue: Animated.Value,
  duration = ANIMATION_TIMING.medium
): Animated.CompositeAnimation => {
  return Animated.timing(animValue, {
    toValue: 0,
    duration,
    useNativeDriver: true,
  });
};

/**
 * Create scale press animations (in/out)
 * Used for touchable feedback similar to Nike app buttons
 * @param animValue - Animated.Value to animate
 * @param scaleValue - Target scale value (default: 0.95)
 * @returns Object with 'in' and 'out' animations
 */
export const createScalePress = (
  animValue: Animated.Value,
  scaleValue = 0.95
) => {
  return {
    in: Animated.spring(animValue, {
      toValue: scaleValue,
      ...SPRING_CONFIG,
    }),
    out: Animated.spring(animValue, {
      toValue: 1,
      ...SPRING_CONFIG,
    }),
  };
};

/**
 * Create slide-up animation
 * @param animValue - Animated.Value to animate
 * @param delay - Optional delay before animation starts (ms)
 * @param distance - Distance to slide up (default: 30)
 * @returns Animated.CompositeAnimation
 */
export const createSlideUp = (
  animValue: Animated.Value,
  delay = 0,
  distance = 30
): Animated.CompositeAnimation => {
  return Animated.timing(animValue, {
    toValue: 0,
    duration: ANIMATION_TIMING.medium,
    delay,
    useNativeDriver: true,
  });
};

/**
 * Create staggered animations for lists
 * @param animations - Array of animations to stagger
 * @param staggerTime - Time between each animation (ms)
 * @returns Animated.CompositeAnimation
 */
export const createStaggered = (
  animations: Animated.CompositeAnimation[],
  staggerTime = 100
): Animated.CompositeAnimation => {
  return Animated.stagger(staggerTime, animations);
};

/**
 * Create parallax interpolation
 * @param scrollY - Animated scroll value
 * @param inputRange - Input range for interpolation
 * @param outputRange - Output range for interpolation
 * @returns Animated.AnimatedInterpolation
 */
export const createParallax = (
  scrollY: Animated.Value,
  inputRange: number[],
  outputRange: number[]
) => {
  return scrollY.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};

/**
 * Create opacity interpolation based on scroll
 * @param scrollY - Animated scroll value
 * @param fadeStart - Scroll position where fade starts
 * @param fadeEnd - Scroll position where fade ends
 * @returns Animated.AnimatedInterpolation
 */
export const createScrollFade = (
  scrollY: Animated.Value,
  fadeStart: number,
  fadeEnd: number
) => {
  return scrollY.interpolate({
    inputRange: [fadeStart, fadeEnd],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
};

/**
 * Initialize animation values for a component
 * @param count - Number of animation values to create
 * @param initialValue - Initial value for each Animated.Value
 * @returns Array of Animated.Value
 */
export const initAnimationValues = (
  count: number,
  initialValue = 0
): Animated.Value[] => {
  return Array.from({ length: count }, () => new Animated.Value(initialValue));
};

/**
 * Run animations in parallel
 * @param animations - Array of animations to run in parallel
 * @returns Animated.CompositeAnimation
 */
export const runParallel = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

/**
 * Run animations in sequence
 * @param animations - Array of animations to run in sequence
 * @returns Animated.CompositeAnimation
 */
export const runSequence = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

/**
 * Create loop animation
 * @param animation - Animation to loop
 * @param iterations - Number of iterations (-1 for infinite)
 * @returns Animated.CompositeAnimation
 */
export const createLoop = (
  animation: Animated.CompositeAnimation,
  iterations = -1
): Animated.CompositeAnimation => {
  return Animated.loop(animation, { iterations });
};
