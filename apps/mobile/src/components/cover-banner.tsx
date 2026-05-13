import { Image } from 'expo-image';
import { View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function CoverBanner() {
  return (
    <View
      style={{
        backgroundColor: colors.esconde,
        borderColor: colors.navy,
        borderRadius: 18,
        borderWidth: 2,
        overflow: 'hidden',
        width: '100%',
      }}>
      <Image
        source={require('@/assets/images/pique-esconde-store-cover.png')}
        cachePolicy="memory-disk"
        contentFit="cover"
        placeholderContentFit="cover"
        style={{ aspectRatio: 2.31, backgroundColor: colors.esconde, width: '100%' }}
        transition={120}
      />
    </View>
  );
}
