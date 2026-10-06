import { AppContext } from '@/context/context';
import useTyper from '@/hooks/useTyper';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenFooter from '@/components/screen-footer';
import ScreenHeader from '@/components/screen-header';
import { PokemonColors } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import { saveDraft } from '@/utils/split-draft';

import Modal from '@/components/modal';

export default function AssignScreen() {
  const router = useRouter();
  const [isModal, setIsModal] = useState(false);
  const playTap = useSoundEffect(Sounds.tap);

  // assignments: { [itemId]: string[] of memberIds sharing that item }
  const { members, setMembers, items, assignments, setAssignments, itemFunders } = useContext(AppContext);

  const DIALOG_TEXT = 'Tag everyone who shared each item.';
  const TYPE_SPEED_MS = 30;

  const typeDialogText = useTyper(DIALOG_TEXT, TYPE_SPEED_MS);

  const billTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );

  const toggleAssignment = (itemId, memberId) => {
    setAssignments((prev) => {
      const current = prev[itemId] ?? [];
      const next = current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId];
      return { ...prev, [itemId]: next };
    });
  };

  // Whenever items or assignments change, recompute each member's share and
  // write it straight onto their object as `totalOwed` — this is what the
  // "EACH PAYS" list below renders from.
  useEffect(() => {
    setMembers((prev) =>
      prev.map((member) => {
        let total = 0;
        const assignedItems = []
        items.forEach((item) => {
          const sharers = assignments[item.id] ?? [];
          if (sharers.includes(member.id)) {
            const share = item.price / sharers.length
            total += share;
            assignedItems.push({
              id: item.id, name: item.name, price: share
            })
          }
        });
        return { ...member, totalOwed: total, assignedItems: assignedItems };
      })
    );
  }, [items, assignments]);

  const allItemsAssigned = items.every((item) => (assignments[item.id]?.length ?? 0) > 0);

  const handleNext = () => {
    if (!allItemsAssigned) {
      setIsModal(true);
      return;
    }
    saveDraft({ members, items, total: billTotal, assignments, itemFunders, step: 4, route: '/receipt' });
    router.push('/receipt');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <ScreenHeader
          eyebrow="STEP 4 / 5"
          eyebrowMuted={`₱${billTotal.toFixed(0)} BILL`}
          title="Assign the loot"
          currentStep={4}
        />

        <View style={styles.dialogBox}>
          <Text style={styles.dialogText}>{typeDialogText}</Text>
          <Text style={styles.dialogArrow}>▼</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => {
            const sharers = assignments[item.id] ?? [];
            const each = sharers.length > 0 ? item.price / sharers.length : 0;

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <View style={{ flex: 1 }}>
                    {!!item.category && (
                      <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
                    )}
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₱{item.price.toFixed(0)}</Text>
                </View>

                <View style={styles.pillRow}>
                  {members.map((member) => {
                    const active = sharers.includes(member.id);
                    return (
                      <Pressable
                        key={member.id}
                        onPress={() => {
                          toggleAssignment(item.id, member.id);
                          playTap();
                        }}
                        style={({ pressed }) => [
                          styles.memberPill,
                          {
                            backgroundColor: active ? member.type.bg : '#FFFFFF',
                            borderColor: active ? member.type.border : PokemonColors.border,
                          },
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.memberPillText,
                            { color: active ? member.type.text : PokemonColors.bodyText },
                          ]}
                        >
                          {member.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.assignMeta}>
                  {sharers.length === 0
                    ? 'nobody assigned yet'
                    : `${sharers.length} sharing · ₱${each.toFixed(0)} each`}
                </Text>
              </View>
            );
          })}

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>EACH PAYS</Text>

            {members.map((member) => {
              const total = member.totalOwed ?? 0;
              const fraction = billTotal > 0 ? total / billTotal : 0;

              return (
                <View key={member.id} style={styles.summaryRow}>
                  <View style={styles.summaryTextRow}>
                    <Text style={styles.summaryName}>{member.name}</Text>
                    <Text style={styles.summaryAmount}>₱{total.toFixed(0)}</Text>
                  </View>
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
                </View>
              );
            })}
          </View>
        </ScrollView>

        <ScreenFooter
          nextLabel="See the receipt"
          onNext={handleNext}
          onBack={() => router.push("/assign")}
        />
      </View>

      <Modal
        text="Every item needs at least one person tagged before you can see the receipt."
        isModal={isModal}
        metal={false}
        closeModal={() => setIsModal(false)}
      />
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
  dialogBox: {
    backgroundColor: '#FCF3D6',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: PokemonColors.border,
  },
  dialogText: {
    color: '#2A2A2A',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  dialogArrow: {
    position: 'absolute',
    right: 20,
    bottom: 8,
    color: '#C1524C',
    fontSize: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 14,
  },
  itemCard: {
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 17,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  categoryTag: {
    fontSize: 11,
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
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberPill: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  memberPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  assignMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A9EA8',
  },
  summaryBox: {
    backgroundColor: PokemonColors.darkContainer,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: PokemonColors.yellow,
  },
  summaryRow: {
    gap: 6,
  },
  summaryTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pressed: {
    opacity: 0.8,
  },
});