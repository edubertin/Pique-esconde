import type { ComponentProps } from 'react';
import { View } from 'react-native';

import { GameButton, GameLinkButton } from '@/src/components/game-button';

type Action = ComponentProps<typeof GameButton>;
type LinkAction = ComponentProps<typeof GameLinkButton>;

type ActionGridProps = {
  actions: (Action | LinkAction)[];
};

export function ActionGrid({ actions }: ActionGridProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {actions.map((action) => {
        return (
          <View key={action.label} style={{ flexBasis: '48%', flexGrow: 1 }}>
            {'href' in action ? (
              <GameLinkButton {...action} size="compact" />
            ) : (
              <GameButton {...action} size="compact" />
            )}
          </View>
        );
      })}
    </View>
  );
}
