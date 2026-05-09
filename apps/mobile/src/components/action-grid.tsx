import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { GameButton } from '@/src/components/game-button';

type Action = ComponentProps<typeof GameButton>;

type ActionGridProps = {
  actions: Action[];
};

export function ActionGrid({ actions }: ActionGridProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {actions.map((action) => (
        <View key={action.label} style={{ flexBasis: '48%', flexGrow: 1 }}>
          <GameButton {...action} size="compact" />
        </View>
      ))}
    </View>
  );
}
