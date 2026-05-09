import { Link, type Href } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { patterns } from '@/src/theme/patterns';

type GameButtonProps = {
  disabled?: boolean;
  href?: Href;
  label: string;
  onPress?: () => void;
  size?: 'default' | 'compact';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function GameButton({ disabled = false, href, label, onPress, size = 'default', variant = 'primary' }: GameButtonProps) {
  const pattern = patterns.button[variant];
  const isCompact = size === 'compact';

  const button = (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={{
        alignItems: 'center',
        backgroundColor: pattern.backgroundColor,
        borderColor: pattern.borderColor,
        borderRadius: 16,
        borderWidth: 2,
        boxShadow: pattern.shadow,
        justifyContent: 'center',
        minHeight: isCompact ? 48 : 56,
        paddingHorizontal: isCompact ? 10 : 18,
        paddingVertical: isCompact ? 10 : 14,
      }}>
      <Text style={{ color: pattern.color, fontSize: isCompact ? 13 : 16, fontWeight: '900', textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );

  if (!href || disabled) {
    return button;
  }

  return (
    <Link href={href} asChild>
      {button}
    </Link>
  );
}
