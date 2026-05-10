import { Image } from 'expo-image';
import { View } from 'react-native';

export function BrandLogo() {
  return (
    <View style={{ alignItems: 'center', gap: 10, width: '100%' }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'transparent',
          borderRadius: 24,
          maxWidth: 330,
          overflow: 'hidden',
          width: '100%',
        }}>
        <Image
          source={require('@/assets/images/logo.png')}
          contentFit="contain"
          style={{ aspectRatio: 1, maxWidth: 360, width: '100%' }}
        />
      </View>
    </View>
  );
}
