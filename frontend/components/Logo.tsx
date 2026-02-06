import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LogoProps {
  size?: number;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, color = '#FFF' }) => {
  // TO REPLACE WITH YOUR LOGO:
  // 1. Add your logo image to /app/frontend/assets/images/logo.png
  // 2. Uncomment the Image component below
  // 3. Comment out the MaterialIcons fallback

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* REPLACE THIS ICON WITH YOUR LOGO */}
      {/* Uncomment when you add your logo:
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.image}
        resizeMode="contain"
      />
      */}
      
      {/* Temporary icon - remove when you add your logo */}
      <MaterialIcons name="construction" size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});