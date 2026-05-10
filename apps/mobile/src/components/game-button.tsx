import { Link, type Href } from 'expo-router';
import { Pressable, Text, type ViewStyle } from 'react-native';

import { patterns } from '@/src/theme/patterns';

type GameButtonProps = {
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  size?: 'default' | 'compact';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerStrong' | 'capture' | 'rush';
};

type GameLinkButtonProps = Omit<GameButtonProps, 'onPress'> & {
  href: Href;
  replace?: boolean;
};

export function GameButton({ disabled = false, label, onPress, size = 'default', variant = 'primary' }: GameButtonProps) {
  const pattern = patterns.button[variant];
  const isCompact = size === 'compact';
  const buttonStyle: ViewStyle = {
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
  };

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={buttonStyle}>
      <Text style={{ color: pattern.color, fontSize: isCompact ? 13 : 16, fontWeight: '900', textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function GameLinkButton({ disabled = false, href, label, replace = false, size = 'default', variant = 'primary' }: GameLinkButtonProps) {
  if (disabled) {
    return <GameButton disabled label={label} size={size} variant={variant} />;
  }

  const pattern = patterns.button[variant];
  const isCompact = size === 'compact';

  return (
    <Link href={href} replace={replace} asChild>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
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
    </Link>
  );
}
