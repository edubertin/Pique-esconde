import { Link, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { colors } from '@/src/theme/colors';

type GameButtonProps = {
  href?: Href;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function GameButton({ href, label, variant = 'primary' }: GameButtonProps) {
  const backgroundColor =
    variant === 'primary'
      ? colors.pink
      : variant === 'secondary'
        ? colors.navy
        : variant === 'danger'
          ? colors.dangerSoft
          : colors.surface;
  const color = variant === 'ghost' ? colors.ink : variant === 'danger' ? colors.danger : colors.surface;
  const borderColor =
    variant === 'primary'
      ? colors.navy
      : variant === 'secondary'
        ? colors.pink
        : variant === 'danger'
          ? colors.danger
          : colors.line;

  const button = (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={{
        alignItems: 'center',
        backgroundColor,
        borderColor,
        borderRadius: 16,
        borderWidth: 2,
        boxShadow:
          variant === 'ghost' || variant === 'danger'
            ? '0 4px 0 rgba(7, 26, 61, 0.08)'
            : '0 6px 0 rgba(7, 26, 61, 0.18)',
        justifyContent: 'center',
        minHeight: 56,
        paddingHorizontal: 18,
        paddingVertical: 14,
      }}>
      <Text style={{ color, fontSize: 16, fontWeight: '900', textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );

  if (!href) {
    return button;
  }

  return (
    <Link href={href} asChild>
      {button}
    </Link>
  );
}
