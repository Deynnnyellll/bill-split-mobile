import { StyleSheet, Text, View } from 'react-native';

import { PokemonColors, PokemonTypography } from '@/constants/app-theme';

export default function ScreenHeader({ eyebrow, eyebrowMuted, title, currentStep }) {
  const showSteps = Boolean(currentStep);

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        {eyebrowMuted ? <Text style={styles.eyebrowMuted}>{eyebrowMuted}</Text> : null}
      </View>

      {showSteps ? (
        <View style={styles.stepRow}>
          {Array.from({ length: 5 }, (_, index) => index + 1).map((step) => (
            <View key={step} style={[styles.stepItem, step === styles.stepItemLast]}>
              <View
                style={[
                  styles.stepCircle,
                  step === currentStep ? styles.stepCircleActive : styles.stepCircleInactive,
                ]}>
                <Text
                  style={[
                    styles.stepNumber,
                    step === currentStep ? styles.stepNumberActive : styles.stepNumberInactive,
                  ]}>
                  {step}
                </Text>
              </View>
              {step !== 5 ? <View style={styles.stepLine} /> : null}
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: PokemonColors.navy,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 10,
    borderBottomWidth: 3,
    borderBottomColor: PokemonColors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    ...PokemonTypography.eyebrow,
    color: PokemonColors.yellow,
  },
  eyebrowMuted: {
    ...PokemonTypography.eyebrowMuted,
    color: PokemonColors.eyebrowMuted,
  },
  headerTitle: {
    ...PokemonTypography.headerTitle,
    color: '#FFFFFF',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  stepItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItemLast: {
    flex: 0,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: PokemonColors.stepActive,
    borderColor: PokemonColors.stepActive,
  },
  stepCircleInactive: {
    backgroundColor: 'transparent',
    borderColor: PokemonColors.stepInactiveBorder,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '800',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepNumberInactive: {
    color: PokemonColors.stepInactiveText,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    backgroundColor: PokemonColors.stepLine,
  },
});
