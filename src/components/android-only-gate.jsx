import { PokemonColors } from '@/constants/app-theme';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

// Typical phone breakpoint — most phones (portrait) sit under this width;
// tablets and desktop browsers sit above it. Adjust if you want a
// different cutoff.
const MAX_PHONE_WIDTH = 480;

// Wrap your root layout's children with this. Renders the app normally
// when the viewport is phone-sized; shows a themed block screen on wider
// screens (tablets, desktop browsers) regardless of OS.
export default function PhoneOnlyGate({ children }) {
  const { width } = useWindowDimensions();
  console.log('[PhoneOnlyGate] width:', width); 
  const isPhoneWidth = width <= MAX_PHONE_WIDTH;

  if (isPhoneWidth) {
    return children;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>ENCOUNTER BLOCKED</Text>
        <Text style={styles.title}>Phone screens only</Text>
        <Text style={styles.body}>
          This app is designed for phone-sized screens. Open it on your
          phone, or narrow this browser window, to continue.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PokemonColors.cream,
    padding: 24,
  },
  card: {
    maxWidth: 360,
    width: '100%',
    backgroundColor: PokemonColors.navy,
    borderWidth: 3,
    borderColor: PokemonColors.border,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: PokemonColors.yellow,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  body: {
    fontSize: 14,
    fontWeight: '600',
    color: PokemonColors.eyebrowMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
});