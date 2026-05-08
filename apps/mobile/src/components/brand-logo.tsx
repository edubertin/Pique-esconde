import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function BrandLogo() {
  return (
    <View style={{ alignItems: 'center', gap: 10, width: '100%' }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'transparent',
          borderRadius: 24,
          maxWidth: 300,
          overflow: 'hidden',
          width: '82%',
        }}>
        <Image
          source={require('@/assets/images/pique-esconde-logo.png')}
          contentFit="cover"
          style={{ aspectRatio: 1.14, width: '100%' }}
        />
      </View>
      <Text selectable style={{ color: colors.pink, fontSize: 16, fontWeight: '900' }}>
        Esconda. Marque. Corra.
      </Text>
    </View>
  );
}
