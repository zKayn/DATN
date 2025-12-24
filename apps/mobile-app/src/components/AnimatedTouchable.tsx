import React, { useRef } from 'react';
import { Animated, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { SPRING_CONFIG } from '../utils/animations';

interface AnimatedTouchableProps extends TouchableOpacityProps {
  /**
   * Target scale value when pressed (default: 0.95)
   * Lower values = more compression
   */
  scaleValue?: number;
  /**
   * Children components to render inside touchable
   */
  children: React.ReactNode;
  /**
   * Optional style for the animated view
   */
  style?: ViewStyle | ViewStyle[];
}

/**
 * AnimatedTouchable Component
 *
 * Provides Nike/Adidas-style press feedback with scale animation
 * Uses spring animation for natural, bouncy feel
 *
 * @example
 * <AnimatedTouchable onPress={handlePress} scaleValue={0.92}>
 *   <View style={styles.button}>
 *     <Text>Press Me</Text>
 *   </View>
 * </AnimatedTouchable>
 */
const AnimatedTouchable: React.FC<AnimatedTouchableProps> = ({
  scaleValue = 0.95,
  children,
  style,
  onPressIn,
  onPressOut,
  activeOpacity = 0.9,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    // Animate scale down when pressed
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      ...SPRING_CONFIG,
    }).start();

    // Call original onPressIn if provided
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    // Animate scale back to normal when released
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...SPRING_CONFIG,
    }).start();

    // Call original onPressOut if provided
    onPressOut?.(e);
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedTouchable;
