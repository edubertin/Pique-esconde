import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function BrandLogo() {
  return (
    <View style={{ alignItems: 'center', gap: 10, width: '100%' }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderColor: colors.navy,
          borderRadius: 22,
          borderWidth: 2,
          maxWidth: 260,
          overflow: 'hidden',
          width: '78%',
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
