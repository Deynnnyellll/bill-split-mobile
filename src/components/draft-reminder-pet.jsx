import { AppContext } from '@/context/context';
import { useContext, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';

import { PokemonColors, PokemonTypography } from '@/constants/app-theme';
import { getDraft } from '@/utils/split-draft';

import Panda from "@/assets/images/pets/panda.png";

const POSE_INTERVAL_MS = 2000;

export default function DraftReminderPet({ onResume}) {
  const [draft, setDraft] = useState(null);
  const [visible, setVisible] = useState(true);
  const { pet } = useContext(AppContext);

  useEffect(() => {
    let cancelled = false;

    getDraft().then((saved) => {
      if (!cancelled) setDraft(saved);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Loop the idle <-> tilt crossfade every 2s for as long as the reminder
  // (i.e. a draft) is showing.
  useEffect(() => {
    if (!draft) return;

    return () => clearInterval(id);
  }, [draft]);

  const closeReminder = () => setVisible(false);

  if (!draft) return null;

  return (
    <>
      {
      visible &&
      <Animated.View entering={SlideInRight.duration(450)} exiting={SlideOutRight.duration(300)} style={styles.wrapper} pointerEvents="box-none">
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>Hey Trainer, you have an unfinished bill split!</Text>
          <Pressable
            onPress={() => onResume?.(draft)}
            style={({ pressed }) => [styles.resumeButton, pressed && styles.pressed]}>
            <Text style={styles.resumeButtonText}>Resume</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={closeReminder}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>
          <View style={styles.bubbleArrow} />
        </View>

        <View style={styles.petSlot}>
            <Image style={styles.pet} source={pet ? pet : Panda} />
        </View>
      </Animated.View>
      }
    </>
  );
}

const styles = StyleSheet.create({
  petSlot: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pet: {
    width: 130,
    height: 130,
    transform: "scaleX(-1)"
  },
  wrapper: {
    position: 'absolute',
    top: "70%",
    right: 0,
    bottom: 150,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  bubble: {
    backgroundColor: PokemonColors.dialogBackground,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderBottomWidth: 6,
    borderRightWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: 170,
    marginRight: -14,
    marginTop: -100,
    gap: 8,
  },
  bubbleText: {
    color: PokemonColors.bodyText,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  bubbleArrow: {
    position: 'absolute',
    top: 40,
    right: -10,
    bottom: 18,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: PokemonColors.border,
  },
  resumeButton: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 10,
    backgroundColor: PokemonColors.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resumeButtonText: {
    ...PokemonTypography.buttonText,
    fontSize: 13,
    color: PokemonColors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: PokemonColors.bodyText,
    padding: 2,
    borderRadius: 10,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: 20,
    width: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  closeText: {
    fontSize: 10,
    fontWeight: 700,
    color: "#FFF"
  }
});
