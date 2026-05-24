import React from 'react';
import {
  TouchableOpacity,
  View,
} from 'react-native';

import { uiStyles } from './styles';

import { useTheme } from '../../theme/ThemeContext';

export default function Card({
  children,
  style,
  onPress,
  noPad = false,
}) {
  const { colors } = useTheme();
  
  const content = (
    <View
      style={[
        uiStyles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        noPad && { padding: 0 },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
    >
      {content}
    </TouchableOpacity>
  );
}
