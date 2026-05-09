import { colors } from './colors';

export const patterns = {
  button: {
    primary: {
      backgroundColor: colors.pink,
      borderColor: colors.navy,
      color: colors.surface,
      shadow: '0 6px 0 rgba(7, 26, 61, 0.18)',
    },
    secondary: {
      backgroundColor: colors.esconde,
      borderColor: colors.navy,
      color: colors.navy,
      shadow: '0 6px 0 rgba(7, 26, 61, 0.18)',
    },
    ghost: {
      backgroundColor: colors.surface,
      borderColor: colors.line,
      color: colors.ink,
      shadow: '0 4px 0 rgba(7, 26, 61, 0.08)',
    },
    danger: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.danger,
      color: colors.danger,
      shadow: '0 4px 0 rgba(7, 26, 61, 0.08)',
    },
  },
  panel: {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
      borderColor: 'rgba(255, 255, 255, 0.92)',
      borderWidth: 2,
      radius: 20,
      shadow: '0 12px 0 rgba(7, 26, 61, 0.22)',
    },
    strong: {
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
      borderColor: 'rgba(255, 255, 255, 0.92)',
      borderWidth: 2,
      radius: 20,
      shadow: '0 12px 0 rgba(7, 26, 61, 0.22)',
    },
    sunny: {
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
      borderColor: 'rgba(255, 255, 255, 0.92)',
      borderWidth: 2,
      radius: 20,
      shadow: '0 12px 0 rgba(7, 26, 61, 0.22)',
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
      borderColor: 'rgba(255, 255, 255, 0.92)',
      borderWidth: 2,
      radius: 20,
      shadow: '0 12px 0 rgba(7, 26, 61, 0.22)',
    },
  },
  screen: {
    baseBackground: colors.background,
  },
  layout: {
    panelMaxWidth: 420,
    contentMaxWidth: 420,
  },
};
