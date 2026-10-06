import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PokemonColors, PokemonTypography } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { useSoundEffect } from '@/hooks/use-sound-effect';

export default function ScreenFooter({
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel,
  showBack = true,
  hintLeft = 'ENTER NEXT',
  hintRight = 'BKSP BACK',
}) {
  const playBack = useSoundEffect(Sounds.back);
  const playConfirm = useSoundEffect(Sounds.confirm);

  const handleBack = () => {
    onBack?.();
    playBack();
  };

  const handleNext = () => {
    onNext?.();
    playConfirm();
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerButtons}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.backButtonText}>{backLabel}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
          <Text style={styles.startButtonText}>{nextLabel}</Text>
        </Pressable>
      </View>
      <View style={styles.hintRow}>
        <Text style={styles.hintText}>{hintLeft}</Text>
        <Text style={styles.hintText}>{hintRight}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: PokemonColors.screenBackground,
    borderTopWidth: 3,
    borderTopColor: PokemonColors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    borderWidth: 3,
    borderColor: PokemonColors.border,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    ...PokemonTypography.buttonText,
    color: PokemonColors.border,
  },
  startButton: {
    flex: 1,
    borderWidth: 3,
    borderColor: PokemonColors.border,
    borderRadius: 14,
    backgroundColor: PokemonColors.yellow,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    ...PokemonTypography.buttonText,
    color: PokemonColors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  hintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  hintText: {
    ...PokemonTypography.hint,
    color: PokemonColors.hintText,
  },
});
