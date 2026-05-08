import { Link, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { colors } from '@/src/theme/colors';

type GameButtonProps = {
  href?: Href;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function GameButton({ href, label, variant = 'primary' }: GameButtonProps) {
  const backgroundColor =
    variant === 'primary' ? colors.pink : variant === 'secondary' ? colors.navy : 'transparent';
  const color = variant === 'ghost' ? colors.ink : colors.surface;
  const borderColor = variant === 'ghost' ? colors.line : backgroundColor;

  const button = (
    <Pressable
      style={{
        alignItems: 'center',
        backgroundColor,
        borderColor,
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 52,
        justifyContent: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
      }}>
      <Text style={{ color, fontSize: 16, fontWeight: '900' }}>{label}</Text>
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
