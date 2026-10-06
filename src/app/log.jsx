import useTyper from '@/hooks/useTyper';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenFooter from '@/components/screen-footer';
import ScreenHeader from '@/components/screen-header';
import { PokemonColors, PokemonTypography } from '@/constants/app-theme';

export default function LogScreen() {
  const router = useRouter();
  
  const DIALOG_TEXT = "How should we log what you bought?";
  const TYPE_SPEED_MS = 30;

  const typeDialogText = useTyper(DIALOG_TEXT, TYPE_SPEED_MS);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <ScreenHeader
          eyebrow="STEP 2 / 5"
          eyebrowMuted="BILL NOT LOGGED YET"
          title="Who's in the party?"
          currentStep={2}
        />

        <View style={styles.dialogBox}>
          <Text style={styles.dialogText}>{typeDialogText}</Text>
          <Text style={styles.dialogArrow}>▼</Text>
        </View>

        <View style={styles.content}>
          <Pressable style={({ pressed }) =>[styles.option, pressed && styles.pressed]}>
            <View style={styles.optionIcon1}>
                <Text style={styles.optionIconText}>SCAN</Text>
            </View>

            <View>
                <Text style={styles.optionHeadingText}>Scan Receipt</Text>
                <Text style={styles.optionCaptionText}>Point the camera, we read the lines</Text>
            </View>
          </Pressable>

          <Pressable style={({ pressed }) =>[styles.option, pressed && styles.pressed]}>
            <View style={styles.optionIcon2}>
                <Text style={styles.optionIconText}>TYPE</Text>
            </View>

            <View>
                <Text style={styles.optionHeadingText}>MANUAL</Text>
                <Text style={styles.optionCaptionText}>Add each item and price by hand</Text>
            </View>
          </Pressable>
        </View>

        <ScreenFooter
          nextLabel="Next"
          onBack={() => router.back()}
          onNext={() => router.push("/item")}
        />
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
    backgroundColor: PokemonColors.contentBackground,
  },
  pressed: {
    backgroundColor: PokemonColors.cream
  },
  option: {
    flexDirection: "row",
    gap: 14,
    borderWidth: 4,
    borderColor: PokemonColors.border,
    padding: 14,
    borderRadius: 14
  },
  optionIcon1: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    width: 50,
    height: 50,
    padding: 5,
    backgroundColor: PokemonColors.lightBlue,
    borderRadius: 10
  },
  optionIcon2: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    width: 50,
    height: 50,
    padding: 5,
    backgroundColor: PokemonColors.yellow,
    borderRadius: 10
  },
  optionIconText: {
    fontSize: 10
  },
  optionHeadingText: {
    fontSize: PokemonTypography.buttonText.fontSize,
    fontWeight: PokemonTypography.buttonText.fontWeight
  },
  optionCaptionText: {
    fontSize: PokemonTypography.metaText.fontSize,
    color: PokemonColors.mutedText
  }
});
