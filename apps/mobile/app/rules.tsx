import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/src/components/badge';
import { GameButton } from '@/src/components/game-button';
import { MenuPanel, PrototypeScreen } from '@/src/components/prototype-screen';
import { useSafeRouter } from '@/src/hooks/use-safe-router';
import { t } from '@/src/i18n';
import { type EnvironmentPreset, useRoom } from '@/src/state/room-store';
import { colors } from '@/src/theme/colors';
import { surfaces } from '@/src/theme/surfaces';

type RuleOption<T extends number | string> = {
  label: string;
  value: T;
};

const environmentOptions = [
  { label: t('rules.environmentSmall'), value: 'small' },
  { label: t('rules.environmentMedium'), value: 'medium' },
  { label: t('rules.environmentLarge'), value: 'large' },
] satisfies RuleOption<EnvironmentPreset>[];

const hideOptions = [
  { label: '30s', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s', value: 60 },
] satisfies RuleOption<number>[];

const seekOptions = [
  { label: '2min', value: 120 },
  { label: '3min', value: 180 },
  { label: '5min', value: 300 },
] satisfies RuleOption<number>[];

function secondsToLabel(seconds: number) {
  return seconds >= 60 ? `${Math.round(seconds / 60)}min` : `${seconds}s`;
}

function environmentBadge(preset: EnvironmentPreset) {
  if (preset === 'small') return t('rules.environmentSmall');
  if (preset === 'large') return t('rules.environmentLarge');
  return t('rules.environmentMedium');
}

function capturePreviewForPreset(preset: EnvironmentPreset) {
  if (preset === 'small') return { confirmSeconds: 2.5, radiusMeters: 4.5 };
  if (preset === 'large') return { confirmSeconds: 2, radiusMeters: 6 };
  return { confirmSeconds: 2, radiusMeters: 5 };
}

function RulePicker<T extends number | string>({
  disabled,
  icon,
  onChange,
  options,
  title,
  value,
}: {
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onChange: (value: T) => void;
  options: RuleOption<T>[];
  title: string;
  value: T;
}) {
  return (
    <View
      style={{
        ...surfaces.glassTile,
        borderRadius: 18,
        gap: 10,
        padding: 12,
      }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: `${colors.pink}18`,
            borderColor: colors.pink,
            borderRadius: 12,
            borderWidth: 2,
            height: 34,
            justifyContent: 'center',
            width: 34,
          }}>
          <Ionicons color={colors.pink} name={icon} size={18} />
        </View>
        <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: '900' }}>
          {title}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              key={String(option.value)}
              accessibilityLabel={`${title}: ${option.label}`}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected }}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={{
                ...(selected ? surfaces.highlightTile : surfaces.glassTile),
                alignItems: 'center',
                borderRadius: 14,
                flex: 1,
                justifyContent: 'center',
                minHeight: 48,
                paddingHorizontal: 6,
                paddingVertical: 10,
              }}>
              <Text style={{ color: colors.ink, fontSize: 14, fontWeight: '900', textAlign: 'center' }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function RulesScreen() {
  const router = useSafeRouter();
  const { activePlayer, error, isLoading, room, updateRoomRules } = useRoom();
  const roomRules = room?.rules;
  const isLeader = Boolean(activePlayer?.isLeader);
  const savedEnvironmentPreset = roomRules?.environmentPreset;
  const savedHideDurationSeconds = roomRules?.hideDurationSeconds;
  const savedSeekDurationSeconds = roomRules?.seekDurationSeconds;
  const [environmentPreset, setEnvironmentPreset] = useState<EnvironmentPreset>(roomRules?.environmentPreset ?? 'medium');
  const [hideDurationSeconds, setHideDurationSeconds] = useState(roomRules?.hideDurationSeconds ?? 60);
  const [seekDurationSeconds, setSeekDurationSeconds] = useState(roomRules?.seekDurationSeconds ?? 180);
  const [draftRoomId, setDraftRoomId] = useState(room?.id);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  useEffect(() => {
    if (!savedEnvironmentPreset || !savedHideDurationSeconds || !savedSeekDurationSeconds) return;
    const roomChanged = draftRoomId !== room?.id;

    if (!hasLocalChanges || roomChanged) {
      setEnvironmentPreset(savedEnvironmentPreset);
      setHideDurationSeconds(savedHideDurationSeconds);
      setSeekDurationSeconds(savedSeekDurationSeconds);
      setDraftRoomId(room?.id);
      setHasLocalChanges(false);
    }
  }, [
    draftRoomId,
    hasLocalChanges,
    room?.id,
    savedEnvironmentPreset,
    savedHideDurationSeconds,
    savedSeekDurationSeconds,
  ]);

  const changed = useMemo(() => {
    return Boolean(
      roomRules &&
        (environmentPreset !== roomRules.environmentPreset ||
          hideDurationSeconds !== roomRules.hideDurationSeconds ||
          seekDurationSeconds !== roomRules.seekDurationSeconds),
    );
  }, [environmentPreset, hideDurationSeconds, roomRules, seekDurationSeconds]);

  const capturePreview = capturePreviewForPreset(environmentPreset);

  const handleEnvironmentChange = (nextPreset: EnvironmentPreset) => {
    setHasLocalChanges(true);
    setEnvironmentPreset(nextPreset);
  };

  const handleHideDurationChange = (nextSeconds: number) => {
    setHasLocalChanges(true);
    setHideDurationSeconds(nextSeconds);
  };

  const handleSeekDurationChange = (nextSeconds: number) => {
    setHasLocalChanges(true);
    setSeekDurationSeconds(nextSeconds);
  };

  const handleSave = async () => {
    if (!changed || !isLeader) {
      router.replace('/lobby');
      return;
    }

    try {
      await updateRoomRules({ environmentPreset, hideDurationSeconds, seekDurationSeconds });
      setHasLocalChanges(false);
      router.replace('/lobby');
    } catch {
      // Error is shown from room store state.
    }
  };

  return (
    <PrototypeScreen>
      <MenuPanel
        tone="glass"
        backHref="/lobby"
        title={t('rules.title')}
        actions={<GameButton disabled={isLeader && (!changed || isLoading)} label={isLeader ? t('common.save') : t('common.back')} onPress={handleSave} />}>
        <RulePicker disabled={!isLeader || isLoading} icon="map-outline" onChange={handleEnvironmentChange} options={environmentOptions} title={t('rules.environment')} value={environmentPreset} />
        <RulePicker disabled={!isLeader || isLoading} icon="timer-outline" onChange={handleHideDurationChange} options={hideOptions} title={t('rules.hideTime')} value={hideDurationSeconds} />
        <RulePicker disabled={!isLeader || isLoading} icon="radio-outline" onChange={handleSeekDurationChange} options={seekOptions} title={t('rules.seekTime')} value={seekDurationSeconds} />

        <View
          style={{
            ...surfaces.warningTile,
            borderRadius: 18,
            gap: 8,
            padding: 12,
          }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text selectable style={{ color: colors.ink, fontSize: 14, fontWeight: '900' }}>
              {t('rules.capture')}
            </Text>
            <Badge label={`${capturePreview.radiusMeters}m / ${capturePreview.confirmSeconds}s`} tone="ready" />
          </View>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text selectable style={{ color: colors.muted, fontSize: 13, fontWeight: '800' }}>
              {t('rules.currentSummary')}
            </Text>
            <Text selectable style={{ color: colors.ink, fontSize: 13, fontWeight: '900' }}>
              {environmentBadge(environmentPreset)} - {secondsToLabel(hideDurationSeconds)} - {secondsToLabel(seekDurationSeconds)}
            </Text>
          </View>
        </View>

        {changed && isLeader ? (
          <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: '800', textAlign: 'center' }}>
            {t('rules.readyResetHint')}
          </Text>
        ) : null}
        {error ? (
          <Text selectable style={{ color: colors.danger, fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}
      </MenuPanel>
    </PrototypeScreen>
  );
}
