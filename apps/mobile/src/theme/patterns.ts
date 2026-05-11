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
    capture: {
      backgroundColor: '#FFCF3F',
      borderColor: colors.navy,
      color: '#2D2200',
      shadow: '0 7px 0 rgba(7, 26, 61, 0.24)',
    },
    ghost: {
      backgroundColor: colors.surface,
      borderColor: colors.line,
      color: colors.ink,
      shadow: '0 4px 0 rgba(7, 26, 61, 0.08)',
    },
    rush: {
      backgroundColor: '#FF6B4A',
      borderColor: colors.navy,
      color: colors.surface,
      shadow: '0 5px 0 rgba(7, 26, 61, 0.18)',
    },
    danger: {
      backgroundColor: colors.dangerSoft,
      borderColor: colors.danger,
      color: colors.danger,
      shadow: '0 4px 0 rgba(7, 26, 61, 0.08)',
    },
    dangerStrong: {
      backgroundColor: colors.danger,
      borderColor: colors.navy,
      color: colors.surface,
      shadow: '0 5px 0 rgba(7, 26, 61, 0.18)',
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
      backgroundColor: 'rgba(190, 225, 255, 0.50)',
      borderColor: 'rgba(255, 255, 255, 0.90)',
      borderWidth: 1,
      radius: 24,
      shadow: 'inset 0 1px 0 rgba(255,255,255,0.90), 0 8px 32px rgba(7, 26, 61, 0.18)',
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
