import { AppContext } from '@/context/context';
import useTyper from '@/hooks/useTyper';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenFooter from '@/components/screen-footer';
import ScreenHeader from '@/components/screen-header';
import { PokemonColors } from '@/constants/pokemon-theme';

import Modal from '@/components/modal';
import ReceiptView from '@/components/receipt-view';
import { clearDraft } from '@/utils/split-draft';
import { saveSplitToHistory } from '@/utils/split-history';

export default function AssignScreen() {
  const router = useRouter();
  const [isModal, setIsModal] = useState(false);
  const [isReceiptModal, setIsReceiptModal] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null); // 'download'

  const { items, members, total, assignments, itemFunders, setItems, setMembers, setAssignments, setItemFunders, setTotal, setSplitCompleted } = useContext(AppContext);

  const DIALOG_TEXT = 'Everyone share is set. You can tap share to send it around.';
  const TYPE_SPEED_MS = 30;

  const typeDialogText = useTyper(DIALOG_TEXT, TYPE_SPEED_MS);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const result = await saveSplitToHistory({ items, members, total, assignments, itemFunders });
    setSaving(false);

    // saveSplitToHistory returns the saved record on success, or null if the
    // write failed (e.g. AsyncStorage not linked) — only claim success when
    // it actually returned something.
    if (result) {
      setIsReceiptModal(true);
      console.log('[receipt] save result:', result);
    } else {
      setSaveFailed(true);
    }
  };

  // Cross-platform toast-ish message
  function notify(title, message) {
    if (Platform.OS === 'web') {
      window.alert(message ? `${title}\n${message}` : title);
    } else {
      Alert.alert(title, message);
    }
  }

  const handleDownload = async () => {
    if (busy) return;
    setBusy('download');
    const fileName = `receipt-${Date.now()}.png`;

    try {
      if (Platform.OS === 'web') {
        const html2canvas = (await import('html2canvas')).default;
        const node = document.getElementById('receipt-capture');
        const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Bill receipt' });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        return;
      }

      const MediaLibrary = await import('expo-media-library');
      const { captureRef } = await import('react-native-view-shot');

      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        notify('Permission needed', 'Allow photo access to save the receipt.');
        return;
      }
      const uri = await captureRef(receiptRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await MediaLibrary.saveToLibraryAsync(uri);
      notify('Receipt saved', 'You can find it in your Photos.');
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err);
        notify('Could not save receipt', 'Try again in a moment.');
      }
    } finally {
      setBusy(null);
    }
  };

  const closeReceiptModal = () => {
    setIsReceiptModal(false);
    setTimeout(() => {
      clearDraft();
      setTotal(0);
      setMembers([]);
      setItems([]);
      setAssignments({});
      setItemFunders({});
      setSplitCompleted(true);
      router.push("./");
    }, 500);
  }

  return (
    <SafeAreaView nativeID='receipt-capture' style={styles.safeArea}>
      <View style={styles.card}>
        <ScreenHeader
          eyebrow="STEP 5 / 5"
          eyebrowMuted={'BILL LOGGED'}
          title="Here's your receipt"
          currentStep={5}
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
          <ReceiptView
            items={items}
            members={members}
            total={total}
            assignments={assignments}
            itemFunders={itemFunders}
            handleDownload={handleDownload}
          />
        </ScrollView>

        <ScreenFooter
          nextLabel={saving ? 'Saving…' : 'Save the receipt'}
          onNext={handleSave}
          onBack={() => router.push("/split")}
        />
      </View>

      <Modal
        text="Every item needs at least one person tagged before you can see the receipt."
        isModal={isModal}
        metal={false}
        closeModal={() => setIsModal(false)}
      />

      <Modal
        text="Receipt saved."
        isModal={isReceiptModal}
        metal={true}
        closeModal={closeReceiptModal}
      />

      <Modal
        text="Couldn't save the receipt. Check your connection to local storage and try again."
        isModal={saveFailed}
        metal={false}
        closeModal={() => setSaveFailed(false)}
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
  },
});