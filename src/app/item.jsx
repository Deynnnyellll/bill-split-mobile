import { AppContext } from '@/context/context';
import useTyper from '@/hooks/useTyper';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenFooter from '@/components/screen-footer';
import ScreenHeader from '@/components/screen-header';
import { PokemonColors } from '@/constants/pokemon-theme';
import { Sounds } from '@/constants/sounds';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import { saveDraft } from '@/utils/split-draft';

import Modal from '@/components/modal';


export default function ItemScreen() {
  const router = useRouter();
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [isModal, setIsModal] = useState(false);
  const [isDuplicateModal, setIsDuplicateModal] = useState(false);
  const playTap = useSoundEffect(Sounds.tap);
  const playConfirm = useSoundEffect(Sounds.confirm);

  const { members, items, setItems, total, setTotal } = useContext(AppContext);

  const DIALOG_TEXT = "Add every line on the bill. Prices get split next.";
  const TYPE_SPEED_MS = 30;

  const typeDialogText = useTyper(DIALOG_TEXT, TYPE_SPEED_MS);

  const addItem = () => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return;


    const parsedPrice = parseFloat(price);
    if (!price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) return;

    const trimmedCategory = category.trim();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const isDuplicate = items.some(item => 
      item.name === trimmedName && 
      item.category === trimmedCategory &&
      item.price === parsedPrice
    );

    // guard to prevent duplicate items
    if(isDuplicate) {
      setIsDuplicateModal(true);
      playConfirm();
      return;
    }

    setItems((prev) => [
      ...prev,
      { id, name: trimmedName, price: parsedPrice, category: trimmedCategory },
    ]);
    setItemName('');
    setCategory('');
    setPrice('');
    playTap();
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    playTap();
  };

  useEffect(() => {
    setTotal(items.reduce((sum, item) => sum + item.price, 0));
  }, [items])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <ScreenHeader
          eyebrow="STEP 2 / 5"
          eyebrowMuted={items.length === 0 ? "BILL NOT LOGGED YET" : `P${total.toFixed(0)} Bill`}
          title="What did we get?"
          currentStep={2}
        />

        <View style={styles.dialogBox}>
          <Text style={styles.dialogText}>{typeDialogText}</Text>
          <Text style={styles.dialogArrow}>▼</Text>
        </View>

        <ScrollView style={{backgroundColor: "#FFF"}}>
          <View style={styles.content}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputCategory}
                value={category}
                onChangeText={setCategory}
                placeholder="Category (e.g. Jollibee)"
                placeholderTextColor="#9A9EA8"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputName}
                value={itemName}
                onChangeText={setItemName}
                placeholder="Item name..."
                placeholderTextColor="#9A9EA8"
                returnKeyType="done"
                onSubmitEditing={addItem}
              />
              <TextInput
                style={styles.inputPrice}
                value={price}
                onChangeText={setPrice}
                placeholder="₱0"
                placeholderTextColor="#9A9EA8"
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={addItem}
              />
              <Pressable
                onPress={addItem}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
                <Text style={styles.addButtonText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.metaText}>ITEMS · {items.length} LOGGED</Text>

            <View style={styles.memberList}>
              {items.map((item, index) => (
                <View key={item.id} style={styles.memberRow}>
                  <View style={styles.itemNumberCont}>
                    <Text style={styles.itemNumber}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    {!!item.category && (
                      <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
                    )}
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.priceText}>₱{item.price.toFixed(2)}</Text>
                  <Pressable
                    onPress={() => removeItem(item.id)}
                    style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
                    <Text style={styles.removeButtonText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {
              items.length !== 0 &&
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>BILL TOTAL</Text>
                <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
              </View>
            }
          </View>
        </ScrollView>

        <ScreenFooter
          nextLabel="Next"
          onNext={items.length === 0 ? () => setIsModal(prev => !prev) : () => {
            saveDraft({ members, items, total, assignments: {}, itemFunders: {}, step: 2, route: '/assign' });
            router.push('/assign');
          }}
          onBack={() => router.push("/party")}
        />
      </View>

      <Modal text={"Your Bag is empty! Please enter some items."} isModal={isModal} metal={false} closeModal={() => setIsModal(prev => !prev)} />
      <Modal text={"Item already recorded in the dex!"} isModal={isDuplicateModal} metal={false} closeModal={() => setIsDuplicateModal(prev => !prev)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    backgroundColor: PokemonColors.cream,
  },
  card: {
    flex: 1,
    width: '100%',
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
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  inputCategory: {
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
  inputName: {
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
  inputPrice: {
    flex: 0.5,
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
    flexShrink: 0,
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
  itemNumberCont: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PokemonColors.yellow,
    borderWidth: 2,
    borderColor: PokemonColors.border
  },
  itemNumber: {
    color: PokemonColors.border,
    fontSize: 13,
    fontWeight: '800'
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '800',
    color: PokemonColors.mutedText ?? '#9A9EA8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PokemonColors.darkContainer,
    paddingTop: 14,
    marginTop: 4,
    padding: 14,
    borderRadius: 15
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: PokemonColors.yellow,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: "#FFFFFF",
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