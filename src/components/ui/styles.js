import { StyleSheet } from 'react-native';

import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '../../theme';

export const uiStyles = StyleSheet.create({
  btn: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  btnSmall: {
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  btnText: {
    ...typography.button,
    color: colors.textOnDark,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    ...shadows.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.body2,
  },
});
