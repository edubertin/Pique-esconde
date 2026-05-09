import { colors } from './colors';

export const surfaces = {
  glassTile: {
    backgroundColor: 'rgba(221, 244, 255, 0.50)',
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    boxShadow: '0 4px 0 rgba(7, 26, 61, 0.10)',
  },
  highlightTile: {
    backgroundColor: `${colors.pink}18`,
    borderColor: colors.pink,
    borderWidth: 3,
    boxShadow: '0 8px 0 rgba(255, 45, 141, 0.18)',
  },
  warningTile: {
    backgroundColor: 'rgba(255, 247, 214, 0.72)',
    borderColor: colors.yellow,
    borderWidth: 1,
    boxShadow: '0 4px 0 rgba(7, 26, 61, 0.08)',
  },
  iconButton: {
    backgroundColor: 'rgba(221, 244, 255, 0.62)',
    borderColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 2,
    boxShadow: '0 4px 0 rgba(7, 26, 61, 0.12)',
  },
  iconButtonActive: {
    backgroundColor: `${colors.pink}18`,
    borderColor: colors.pink,
    borderWidth: 2,
    boxShadow: '0 4px 0 rgba(255, 45, 141, 0.18)',
  },
};
