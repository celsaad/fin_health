import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getCategoryIcon } from '../constants/icons';
import { CategoryColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryIconProps {
  icon?: string | null;
  color?: string | null;
  size?: number;
}

export default function CategoryIcon({ icon, color, size = 40 }: CategoryIconProps) {
  const { isDark } = useTheme();
  const IconComponent = getCategoryIcon(icon);

  const colorConfig = color && CategoryColors[color]
    ? CategoryColors[color]
    : { icon: '#6b7280', bgLight: '#f3f4f6', bgDark: '#374151' };

  const bgColor = isDark ? colorConfig.bgDark : colorConfig.bgLight;
  const iconSize = size * 0.5;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <IconComponent size={iconSize} color={colorConfig.icon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
