import React, { useRef } from 'react';
import { TouchableOpacity, Animated, ViewStyle, TouchableOpacityProps } from 'react-native';
import { Animations } from '../constants/theme';

interface AnimatedTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  scaleValue?: number;
}

export const AnimatedTouchable: React.FC<AnimatedTouchableProps> = ({
  children,
  style,
  onPressIn,
  onPressOut,
  scaleValue = Animations.scale.pressed,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
      friction: 3,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
    onPressOut?.(e);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};