import React from 'react';
import {
  Text,
  View,
} from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../../theme';

export default function Badge({
  label,
  type = 'info',
}) {
  const types = {
    paid: { bg: colors.successLight, text: colors.successDark },
    success: { bg: colors.successLight, text: colors.successDark },
    pending: { bg: colors.warningLight, text: colors.warning },
    failed: { bg: colors.errorLight, text: colors.error },
    danger: { bg: colors.errorLight, text: colors.error },
    info: { bg: colors.infoLight, text: colors.primary },
    new: { bg: colors.accentLight, text: colors.accent },
  };

  const current = types[type] || types.info;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: current.bg,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: `${current.text}22`,
      }}
    >
      <Text
        style={[
          typography.label,
          {
            color: current.text,
            fontSize: 10,
            lineHeight: 14,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
