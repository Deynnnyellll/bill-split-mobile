import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    Modal as RNModal,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { PokemonColors } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import MetalHuggingRope from './ui/metal-hugging';
import RopeKnotDragon from './ui/rope-knot-dragon';
import ThunderPetHugging from './ui/thunder-pet';

export default function Modal(props) {
  const playTap = useSoundEffect(Sounds.tap);

  const fallAnim = useRef(new Animated.Value(-260)).current; // vertical drop-in
  const swingAnim = useRef(new Animated.Value(0)).current;   // pendulum tilt, in degrees
  const [groupHeight, setGroupHeight] = useState(0);

  useEffect(() => {
    if (!props.isModal) return;

    fallAnim.setValue(-260);
    swingAnim.setValue(0);

    Animated.timing(fallAnim, {
      toValue: 0,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Give it a starting tilt as if momentum from the fall carried it sideways,
      // then let a low-friction spring decay that into a settled, subtle sway.
      swingAnim.setValue(9);
      Animated.spring(swingAnim, {
        toValue: 0,
        friction: 3.2,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
  }, [props.isModal]);

  // Hinges the swing at the top of the group (where the rope is)
  const pivotShift = groupHeight / 2;
  const rotate = swingAnim.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
  });

  const handleClose = () => {
    props.closeModal();
    playTap();
  };

  return (
    <RNModal
      visible={!!props.isModal}
      transparent
      animationType="none" // our own drop + swing handles the animation
      statusBarTranslucent
      onRequestClose={handleClose} // Android back button
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.stage, { transform: [{ translateY: fallAnim }] }]}>
          <View
            style={styles.stage}
            onLayout={(e) => setGroupHeight(e.nativeEvent.layout.height)}
          >
            <Animated.View
              style={[
                styles.stage,
                {
                  transform: [
                    { translateY: -pivotShift },
                    { rotate },
                    { translateY: pivotShift },
                  ],
                },
              ]}
            >
              <View style={styles.illustrationWrap} pointerEvents="none">
                {props.thunder ? (
                  <ThunderPetHugging width={120} />
                ) : props.metal ? (
                  <MetalHuggingRope />
                ) : (
                  <RopeKnotDragon width={120} />
                )}
              </View>

              <View style={styles.tag}>
                <View style={styles.holeDot} />

                <Pressable
                  style={({ pressed }) => [styles.closeIcon, pressed && styles.pressed]}
                  onPress={handleClose}
                  hitSlop={10}
                >
                  <Text style={styles.closeIconText}>✕</Text>
                </Pressable>

                {!!props.title && <Text style={styles.titleText}>{props.title}</Text>}

                <Text style={styles.dialogText}>{props.text}</Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, // RNModal is already full-screen, so this fills the whole screen
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stage: {
    // Full-width wrappers so the tag's % width is measured against the screen
    width: '100%',
    alignItems: 'center',
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: -46, // overlaps the tag's top edge so the rope reads as threading in
  },
  tag: {
    backgroundColor: PokemonColors.cream,
    width: '85%',
    maxWidth: 300,
    minHeight: 200,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderBottomWidth: 7,
    borderBottomColor: PokemonColors.border,
    borderRadius: 20,
    padding: 24,
    paddingTop: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  holeDot: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PokemonColors.contentBackground,
    borderWidth: 3,
    borderColor: PokemonColors.border,
  },
  closeIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    backgroundColor: PokemonColors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: PokemonColors.bodyText,
  },
  titleText: {
    fontSize: 21,
    fontWeight: '700',
    color: PokemonColors.bodyText,
    textAlign: 'center',
  },
  dialogText: {
    color: PokemonColors.bodyText,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});