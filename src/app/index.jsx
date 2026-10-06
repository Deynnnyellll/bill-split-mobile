import useTyper from '@/hooks/useTyper';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DraftReminderPet from '@/components/draft-reminder-pet';
import Modal from '@/components/modal';
import ScreenFooter from '@/components/screen-footer';
import ScreenHeader from '@/components/screen-header';
import { PokemonColors, TYPE_BADGES } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { AppContext } from '@/context/context';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import { useContext, useEffect, useState } from 'react';

export default function HomeScreen() {
  // this is for useTyper
  const DIALOG_TEXT = "A wild BILL appeared! Log the items and we'll split it.";
  const TYPE_SPEED_MS = 30;
  const {
    setTotal,
    setMembers,
    setItems,
    setAssignments,
    setItemFunders,
    splitCompleted,
    setSplitCompleted,
  } = useContext(AppContext);
  const playTap = useSoundEffect(Sounds.tap);
  const [isCompleteModal, setIsCompleteModal] = useState(false);

  const router = useRouter();

  // call the custom hook
  const typedDialogText = useTyper(DIALOG_TEXT, TYPE_SPEED_MS);

  useEffect(() => {
    setTotal(0);
    setMembers([]);
    setItems([]);
    setAssignments({});
    setItemFunders({});

    if (splitCompleted) {
      setIsCompleteModal(true);
      setSplitCompleted(false);
    }
  }, [])

  const handleResumeDraft = (draft) => {
    setMembers(draft.members ?? []);
    setItems(draft.items ?? []);
    setTotal(draft.total ?? 0);
    setAssignments(draft.assignments ?? {});
    setItemFunders(draft.itemFunders ?? {});
    router.push(draft.route);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            eyebrow="ENCOUNTER"
            eyebrowMuted="BILL NOT LOGGED YET"
            title="Split the bill"
          />

          <Pressable
            onPress={() => {
              router.push('/history');
              playTap();
            }}
            style={({ pressed }) => [styles.historyButton, pressed && styles.pressed]}
          >
            <View style={styles.historyIcon}>
              <View style={styles.clockHand} />
              <View style={styles.clockHandShort} />
            </View>
            <Text style={styles.historyLabel}>HISTORY</Text>
          </Pressable>
        </View>

        <View style={styles.dialogBox}>
          <Text style={styles.dialogText}>{typedDialogText}</Text>
          <Text style={styles.dialogArrow}>▼</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.screenBox}>
            <Text style={styles.screenText}>
              <Text style={styles.screenTextYellow}>Bill</Text>
              {'\n'}
              <Text style={styles.screenTextWhite}>Splitter</Text>
            </Text>
          </View>

          <View style={styles.badgeRow}>
            {TYPE_BADGES.map((badge) => (
              <View
                key={badge.label}
                style={[
                  styles.badge,
                  { backgroundColor: badge.bg, borderColor: badge.border },
                ]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.metaText}>3 types · 5 steps</Text>
        </View>

        <ScreenFooter
          showBack={false}
          nextLabel="Start the split"
          onNext={() => router.push('/party')}
        />
      </View>

      <Modal
        text="Split complete! Your receipt was saved to the PokéBox."
        isModal={isCompleteModal}
        thunder={true}
        closeModal={() => setIsCompleteModal(false)}
      />

      <DraftReminderPet onResume={handleResumeDraft} />
    </SafeAreaView>
  );
}

const NAVY = '#2B3A6B';
const CREAM = '#FBF6E3';
const YELLOW = '#F5C445';
const BORDER = '#1A1A1A';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CREAM,
  },
  card: {
    flex: 1,
    backgroundColor: CREAM,
  },
  headerWrap: {
    position: 'relative',
  },
  historyButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    alignItems: 'center',
    gap: 3,
  },
  historyIcon: {
    width: 30,
    height: 30,
    borderRadius: 19,
    backgroundColor: PokemonColors.darkContainer,
    borderWidth: 2,
    borderColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    position: 'absolute',
    width: 2,
    height: 9,
    backgroundColor: YELLOW,
    borderRadius: 1,
    top: 6,
  },
  clockHandShort: {
    position: 'absolute',
    width: 7,
    height: 2,
    backgroundColor: YELLOW,
    borderRadius: 1,
    top: 18,
    left: 19,
  },
  historyLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: PokemonColors.eyebrowMuted,
  },
  dialogBox: {
    backgroundColor: PokemonColors.cream,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: BORDER,
  },
  dialogText: {
    color: PokemonColors.bodyText,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  screenBox: {
    width: '86%',
    aspectRatio: 1.7,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: BORDER,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenText: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  screenTextYellow: {
    color: YELLOW,
  },
  screenTextWhite: {
    color: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metaText: {
    color: '#7A7E88',
    fontSize: 13,
    fontWeight: '600',
  },
});