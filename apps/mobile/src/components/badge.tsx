import { Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export type BadgeTone = 'neutral' | 'ready' | 'waiting' | 'leader' | 'captured' | 'rush';

const badgeStyles: Record<BadgeTone, { backgroundColor: string; color: string; borderColor: string }> = {
  neutral: { backgroundColor: colors.surface, borderColor: colors.line, color: colors.ink },
  ready: { backgroundColor: colors.successSoft, borderColor: colors.green, color: colors.green },
  waiting: { backgroundColor: colors.warningSoft, borderColor: colors.yellow, color: colors.ink },
  leader: { backgroundColor: colors.navy, borderColor: colors.pink, color: colors.surface },
  captured: { backgroundColor: colors.dangerSoft, borderColor: colors.danger, color: colors.danger },
  rush: { backgroundColor: colors.pink, borderColor: colors.navy, color: colors.surface },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const style = badgeStyles[tone];

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderRadius: 999,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}>
      <Text style={{ color: style.color, fontSize: 12, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}
