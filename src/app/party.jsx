import { AppContext } from '@/context/context';
import useTyper from '@/hooks/useTyper';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenFooter from '@/components/screen-footer';
import ScreenHeader from '@/components/screen-header';

import Modal from '@/components/modal';
import { PokemonColors } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import { saveDraft } from '@/utils/split-draft';

const MEMBER_TYPES = [
  { label: 'Grass', bg: '#B7E4B0', border: '#4C9A4C', text: '#2F6B2F' },
  { label: 'Fire', bg: '#F5A3A0', border: '#C1524C', text: '#8A2F2A' },
  { label: 'Water', bg: '#A9D9F2', border: '#3E82AE', text: '#2A5A78' },
];

export default function PartyScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const { members, setMembers } = useContext(AppContext);
  const [isModal, setIsModal] = useState(false);
  const [isDuplicateModal, setIsDuplicateModal] = useState(false);
  const playTap = useSoundEffect(Sounds.tap);
  const playConfirm = useSoundEffect(Sounds.confirm);

  const DIALOG_TEXT = "Who's in the party? Everyone gets a type colour.";
  const TYPE_SPEED_MS = 30;

  const typeDialogText = useTyper(DIALOG_TEXT, TYPE_SPEED_MS);

  const addMember = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const isDuplicate = members.some(member => member.name === trimmed);

    // guard to prevent duplicate items
    if(isDuplicate) {
      setIsDuplicateModal(true);
      playConfirm();
      return;
    }

    const type = MEMBER_TYPES[members.length % MEMBER_TYPES.length];
    setMembers((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, name: trimmed, type }]);
    setName('');
    playTap();
  };

  const removeMember = (id) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
    playTap();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <ScreenHeader
          eyebrow="STEP 1 / 5"
          eyebrowMuted="BILL NOT LOGGED YET"
          title="Who's in the party?"
          currentStep={1}
        />

        <View style={styles.dialogBox}>
          <Text style={styles.dialogText}>{typeDialogText}</Text>
          <Text style={styles.dialogArrow}>▼</Text>
        </View>

        <ScrollView style={{backgroundColor: "#FFF"}}>
          <View style={styles.content}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter name..."
                placeholderTextColor="#9A9EA8"
                returnKeyType="done"
                onSubmitEditing={addMember}
              />
              <Pressable
                onPress={addMember}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
                <Text style={styles.addButtonText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.metaText}>PARTY · {members.length} MEMBERS</Text>

            <View style={styles.memberList}>
              {members.map((member, index) => (
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
                  <Pressable
                    onPress={() => removeMember(member.id)}
                    style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <ScreenFooter
          nextLabel="Next"
          onNext={members.length <= 1 ? () => setIsModal(prev => !prev) : () => {
            saveDraft({ members, items: [], total: 0, assignments: {}, itemFunders: {}, step: 1, route: '/item' });
            router.push('/item');
          }}
          onBack={() => router.push("./")}
        />

        <Modal text={"Please register two or more Trainers to continue!"} isModal={isModal} metal={false} closeModal={() => setIsModal(prev => !prev)} />
          <Modal text={"Name already exists in the dex. Please rename to avoid a split conflict!"} isModal={isDuplicateModal} metal={false} closeModal={() => setIsDuplicateModal(prev => !prev)} />
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
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2A2A2A',
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    width: 48,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 12,
    backgroundColor: PokemonColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 22,
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
  },
  memberAvatarText: {
    color: '#FFFFFF',
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
  removeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: PokemonColors.border,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
