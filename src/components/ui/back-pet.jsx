// back-pet.jsx
// Small generic Pokémon-like pet, drawn facing left so it doubles as a
// "go back" affordance when used as a back-button icon. Purely decorative —
// not tied to any other mascot in the app.
//
// Requires react-native-svg:
//   npx expo install react-native-svg

import { PokemonColors } from '@/constants/app-theme';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const BODY = PokemonColors.lightBlue;
const BODY_SHADE = '#6FAEDD';
const BELLY = PokemonColors.cream;

export default function BackPet({ width = 30 }) {
  const height = (width * 200) / 200;

  return (
    <Svg width={width} height={height} viewBox="0 0 200 200">
      {/* Tail, trailing to the right */}
      <Path
        d="M150 120 C175 115, 180 95, 165 85 C172 100, 165 112, 148 112 Z"
        fill={BODY_SHADE}
        stroke={PokemonColors.border}
        strokeWidth={4}
        strokeLinejoin="round"
      />

      {/* Body */}
      <Ellipse
        cx="100"
        cy="115"
        rx="55"
        ry="48"
        fill={BODY}
        stroke={PokemonColors.border}
        strokeWidth={5}
      />

      {/* Belly */}
      <Ellipse cx="95" cy="128" rx="28" ry="22" fill={BELLY} opacity={0.9} />

      {/* Ear, swept back */}
      <Path
        d="M78 68 C68 40, 82 22, 100 20 C90 38, 92 56, 96 72 Z"
        fill={BODY}
        stroke={PokemonColors.border}
        strokeWidth={4.5}
        strokeLinejoin="round"
      />

      {/* Snout, pointing left */}
      <Path
        d="M50 118 C36 116, 28 122, 30 130 C32 138, 44 140, 56 136 Z"
        fill={BODY_SHADE}
        stroke={PokemonColors.border}
        strokeWidth={4}
        strokeLinejoin="round"
      />

      {/* Eye, looking left */}
      <Circle cx="62" cy="106" r="9" fill={PokemonColors.border} />
      <Circle cx="59" cy="103" r="3" fill="#FFFFFF" />

      {/* Little feet */}
      <Ellipse cx="80" cy="160" rx="14" ry="8" fill={BODY_SHADE} stroke={PokemonColors.border} strokeWidth={3.5} />
      <Ellipse cx="118" cy="160" rx="14" ry="8" fill={BODY_SHADE} stroke={PokemonColors.border} strokeWidth={3.5} />
    </Svg>
  );
}
