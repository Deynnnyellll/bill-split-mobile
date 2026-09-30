import BackPet from '@/components/ui/back-pet';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Sounds } from '@/constants/sounds';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import { decodeReceipt } from '@/utils/share-code';
import { clearSplitHistory, getSplitHistory, saveSplitToHistory } from '@/utils/split-history';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryDetailScreen() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const playTap = useSoundEffect(Sounds.tap);

  // ---- Import bottom sheet ----
  const [showImport, setShowImport] = useState(false);
  const [sheetMounted, setSheetMounted] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [importError, setImportError] = useState(false);
  const [importBusy, setImportBusy] = useState(false);

  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showImport) {
      setSheetMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (sheetMounted) {
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setSheetMounted(false));
    }
  }, [showImport]);

  const sheetTranslate = slide.interpolate({ inputRange: [0, 1], outputRange: [500, 0] });
  const backdropOpacity = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] });

  const closeImport = () => {
    setShowImport(false);
    setImportValue('');
    setImportError(false);
  };

  const handleImportCode = async () => {
    if (importBusy) return;

    const decoded = decodeReceipt(importValue);
    console.log("Decoded receipt:", decoded)

    // this will handle if there is no decoded receipt
    if (!decoded) {
      setImportError(true);
      return;
    }

    setImportBusy(true);
    setImportError(false);

    try {
      await saveSplitToHistory(decoded);
      const all = await getSplitHistory();
      console.log("history after decoding", all);
      setRecords(all);
      closeImport();
      playTap();
    } catch {
      // setImportError(true);
    } finally {
      setImportBusy(false);
    }
  };

  // Reload every time this screen is focused, so a newly saved split
  // shows up without needing a manual refresh.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      getSplitHistory().then((all) => {
        if (!cancelled) {
          setRecords(all);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handleClear = async () => {
    await clearSplitHistory();
    setConfirmClear(false);
    setRecords([]);
    playTap();
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.eyebrow}>PAST ENCOUNTERS</Text>
              <Text style={styles.title}>History</Text>
            </View>

            <View style={styles.headerRight}>
              {records.length > 0 && (
                <Pressable
                  onPress={() => {
                    setConfirmClear(true);
                    playTap();
                  }}
                  style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  router.back();
                  playTap();
                }}
                hitSlop={10}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                style={({ pressed }) => [styles.backButtonWrap, pressed && styles.pressed]}
              >
                <View style={styles.backButton}>
                  <BackPet width={30} />
                </View>
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={PokemonColors.border} />
          </View>
        )}

        {!loading && records.length === 0 && (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>No splits logged yet.</Text>
            <Text style={styles.emptySubtext}>Finish a bill and it'll show up here.</Text>
          </View>
        )}

        {!loading && records.length > 0 && (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
          >
            {records.map((item) => {
              const funderIds = item.funderIds ?? (item.funderId ? [item.funderId] : []);
              const funderNames = item.members
                .filter((m) => funderIds.includes(m.id))
                .map((m) => m.name);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    router.push({ pathname: '/history-record', params: { id: item.id } });
                    playTap();
                  }}
                  style={({ pressed }) => [styles.recordCard, pressed && styles.pressed]}
                >
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
                    <Text style={styles.recordTotal}>₱{item.total}</Text>
                  </View>

                  <Text style={styles.recordMeta}>
                    {item.items.length} item{item.items.length !== 1 ? 's' : ''} ·{' '}
                    {item.members.length} trainer{item.members.length !== 1 ? 's' : ''}
                    {funderNames.length > 0 ? ` · ${funderNames.join(' & ')} fronted it` : ''}
                  </Text>

                  <Text style={styles.recordChevron}>View receipt →</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Floating import button */}
        <Pressable
          onPress={() => {
            setShowImport(true);
            playTap();
          }}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          accessibilityLabel="Import a receipt"
          accessibilityRole="button"
        >
          <Text style={styles.fabIcon}>⇩</Text>
        </Pressable>
      </View>

      {/* Two-button clear-history confirmation — the shared Modal only
          supports a single action, so this is a small custom overlay. */}
      {confirmClear && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Clear all history?</Text>
            <Text style={styles.confirmBody}>
              This removes every saved split and can't be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                onPress={() => {
                  setConfirmClear(false);
                  playTap();
                }}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleClear}
                style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
              >
                <Text style={styles.confirmButtonText}>Clear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Import bottom sheet */}
      <Modal
        visible={sheetMounted}
        transparent
        animationType="none"
        onRequestClose={closeImport}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeImport} />
          </Animated.View>

          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslate }] }]}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Import a receipt</Text>
            <Text style={styles.sheetSubtitle}>
              Paste the code someone shared with you from Bill Splitter.
            </Text>

            {importError && (
              <Text style={styles.importErrorText}>
                That code didn't look right. Check it and try again.
              </Text>
            )}

            <TextInput
              style={styles.importInput}
              value={importValue}
              onChangeText={(text) => {
                setImportValue(text);
                if (importError) setImportError(false);
              }}
              placeholder="Paste code here…"
              placeholderTextColor="#9A9EA8"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.sheetButtons}>
              <Pressable
                onPress={closeImport}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleImportCode}
                disabled={importBusy || !importValue.trim()}
                style={({ pressed }) => [
                  styles.importButton,
                  pressed && styles.pressed,
                  (importBusy || !importValue.trim()) && styles.disabled,
                ]}
              >
                <Text style={styles.importButtonText}>
                  {importBusy ? 'Importing…' : 'Import'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButtonWrap: {
    alignItems: 'center',
    gap: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: PokemonColors.cream,
    borderWidth: 2,
    borderColor: PokemonColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: PokemonColors.eyebrowMuted,
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
  clearButton: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentInner: {
    padding: 20,
    paddingBottom: 100, // keeps the last card clear of the floating button
    gap: 12,
  },
  recordCard: {
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 16,
    padding: 16,
    backgroundColor: PokemonColors.contentBackground,
    gap: 6,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordDate: {
    fontSize: 13,
    fontWeight: '700',
    color: PokemonColors.mutedText,
  },
  recordTotal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#C1524C',
  },
  recordMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: PokemonColors.bodyText,
  },
  recordChevron: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E82AE',
    marginTop: 4,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: PokemonColors.bodyText,
  },
  emptySubtext: {
    fontSize: 13,
    color: PokemonColors.mutedText,
  },

  // ---- Floating import button ----
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PokemonColors.yellow,
    borderWidth: 2.5,
    borderColor: PokemonColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    // Android + iOS shadow so it visibly floats above the list
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  fabPressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.9,
  },
  fabIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },

  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    zIndex: 10000,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: PokemonColors.cream,
    borderWidth: 2.5,
    borderColor: PokemonColors.border,
    borderRadius: 18,
    padding: 20,
    gap: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PokemonColors.bodyText,
    textAlign: 'center',
  },
  confirmBody: {
    fontSize: 14,
    color: PokemonColors.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    backgroundColor: '#C1524C',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.8,
  },

  // ---- Import bottom sheet ----
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: PokemonColors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: PokemonColors.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 32,
    gap: 12,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: PokemonColors.border,
    opacity: 0.4,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: PokemonColors.mutedText,
  },
  importErrorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C1524C',
  },
  importInput: {
    minHeight: 90,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#2A2A2A',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  importButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    backgroundColor: PokemonColors.yellow,
    alignItems: 'center',
  },
  importButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  disabled: {
    opacity: 0.5,
  },
});