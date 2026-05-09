import { Text, View } from 'react-native';

import { ActionGrid } from '@/src/components/action-grid';
import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { avatars } from '@/src/constants/game';
import { colors } from '@/src/theme/colors';

const winnerAvatar = avatars[1];

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.line,
        borderRadius: 16,
        borderWidth: 1,
        flex: 1,
        gap: 4,
        minWidth: 132,
        padding: 12,
      }}>
      <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: '800' }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: '900' }}>
        {value}
      </Text>
    </View>
  );
}

export default function ResultScreen() {
  return (
    <PrototypeScreen>
      <MenuPanel
        backHref="/seeker-radar"
        title="Resultados"
        meta={<Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: '800' }}>Resultado final da rodada</Text>}
        actions={
          <>
            <GameButton href="/lobby" label="Jogar novamente" />
            <ActionGrid
              actions={[
                { href: '/', label: 'Sair', variant: 'danger' },
                { href: '/social-card', label: 'Compartilhar', variant: 'ghost' },
              ]}
            />
          </>
        }>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.pink,
            borderRadius: 22,
            borderWidth: 3,
            boxShadow: '0 8px 0 rgba(255, 45, 141, 0.18)',
            gap: 12,
            padding: 18,
          }}>
          <Badge label="Vencedor" tone="leader" />
          <View
            style={{
              alignItems: 'center',
              backgroundColor: winnerAvatar.color,
              borderColor: colors.esconde,
              borderRadius: 52,
              borderWidth: 5,
              height: 104,
              justifyContent: 'center',
              width: 104,
            }}>
            <Text style={{ color: colors.surface, fontSize: 34, fontWeight: '900' }}>{winnerAvatar.label}</Text>
          </View>
          <Text selectable style={{ color: colors.ink, fontSize: 30, fontWeight: '900', textAlign: 'center' }}>
            Escondidos venceram
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 16, fontWeight: '700', lineHeight: 22, textAlign: 'center' }}>
            Ana segurou o esconderijo até o fim e virou campeã da rodada.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <ResultStat label="Tempo de jogo" value="3min" />
          <ResultStat label="Jogadores" value="4" />
          <ResultStat label="Capturados" value="2" />
          <ResultStat label="Sobreviveu" value="Ana" />
        </View>

        <View
          style={{
            backgroundColor: colors.warningSoft,
            borderColor: colors.yellow,
            borderRadius: 16,
            borderWidth: 1,
            padding: 14,
          }}>
          <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: '800', lineHeight: 21, textAlign: 'center' }}>
            Resumo: Rafa e Bia foram encontrados. Ana escapou no rush final e garantiu a vitória dos escondidos.
          </Text>
        </View>
      </MenuPanel>
    </PrototypeScreen>
  );
}
