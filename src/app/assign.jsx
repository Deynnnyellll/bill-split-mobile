import { AppContext } from '@/context/context';
import useTyper from '@/hooks/useTyper';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenFooter from '@/components/screen-footer';
import ScreenHeader from '@/components/screen-header';
import { PokemonColors } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import { saveDraft } from '@/utils/split-draft';

import Modal from '@/components/modal';

export default function ItemScreen() {
  const router = useRouter();

  const { members, setMembers, items, total, itemFunders, setItemFunders } = useContext(AppContext);
  const [isFunder, setIsFunder] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [modalText, setModalText] = useState('Please select an option');
  const [fundingPhase, setFundingPhase] = useState('pick-funders'); // 'pick-funders' | 'claim-items'
  const [activeFunderIndex, setActiveFunderIndex] = useState(0);
  const playTap = useSoundEffect(Sounds.tap);

  const DIALOG_TEXT = "Did anyone front the cash for the table?";
  const TYPE_SPEED_MS = 30;

  const typeDialogText = useTyper(DIALOG_TEXT, TYPE_SPEED_MS);

  const selectedFunders = members.filter((member) => member.isFunder);
  const currentFunder = selectedFunders[activeFunderIndex];

  const toggleFunder = (id) => {
    if (!isFunder) return;

    const isSingleFunder = items.length === 1;
    const turningOff = members.find((member) => member.id === id)?.isFunder === true;

    setMembers((prev) =>
      prev.map((member) =>
        {
          if(member.id === id) return { ...member, isFunder: !member.isFunder }

          return isSingleFunder ? { ...member, isFunder: false} : member;
  
        }
      )
    );

    if(isSingleFunder) {
      setItemFunders({});
      return;
    }

    if (turningOff) {
      setItemFunders((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((itemId) => {
          if (next[itemId] === id) delete next[itemId];
        });
        return next;
      });
    }
  };

  const handleSplitEvenly = () => {
    setMembers((prev) => prev.map(item => item.id && {...item, isFunder: false}))
    setItemFunders({});
    setFundingPhase('pick-funders');
    setIsFunder(false);
  }

  const openModal = (text) => {
    setModalText(text);
    setIsModal(true);
  };

  const toggleItemClaim = (itemId) => {
    if (!currentFunder) return;
    setItemFunders((prev) => {
      const next = { ...prev };
      if (next[itemId] === currentFunder.id) {
        delete next[itemId];
      } else {
        next[itemId] = currentFunder.id;
      }
      return next;
    });
    playTap();
  };

  const handleBack = () => {
    if (isFunder === true && fundingPhase === 'claim-items') {
      if (activeFunderIndex > 0) {
        setActiveFunderIndex((index) => index - 1);
      } else {
        setFundingPhase('pick-funders');
      }
      return;
    }
    router.push("/item");
  };

  const handleNext = () => {
    if (isFunder === null) {
      openModal('Please select an option');
      return;
    }

    if (isFunder === false) {
      saveDraft({ members, items, total, assignments: {}, itemFunders: {}, step: 3, route: '/split' });
      router.push('/split');
      return;
    }

    if (fundingPhase === 'pick-funders') {
      if (selectedFunders.length === 0) {
        openModal('Please select at least one funder');
        return;
      }

      if (selectedFunders.length === 1) {
        const funded = Object.fromEntries(items.map((item) => [item.id, selectedFunders[0].id]));
        setItemFunders(funded);
        saveDraft({ members, items, total, assignments: {}, itemFunders: funded, step: 3, route: '/split' });
        router.push('/split');
        return;
      }

      setFundingPhase('claim-items');
      setActiveFunderIndex(0);
      return;
    }

    // fundingPhase === 'claim-items'
    const isLastFunder = activeFunderIndex === selectedFunders.length - 1;
    if (!isLastFunder) {
      setActiveFunderIndex((index) => index + 1);
      return;
    }

    const allItemsClaimed = items.every((item) => !!itemFunders[item.id]);
    if (!allItemsClaimed) {
      openModal('Every item needs a funder before you can continue.');
      return;
    }

    saveDraft({ members, items, total, assignments: {}, itemFunders, step: 3, route: '/split' });
    router.push('/split');
  };

  const nextLabel =
    isFunder === true && fundingPhase === 'claim-items' && activeFunderIndex < selectedFunders.length - 1
      ? 'Next funder'
      : 'Next';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <ScreenHeader
          eyebrow="STEP 3 / 5"
          eyebrowMuted="BILL NOT LOGGED YET"
          title="Who frontend the cash?"
          currentStep={3}
        />

        <View style={styles.dialogBox}>
          <Text style={styles.dialogText}>{typeDialogText}</Text>
          <Text style={styles.dialogArrow}>▼</Text>
        </View>

        <ScrollView style={{backgroundColor: "#FFF"}}>
          <View style={styles.content}>
            {isFunder === true && fundingPhase === 'claim-items' && currentFunder ? (
              <>
                <Text style={styles.metaText}>
                  FUNDER {activeFunderIndex + 1} OF {selectedFunders.length} · {currentFunder.name.toUpperCase()} — WHICH ITEMS DID THEY PAY FOR?
                </Text>

                <View style={styles.memberList}>
                  {items.map((item) => {
                    const claimedBy = itemFunders[item.id];
                    const isMine = claimedBy === currentFunder.id;
                    const isClaimedByOther = !!claimedBy && !isMine;
                    const claimant = isClaimedByOther ? members.find((m) => m.id === claimedBy) : null;

                    return (
                      <Pressable
                        key={item.id}
                        disabled={isClaimedByOther}
                        onPress={() => toggleItemClaim(item.id)}
                        style={[
                          styles.memberRow,
                          isMine && styles.selectedFunder,
                          isClaimedByOther && styles.claimedByOther,
                        ]}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>₱{item.price}</Text>
                        {isClaimedByOther && (
                          <Text style={styles.claimedLabel}>claimed by {claimant?.name}</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <View style={styles.optionRow}>
                  <Pressable
                    onPress={() => {
                      setIsFunder(true);
                      playTap();
                    }}
                    style={[styles.option, isFunder === true ? styles.pressed : styles.notPressed]}>
                    <Text style={styles.optionText}>Someone Paid</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      handleSplitEvenly();
                      playTap();
                    }}
                    style={[styles.option, isFunder === false ? styles.pressed : styles.notPressed]}>
                    <Text style={styles.optionText}>Split Evenly</Text>
                  </Pressable>
                </View>
                <Text style={styles.metaText}>
                  { 
                    isFunder ? (items.length === 1 ?
                    'PICK THE FUNDER (ONLY ONE ITEM)' :
                    `PICK THE FUNDER${selectedFunders.length > 1 ? 'S' : ''}`) : "ITEMS WILL SPLIT EVENLY"
                  }
                </Text>

                <View style={styles.memberList}>
                  {members.map((member, index) =>
                    isFunder === false ? (
                      <View key={member.id} style={styles.memberRow}>
                        <View
                          style={[
                            styles.memberAvatar,
                            { backgroundColor: member.type.border },
                          ]}>
                          <Text style={styles.memberAvatarText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <View
                          style={[
                            styles.memberBadge,
                            { backgroundColor: member.type.bg, borderColor: member.type.border },
                          ]}>
                          <Text style={[styles.memberBadgeText, { color: member.type.text }]}>
                            {member.type.label}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Pressable
                        key={member.id}
                        style={({ pressed }) => [styles.memberRow, pressed && styles.selectedFunder]}
                        onPress={() => {
                          toggleFunder(member.id);
                          playTap();
                        }}>
                        <View
                          style={[
                            styles.memberAvatar,
                            { backgroundColor: member.type.border }
                          ]}>
                          <Text style={styles.memberAvatarText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <View
                          style={[
                            styles.memberBadge,
                            { backgroundColor: member.type.bg, borderColor: member.type.border },
                          ]}>
                          <Text style={[styles.memberBadgeText, { color: member.type.text }]}>
                            {member.type.label}
                          </Text>
                        </View>
                      </Pressable>
                    )
                  )}
                </View>
                {
                  isFunder === true &&
                  selectedFunders.map(item => (
                    <View key={item.id} style={[styles.memberRow, {backgroundColor: PokemonColors.darkContainer, paddingVertical: 20}]}>
                      <View
                        style={[
                          styles.memberAvatar,
                          { backgroundColor: PokemonColors.yellow },
                        ]}>
                        <Text style={styles.memberAvatarText}>★</Text>
                      </View>

                      <Text style={styles.funderName}>{item.name}</Text>
                    </View>
                  ))
                }
              </>
            )}
          </View>
        </ScrollView>

        <ScreenFooter
          nextLabel={nextLabel}
          onNext={handleNext}
          onBack={handleBack}
        />
      </View>

      <Modal text={modalText} isModal={isModal} metal={false} closeModal={() => setIsModal(prev => !prev)} />
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 12,
    backgroundColor: "#FFFFF",
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 5
  },
  optionText: {
    fontSize: 16,
    fontWeight: '800',
    color: PokemonColors.border,
  },
  metaText: {
    color: '#7A7E88',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  memberList: {
    gap: 10,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PokemonColors.border
  },
  memberAvatarText: {
    color: PokemonColors.bodyText,
    fontSize: 13,
    fontWeight: '800',
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  memberBadge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  claimedByOther: {
    backgroundColor: PokemonColors.screenBackground,
    opacity: 0.6,
  },
  claimedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PokemonColors.mutedText,
  },
  funderName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 800
  },
  pressed: {
    backgroundColor: PokemonColors.yellow
  },
  notPressed: {
    backgroundColor: "#FFFFFF"
  },
  selectedFunder: {
    backgroundColor: PokemonColors.yellow,
    opacity: 0.8
  }
});
