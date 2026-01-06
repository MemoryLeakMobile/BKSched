import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedScreen: React.FC<AnimatedScreenProps> = ({ children, style }) => {
  const slideAnim = useRef(new Animated.Value(width)).current; // Start off-screen right

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE', // Match app background to avoid transparency issues
  },
});

export default AnimatedScreen;
