import { PokemonColors } from '@/constants/pokemon-theme';
import { encodeReceipt } from '@/utils/share-code';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, Modal, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import QRCode from 'react-native-qrcode-svg';

// Cross-platform toast-ish message
function notify(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export default function ReceiptView({ items, members, total, assignments, itemFunders, handleDownload }) {
  const funders = useMemo(() => members.filter((m) => m.isFunder), [members]);
  const hasItemFunderMap = !!itemFunders && Object.keys(itemFunders).length > 0;

  const [isShare, setIsShare] = useState(false);
  const [busy, setBusy] = useState(null); // 'code' | null
  const [assignedItems, setAssignedItems] = useState();
  const receiptRef = useRef(null);

  // ---- Bottom sheet animation ----
  const slide = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = shown
  const [sheetMounted, setSheetMounted] = useState(false);

  useEffect(() => {
    if (isShare) {
      setSheetMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else if (sheetMounted) {
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => setSheetMounted(false));
    }
  }, [isShare]);

  const sheetTranslate = slide.interpolate({ inputRange: [0, 1], outputRange: [500, 0] });
  const backdropOpacity = slide.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] });

  // ---- Calculations (unchanged) ----
  const debts = useMemo(() => {
    const map = {};
    if (funders.length === 0) return map;

    if (hasItemFunderMap && assignments) {
      items.forEach((item) => {
        const funderId = itemFunders[item.id];
        if (!funderId) return;
        const sharers = assignments[item.id] ?? [];
        if (sharers.length === 0) return;
        const each = item.price / sharers.length;
        sharers.forEach((sharerId) => {
          if (sharerId === funderId) return;
          map[sharerId] = map[sharerId] || {};
          map[sharerId][funderId] = (map[sharerId][funderId] ?? 0) + each;
        });
      });
    } else if (funders.length === 1) {
      const [only] = funders;
      members.forEach((member) => {
        if (member.id === only.id) return;
        map[member.id] = { [only.id]: member.totalOwed ?? 0 };
      });
    }

    return map;
  }, [items, assignments, itemFunders, funders, hasItemFunderMap, members]);

  const amountFundedBy = useMemo(() => {
    const map = {};
    funders.forEach((f) => { map[f.id] = 0; });
    if (hasItemFunderMap) {
      items.forEach((item) => {
        const funderId = itemFunders[item.id];
        if (funderId && map[funderId] != null) map[funderId] += item.price;
      });
    } else if (funders.length === 1) {
      map[funders[0].id] = total;
    }
    return map;
  }, [items, itemFunders, funders, hasItemFunderMap, total]);

  const totalOwedByFunder = useMemo(() => {
    const map = {};
    funders.forEach((f) => { map[f.id] = 0; });
    Object.values(debts).forEach((owedTo) => {
      Object.entries(owedTo).forEach(([funderId, amount]) => {
        map[funderId] = (map[funderId] ?? 0) + amount;
      });
    });
    return map;
  }, [debts, funders]);

  const summaryMembers = funders.length > 0
    ? members.filter((m) => !funders.some((f) => f.id === m.id))
    : members;

  const sharePayload = useMemo(
  () => encodeReceipt({ items, members, total, assignments, itemFunders }),
  [items, members, total, assignments, itemFunders]
);

  const shareQr = useMemo(() => {
    return sharePayload;
  }, [sharePayload]);

  const handleAssignedItems = (id) => {
    setAssignedItems(members.filter((item) => item.id === id))

    console.log("Assignments: ", assignedItems);
  }

  const copyCode = async (code) => {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(code);
    notify('Code copied', 'Paste it into Import in Bill Splitter.');
  };

  const handleShareCode = async () => {
    if (busy) return;
    setBusy('code');
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ text: sharePayload });
        } else {
          await copyCode(sharePayload);
        }
        return;
      }
      await Share.share({ message: sharePayload });
    } catch (err) {
      if (err?.name !== 'AbortError') await copyCode(sharePayload);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.wrap}>
      {/* Everything inside this View is what gets saved as the PNG */}
      <View ref={receiptRef} collapsable={false} style={styles.captureArea}>
        <View style={styles.itemList}>
          <Text style={[styles.metaText, { marginBottom: 10 }]}>
            ITEMS · {items.length} LOGGED
          </Text>
          {items.map((item) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  {!!item.category && (
                    <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
                  )}
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <Text style={styles.itemPrice}>₱{item.price}</Text>
              </View>
              <View style={styles.dashedBorder} />
            </View>
          ))}
        </View>

        {funders.map((f) => (
          <View key={f.id} style={styles.funderBanner}>
            <Text style={styles.funderCrown}>👑</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.funderTitle}>{f.name} fronted ₱{amountFundedBy[f.id] ?? 0}</Text>
              <Text style={styles.funderSubtitle}>TO BE PAID</Text>
            </View>
          </View>
        ))}

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>
            {funders.length === 0
              ? 'EACH PAYS'
              : funders.length === 1
                ? `OWES ${funders[0].name.toUpperCase()}`
                : 'WHO OWES WHOM'}
          </Text>

          {summaryMembers.map((member) => {
            const memberDebts = debts[member.id] ?? {};
            const owed = funders.length > 0
              ? Object.values(memberDebts).reduce((sum, amount) => sum + amount, 0)
              : (member.totalOwed ?? 0);
            const fraction = total > 0 ? owed / total : 0;
            return (
              <Pressable onPress={() => handleAssignedItems(member.id)} key={member.id} style={styles.summaryRow}>
                <View style={styles.summaryTextRow}>
                  <Text style={styles.summaryName}>{member.name}</Text>
                  <Text style={styles.summaryAmount}>₱{owed}</Text>
                </View>
                {funders.length > 1 && Object.keys(memberDebts).length > 0 && (
                  <View style={{ gap: 2 }}>
                    {Object.entries(memberDebts).map(([funderId, amount]) => {
                      const owedFunder = members.find((m) => m.id === funderId);
                      return (
                        <Text key={funderId} style={styles.summarySubtext}>
                          ₱{amount} to {owedFunder?.name ?? 'unknown'}
                        </Text>
                      );
                    })}
                  </View>
                )}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(fraction * 100, 100)}%`,
                        backgroundColor: member.type.border,
                      },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}

          {funders.map((f) => (
            <View key={f.id} style={styles.totalOwedRow}>
              <Text style={styles.totalOwedLabel}>Total owed to {f.name}</Text>
              <Text style={styles.totalOwedAmount}>₱{totalOwedByFunder[f.id] ?? 0}</Text>
            </View>
          ))}
        </View>
        
        { assignedItems && 
          <View style={[styles.itemList, styles.detailedSplit]}>
            <Text style={[styles.metaText, { marginBottom: 10 }]}>
              {assignedItems[0].name ? `${assignedItems[0].name.toUpperCase()}'S` : "TRAINER'S"} SPLIT
            </Text>
            {
              assignedItems[0].assignedItems.map((item) => (
                <View key={item.id}>
                  <View style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                    <Text style={styles.itemPrice}>₱{item.price}</Text>
                  </View>
                  <View style={styles.dashedBorder} />
                </View>
              ))
            }
          </View>
        }
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => setIsShare(true)}
        >
          <Text style={styles.primaryBtnText}>Share QR code</Text>
        </Pressable>

        <View style={styles.secondaryRow}>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed, busy && styles.disabled]}
            onPress={handleDownload}
            disabled={!!busy}
          >
            <Text style={styles.secondaryBtnText}>
              {busy === 'download' ? 'Saving…' : 'Save as image'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed, busy && styles.disabled]}
            onPress={handleShareCode}
            disabled={!!busy}
          >
            <Text style={styles.secondaryBtnText}>
              {busy === 'code' ? 'Sharing…' : 'Share as code'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* QR bottom sheet */}
      <Modal
        visible={sheetMounted}
        transparent
        animationType="none"
        onRequestClose={() => setIsShare(false)}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsShare(false)} />
          </Animated.View>

          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslate }] }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.shareStub}>
              <View style={styles.shareNotchLeft} />
              <View style={styles.shareNotchRight} />
              <QRCode value={shareQr} size={180} backgroundColor={PokemonColors.screenBackground} />
              <Text style={styles.shareLabel}>Scan the QR Code</Text>
              {/* <Text style={styles.shareHint}>select "Import Thru QR"</Text> */}
            </View>

            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              onPress={() => setIsShare(false)}
            >
              <Text style={styles.secondaryBtnText}>Done</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  captureArea: {
    gap: 14,
    padding: 12,
    borderRadius: 16,
    // Solid background so the PNG isn't transparent
    backgroundColor: PokemonColors.contentBackground ?? '#FFFFFF',
  },
  itemRow: {
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: PokemonColors.bodyText,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: '800',
    color: PokemonColors.mutedText ?? '#9A9EA8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#C1524C',
  },
  dashedBorder: {
    borderWidth: 1,
    borderColor: PokemonColors.border,
    borderStyle: 'dotted',
    borderRadius: 2,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A9EA8',
  },

  funderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FCF3D6',
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 14,
    padding: 14,
  },
  funderCrown: { fontSize: 24 },
  funderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  funderSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4C9A4C',
    marginTop: 2,
    letterSpacing: 0.5,
  },

  summaryBox: {
    backgroundColor: PokemonColors.darkContainer,
    borderRadius: 16,
    padding: 18,
    gap: 16,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: PokemonColors.yellow,
  },
  summaryRow: { gap: 6 },
  summaryTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  summaryAmount: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  summarySubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  totalOwedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 12,
  },
  totalOwedLabel: { fontSize: 14, fontWeight: '700', color: PokemonColors.yellow },
  totalOwedAmount: { fontSize: 14, fontWeight: '800', color: PokemonColors.yellow },

  // ---- Action buttons ----
  actions: { gap: 10 },
  primaryBtn: {
    backgroundColor: PokemonColors.yellow,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  secondaryRow: { 
    flexDirection: 'row', 
    gap: 10 
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: PokemonColors.screenBackground,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  pressed: { transform: [{ translateY: 2 }], opacity: 0.9 },
  disabled: { opacity: 0.5 },

  // ---- Bottom sheet ----
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
    gap: 16,
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
  shareStub: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: PokemonColors.screenBackground,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 24,
  },
  shareNotchLeft: {
    position: 'absolute',
    left: -10,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PokemonColors.cream,
    borderWidth: 2,
    borderColor: PokemonColors.border,
  },
  shareNotchRight: {
    position: 'absolute',
    right: -10,
    top: '50%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PokemonColors.cream,
    borderWidth: 2,
    borderColor: PokemonColors.border,
  },
  shareLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: PokemonColors.bodyText,
    marginTop: 8,
  },
  shareHint: {
    fontSize: 11,
    color: PokemonColors.mutedText ?? '#9A9EA8',
  },
  detailedSplit: {
    marginTop: 4,
    backgroundColor: PokemonColors.cream,
    padding: 10,
    borderRadius: 10
  }
});