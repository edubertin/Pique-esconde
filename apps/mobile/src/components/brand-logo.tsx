import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function BrandLogo() {
  return (
    <View style={{ alignItems: 'center', gap: 12, width: '100%' }}>
      <View
        style={{
          alignItems: 'center',
          alignSelf: 'stretch',
          backgroundColor: colors.surface,
          borderColor: colors.navy,
          borderRadius: 28,
          borderWidth: 3,
          overflow: 'hidden',
        }}>
        <Image
          source={require('@/assets/images/pique-esconde-logo.png')}
          contentFit="cover"
          style={{ aspectRatio: 1.14, width: '100%' }}
        />
      </View>
      <Text selectable style={{ color: colors.pink, fontSize: 15, fontWeight: '900' }}>
        Esconda. Marque. Corra.
      </Text>
    </View>
  );
}
