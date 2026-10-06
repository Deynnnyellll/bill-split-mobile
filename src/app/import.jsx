import { PokemonColors } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import LZString from 'lz-string';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReceiptView from '@/components/receipt-view';
import { useSoundEffect } from '@/hooks/use-sound-effect';

// Reached via the receipt QR code — either the native deep link
// (billsplitterpokemon://import?data=...) or, on web/iOS, this project's
// deployed web build at https://poke-bill-mobile.vercel.app/import?data=...
// (see src/components/receipt-view.jsx). Decodes the `data` param back into
// the same { items, members, total, assignments, itemFunders } shape it was
// encoded from and shows it read-only — this doesn't touch your own
// in-progress AppContext, so it can't clobber a draft you already have going.
export default function ImportScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const [split, setSplit] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const playTap = useSoundEffect(Sounds.tap);

  useEffect(() => {
    if (!data) {
      setInvalid(true);
      return;
    }

    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(
        Array.isArray(data) ? data[0] : data
      );
      const parsed = JSON.parse(decompressed);
      if (!parsed || !Array.isArray(parsed.items) || !Array.isArray(parsed.members)) {
        throw new Error('Malformed split payload');
      }
      setSplit(parsed);
    } catch (err) {
      console.warn('Failed to import shared split:', err);
      setInvalid(true);
    }
  }, [data]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        {/* Web-only — native builds don't need to advertise themselves */}
        {Platform.OS === 'web' && (
          <Link href="/download" asChild>
            <View style={styles.downloadBanner}>
              <Text style={styles.bannerText}>Get the native app →</Text>
            </View>
          </Link>
        )}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>SHARED ENCOUNTER</Text>
          <Text style={styles.title}>{split ? 'Someone shared a split' : 'Reading QR code…'}</Text>
        </View>

        {invalid && (
          <View style={styles.centerState}>
            <Text style={styles.notFoundText}>This QR code looks invalid or expired.</Text>
            <Pressable
              onPress={() => {
                router.push('/');
                playTap();
              }}>
              <Text style={styles.notFoundSubtext}>Back to Home</Text>
            </Pressable>
          </View>
        )}

        {!invalid && split && (
          <>
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentInner}
              showsVerticalScrollIndicator={false}
            >
              <ReceiptView
                items={split.items}
                members={split.members}
                total={split.total}
                assignments={split.assignments}
                itemFunders={split.itemFunders}
              />
            </ScrollView>

            <Pressable
              onPress={() => {
                router.push('/');
                playTap();
              }}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={styles.backButtonText}>Start your own split</Text>
            </Pressable>
          </>
        )}
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
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 30,
  },
  notFoundText: {
    fontSize: 15,
    fontWeight: '700',
    color: PokemonColors.bodyText,
    textAlign: 'center',
  },
  notFoundSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E82AE',
    textDecorationLine: 'underline',
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
  downloadBanner: {
    backgroundColor: PokemonColors.navy,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: PokemonColors.border,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  bannerText: {
    color: PokemonColors.yellow,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
