import useTyper from '@/hooks/useTyper';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenFooter from '@/components/screen-footer';
import ScreenHeader from '@/components/screen-header';
import { PokemonColors } from '@/constants/app-theme';
import { Sounds } from '@/constants/sounds';
import { AppContext } from '@/context/context';
import { useSoundEffect } from '@/hooks/use-sound-effect';
import { useContext, useState } from 'react';

// pets
import Capybara from "@/assets/images/pets/capybara.png";
import Cosmic from "@/assets/images/pets/cosmic.png";
import Moon from "@/assets/images/pets/moon.png";
import Owl from "@/assets/images/pets/owl.png";
import Panda from "@/assets/images/pets/panda.png";
import Screw from "@/assets/images/pets/screw.png";
import Wolf from "@/assets/images/pets/wolf.png";


export default function PetScreen() {
  // this is for useTyper
  const DIALOG_TEXT = "Who will keep an eye on the loot?";
  const TYPE_SPEED_MS = 30;
  const pets = [ 
    { src:Panda, value: "panda" }, { src:Screw, value: "screw" }, { src:Wolf, value: "wolf" },
    { src:Capybara, value: "capybara" }, { src:Cosmic, value: "cosmic" }, { src:Owl, value: "owl" },
    { src:Moon, value: "moon" },
  ];
  const {
    setPet
  } = useContext(AppContext);

  const [isPet, setIsPet] = useState({bool: false, value: null});
  const playTap = useSoundEffect(Sounds.tap);
  const router = useRouter();

  // call the custom hook
  const typedDialogText = useTyper(DIALOG_TEXT, TYPE_SPEED_MS);

  const handleChoosePet = (pet) => {
    setPet(pet.src);
    setIsPet({...pet, bool: true, value: pet.value});
    
    playTap();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            eyebrow="CHOOSE YOUR PARTNER"
            eyebrowMuted="BILL NOT LOGGED YET"
            title="Pick your buddy"
          />
        </View>

        <View style={styles.dialogBox}>
          <Text style={styles.dialogText}>{typedDialogText}</Text>
          <Text style={styles.dialogArrow}>▼</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.petContainer}>
            {
              pets.map((pet, index) => (
                <Pressable style={({ pressed }) => [styles.petCol, pressed && styles.pressed]} key={index} onPress={() => handleChoosePet(pet)}>
                  <Image style={styles.pet} source={pet.src} />
                  <Text style={styles.petName}>{pet.value.toUpperCase()}</Text>
                </Pressable>
              ))
            }
          </View>

          {
            isPet && isPet.bool === true &&
            <View style={[styles.memberCol, {backgroundColor: PokemonColors.darkContainer, paddingVertical: 20}]}>
              <View>
                <Text style={{color: PokemonColors.yellow}}>YOUR BILL BUDDY</Text>
              </View>

              <Text style={styles.chosenPet}>{isPet.value}</Text>
            </View>
          }
        </ScrollView>

        <ScreenFooter
          showBack={false}
          nextLabel="Home Screen"
          onNext={() => router.push('./')}
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
  headerWrap: {
    position: 'relative',
  },
  dialogBox: {
    backgroundColor: PokemonColors.cream,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 3,
    borderBottomColor: PokemonColors.border,
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
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  instruction: {
    fontSize: 16,
    fontWeight: 600
  },
  petContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8
  },  
  petCol: {
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.2)",
    padding: 2,
    borderRadius: 10
  },
  pet: {
    width: 100,
    height: 100,
  },
  petName: {
    fontSize: 14,
    fontWeight: 600
  },  
  screenText: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  screenTextYellow: {
    color: PokemonColors.yellow,
  },
  screenTextWhite: {
    color: '#FFFFFF',
  },
  metaText: {
    color: '#7A7E88',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    backgroundColor: "rgba(245, 196, 69, 0.5)",
    borderBottomWidth: 4,
    borderColor: PokemonColors.border
  },
  memberCol: {
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 2,
    borderColor: PokemonColors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 20
  },
  chosenPet: {
    color: "#FFFFFF", 
    fontSize: 16, 
    textTransform: "capitalize", 
    fontWeight: 700
  }
});