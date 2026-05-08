import { Image } from 'expo-image';
import { View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function CoverBanner() {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.navy,
        borderRadius: 18,
        borderWidth: 2,
        overflow: 'hidden',
        width: '100%',
      }}>
      <Image
        source={require('@/assets/images/pique-esconde-store-cover.png')}
        contentFit="cover"
        style={{ aspectRatio: 2.31, width: '100%' }}
      />
    </View>
  );
}
