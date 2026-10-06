// rope-knot-dragon.jsx
// (kept the filename so the existing import in Modal.jsx doesn't need to change)
//
// Decorative header illustration: a longer rope tied in a knot, hugged by a
// small original yellow "superhero bunny" mascot — long ears, a short cape,
// and a star chest emblem. Purely visual — render positioned above/
// overlapping the tag's top edge.
//
// Requires react-native-svg:
//   npx expo install react-native-svg

import { PokemonColors } from '@/constants/app-theme';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const ROPE = '#B8895A';
const ROPE_SHADE = '#6E4B29';
const FUR = '#FFD23F';
const FUR_SHADE = '#F5C445';
const INNER_EAR = '#FDECC8';
const CAPE = '#C1524C';

export default function RopeKnotDragon({ width = 120 }) {
  // Taller viewBox: extra rope length was added above the knot.
  const height = (width * 305) / 220;

  return (
    <Svg width={width} height={height} viewBox="0 0 220 305">
      {/* Rope — extended top strand, stretches well above the knot */}
      <Path d="M110 0 L110 140" fill="none" stroke={ROPE} strokeWidth={10} strokeLinecap="round" />
      <Path d="M104 4 C108 35,106 70,110 100 C114 118,108 128,110 140" fill="none" stroke={ROPE_SHADE} strokeWidth={1.5} opacity={0.6} />
      <Path d="M116 4 C112 35,114 70,110 100 C106 118,112 128,110 140" fill="none" stroke={ROPE_SHADE} strokeWidth={1.5} opacity={0.6} />

      {/* Knot */}
      <Path
        d="M80 133 C55 119,52 159,84 169 C120 179,132 141,106 131 C84 123,70 149,98 159"
        fill="none"
        stroke={ROPE}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <Path
        d="M106 131 C126 119,148 133,138 163 C130 185,102 179,98 173"
        fill="none"
        stroke={ROPE}
        strokeWidth={11}
        strokeLinecap="round"
      />
      <Path
        d="M80 133 C55 119,52 159,84 169 C120 179,132 141,106 131 C84 123,70 149,98 159"
        fill="none"
        stroke={ROPE_SHADE}
        strokeWidth={2}
        opacity={0.5}
      />
      <Path
        d="M106 131 C126 119,148 133,138 163 C130 185,102 179,98 173"
        fill="none"
        stroke={ROPE_SHADE}
        strokeWidth={2}
        opacity={0.5}
      />

      {/* Rope — short tail below the knot, continues into the tag */}
      <Path d="M106 173 L106 217" fill="none" stroke={ROPE} strokeWidth={10} strokeLinecap="round" />
      <Path d="M100 176 C104 190,102 203,106 217" fill="none" stroke={ROPE_SHADE} strokeWidth={1.5} opacity={0.6} />

      {/* Cape, behind the body */}
      <Path
        d="M60 195 C40 215,36 245,55 260 C58 240,64 222,80 208 Z"
        fill={CAPE}
        stroke={PokemonColors.border}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      <Path
        d="M150 195 C170 215,174 245,155 260 C152 240,146 222,130 208 Z"
        fill={CAPE}
        stroke={PokemonColors.border}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />

      {/* Ears */}
      <Path
        d="M85 165 C70 130,68 90,82 65 C96 88,100 128,100 163 Z"
        fill={FUR}
        stroke={PokemonColors.border}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Path
        d="M135 165 C150 130,152 90,138 65 C124 88,120 128,120 163 Z"
        fill={FUR}
        stroke={PokemonColors.border}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Path d="M86 155 C76 128,76 98,86 78 C94 98,96 128,92 153 Z" fill={INNER_EAR} />
      <Path d="M134 155 C144 128,144 98,134 78 C126 98,124 128,128 153 Z" fill={INNER_EAR} />

      {/* Head */}
      <Ellipse cx="110" cy="200" rx="48" ry="44" fill={FUR} stroke={PokemonColors.border} strokeWidth={4.5} />

      {/* Eyes */}
      <Circle cx="94" cy="196" r="7.5" fill={PokemonColors.border} />
      <Circle cx="126" cy="196" r="7.5" fill={PokemonColors.border} />
      <Circle cx="91" cy="193" r="2.5" fill={PokemonColors.cream} />
      <Circle cx="123" cy="193" r="2.5" fill={PokemonColors.cream} />

      {/* Cheeks + nose */}
      <Ellipse cx="80" cy="212" rx="9" ry="6" fill={CAPE} opacity={0.55} />
      <Ellipse cx="140" cy="212" rx="9" ry="6" fill={CAPE} opacity={0.55} />
      <Path d="M104 214 L110 220 L116 214 Z" fill={FUR_SHADE} stroke={PokemonColors.border} strokeWidth={2} strokeLinejoin="round" />

      {/* Body, with a star emblem */}
      <Ellipse cx="110" cy="258" rx="46" ry="38" fill={FUR} stroke={PokemonColors.border} strokeWidth={4.5} />
      <Path
        d="M110 240 L114 251 L126 251 L116 258 L120 270 L110 262 L100 270 L104 258 L94 251 L106 251 Z"
        fill={CAPE}
        stroke={PokemonColors.border}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Arms hugging the knot */}
      <Path
        d="M75 175 C55 185,48 205,60 215 C65 202,70 192,82 185 Z"
        fill={FUR_SHADE}
        stroke={PokemonColors.border}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Path
        d="M145 175 C165 185,172 205,160 215 C155 202,150 192,138 185 Z"
        fill={FUR_SHADE}
        stroke={PokemonColors.border}
        strokeWidth={4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}