import { PokemonColors } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { getSplitHistory } from '@/utils/split-history';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReceiptView from '@/components/receipt-view';
import { useSoundEffect } from '@/hooks/use-sound-effect';

export default function HistoryRecordScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const playTap = useSoundEffect(Sounds.tap);

  useEffect(() => {
    let cancelled = false;
    getSplitHistory().then((all) => {
      if (cancelled) return;
      const found = all.find((split) => split.id === id);
      setRecord(found ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
          <Text style={styles.eyebrow}>PAST ENCOUNTER</Text>
          <Text style={styles.title}>
            {record ? formatDate(record.date) : 'Loading receipt…'}
          </Text>
        </View>

        {loading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={PokemonColors.border} />
          </View>
        )}

        {!loading && !record && (
          <View style={styles.centerState}>
            <Text style={styles.notFoundText}>This split couldn't be found.</Text>
            <Pressable
              onPress={() => {
                router.back();
                playTap();
              }}>
              <Text style={styles.notFoundSubtext}>Back to history</Text>
            </Pressable>
          </View>
        )}

        {!loading && record && (
          <>
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentInner}
              showsVerticalScrollIndicator={false}
            >
              <ReceiptView
                items={record.items}
                members={record.members}
                total={record.total}
                assignments={record.assignments}
                itemFunders={record.itemFunders}
              />
            </ScrollView>

            <Pressable
              onPress={() => {
                router.back();
                playTap();
              }}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={styles.backButtonText}>Back to history</Text>
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