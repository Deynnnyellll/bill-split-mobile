import { PokemonColors } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ANDROID_URL = 'https://expo.dev/accounts/deynyel/projects/bill-splitter-pokemon/builds/3bb2af41-18a1-4078-a5e1-9e63fb47f0ca';
const IOS_URL = null; //

export default function DownloadScreen() {
  const router = useRouter();
  const playTap = useSoundEffect(Sounds.tap);

  const openLink = (url) => {
    if (!url) return;

    window.open(url, '_blank');
    playTap();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>GET THE APP</Text>
          <Text style={styles.title}>Bill Splitter, native</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.body}>
            For the smoothest experience — offline support, home-screen icon,
            no browser chrome — grab the native app for your phone.
          </Text>

          <Pressable
            onPress={() => openLink(ANDROID_URL)}
            style={({ pressed }) => [styles.downloadButton, styles.androidButton, pressed && styles.pressed]}
          >
            <Text style={styles.buttonIcon}>▶</Text>
            <View style={styles.buttonTextWrap}>
              <Text style={styles.buttonLabel}>GET IT ON</Text>
              <Text style={styles.buttonStore}>Android</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => openLink(IOS_URL)}
            style={({ pressed }) => [styles.downloadButton, styles.iosButton, pressed && styles.pressed]}
          >
            <Text style={styles.buttonIcon}></Text>
            <View style={styles.buttonTextWrap}>
              <Text style={[styles.buttonLabel, styles.iosText]}>Download on the</Text>
              <Text style={[styles.buttonStore, styles.iosText]}>IOS</Text>
            </View>
          </Pressable>

          <Text style={styles.comingSoon}>IOS link coming soon — app is still in testing.</Text>
        </View>

        <Pressable
          onPress={() => {
            router.back();
            playTap();
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>Back to the web app</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PokemonColors.cream,
  },
  card: {
    flex: 1,
    backgroundColor: PokemonColors.cream,
  },
  header: {
    backgroundColor: PokemonColors.navy,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: PokemonColors.yellow,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  body: {
    fontSize: 14,
    fontWeight: '600',
    color: PokemonColors.mutedText,
    lineHeight: 20,
    marginBottom: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2.5,
    borderColor: PokemonColors.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  androidButton: {
    backgroundColor: PokemonColors.darkContainer,
  },
  iosButton: {
    backgroundColor: '#FFFFFF',
  },
  buttonIcon: {
    fontSize: 26,
    color: PokemonColors.yellow,
  },
  buttonTextWrap: {
    gap: 1,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  buttonStore: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  iosText: {
    color: PokemonColors.bodyText,
  },
  comingSoon: {
    fontSize: 12,
    fontWeight: '600',
    color: PokemonColors.hintText ?? '#9A9EA8',
    textAlign: 'center',
    marginTop: 4,
  },
  backButton: {
    margin: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: PokemonColors.border,
    backgroundColor: PokemonColors.yellow,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  pressed: {
    opacity: 0.8,
  },
});