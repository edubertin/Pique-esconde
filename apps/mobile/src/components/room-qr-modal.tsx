import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { t } from '@/src/i18n';
import { colors } from '@/src/theme/colors';

type RoomQrModalProps = {
  inviteUrl: string;
  onClose: () => void;
  roomCode: string;
  visible: boolean;
};

export function RoomQrModal({ inviteUrl, onClose, roomCode, visible }: RoomQrModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'rgba(7, 26, 61, 0.86)',
          flex: 1,
          justifyContent: 'center',
          padding: 22,
        }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(255, 250, 252, 0.98)',
            borderColor: colors.navy,
            borderRadius: 26,
            borderWidth: 3,
            boxShadow: '0 10px 0 rgba(0, 0, 0, 0.20)',
            gap: 14,
            maxWidth: 390,
            padding: 18,
            width: '100%',
          }}>
          <Image contentFit="contain" source={require('@/assets/images/logo.png')} style={{ aspectRatio: 2.2, width: 228 }} />

          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text selectable style={{ color: colors.ink, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>
              {t('lobby.qrTitle')}
            </Text>
            <Text selectable style={{ color: colors.pink, fontSize: 34, fontVariant: ['tabular-nums'], fontWeight: '900', textAlign: 'center' }}>
              {roomCode}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.navy,
              borderRadius: 18,
              borderWidth: 3,
              padding: 16,
            }}>
            <QRCode
              backgroundColor={colors.surface}
              color={colors.navy}
              logo={require('@/assets/images/logo.png')}
              logoBackgroundColor={colors.surface}
              logoBorderRadius={10}
              logoMargin={3}
              logoSize={54}
              quietZone={8}
              size={230}
              value={inviteUrl}
            />
          </View>

          <Text selectable style={{ color: colors.muted, fontSize: 14, fontWeight: '800', lineHeight: 19, textAlign: 'center' }}>
            {t('lobby.qrBody')}
          </Text>

          <Pressable
            accessibilityLabel={t('lobby.closeQr')}
            accessibilityRole="button"
            onPress={onClose}
            style={{
              alignItems: 'center',
              backgroundColor: colors.pink,
              borderColor: colors.navy,
              borderRadius: 16,
              borderWidth: 2,
              boxShadow: '0 5px 0 rgba(7, 26, 61, 0.24)',
              flexDirection: 'row',
              gap: 8,
              justifyContent: 'center',
              minHeight: 52,
              paddingHorizontal: 18,
              width: '100%',
            }}>
            <Ionicons color={colors.surface} name="close" size={20} />
            <Text style={{ color: colors.surface, fontSize: 16, fontWeight: '900' }}>{t('lobby.closeQr')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
