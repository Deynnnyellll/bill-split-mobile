import Svg, {
  Circle,
  Defs,
  Ellipse,
  FeDropShadow,
  Filter,
  G,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Stop
} from 'react-native-svg';

export default function ThunderPetHugging({ width = 120 }) {
  // Calculates height dynamically based on the 500x500 square viewBox aspect ratio
  const height = (width * 500) / 500;

  return (
    <Svg width={width} height={height} viewBox="0 0 500 500">
      {/* Definitions for rich gradients and shadows */}
      <Defs>
        {/* Pikachu Classic Yellow Gradient */}
        <LinearGradient id="pikaYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF59D" />
          <Stop offset="30%" stopColor="#FFEB3B" />
          <Stop offset="80%" stopColor="#FDD835" />
          <Stop offset="100%" stopColor="#F57F17" />
        </LinearGradient>

        {/* Shadow/Depth Yellow Gradient for overlapping limbs */}
        <LinearGradient id="darkYellow" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FDD835" />
          <Stop offset="100%" stopColor="#E65100" />
        </LinearGradient>

        {/* Rosy Cheek Crimson Gradient */}
        <RadialGradient id="cheekRed" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor="#FF5252" />
          <Stop offset="70%" stopColor="#E53935" />
          <Stop offset="100%" stopColor="#B71C1C" />
        </RadialGradient>

        {/* Soft Pink Mouth Inner Gradient */}
        <LinearGradient id="mouthPink" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FF8A80" />
          <Stop offset="100%" stopColor="#FF5252" />
        </LinearGradient>

        {/* Global Drop Shadow for 3D depth */}
        <Filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <FeDropShadow dx="2" dy="6" stdDeviation="6" floodOpacity={0.18} />
        </Filter>
      </Defs>

      {/* TAIL (Lightning bolt peeking out from the left) */}
      <G filter="url(#shadow)">
        <Path
          d="M 160 380 L 100 350 L 120 300 L 70 270 L 90 200 L 40 160 L 95 160 L 120 220 L 95 230 L 150 260 L 130 310 L 180 340 Z"
          fill="url(#pikaYellow)"
          stroke="#4E342E"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        {/* Brown base of the tail */}
        <Path
          d="M 160 380 L 132 366 L 142 341 L 180 340 Z"
          fill="#5D4037"
          stroke="#4E342E"
          strokeWidth={2}
        />
      </G>

      {/* BACK BODY & FEET */}
      <G id="bodyAndFeet">
        {/* Left Foot */}
        <Ellipse
          cx="170"
          cy="430"
          rx="25"
          ry="15"
          transform="rotate(-10 170 430)"
          fill="url(#darkYellow)"
          stroke="#4E342E"
          strokeWidth={4}
        />
        {/* Right Foot */}
        <Ellipse
          cx="330"
          cy="430"
          rx="25"
          ry="15"
          transform="rotate(10 330 430)"
          fill="url(#darkYellow)"
          stroke="#4E342E"
          strokeWidth={4}
        />
        {/* Main Body Chubby Base */}
        <Path
          d="M 160 320 C 140 380, 160 440, 250 440 C 340 440, 360 380, 340 320 Z"
          fill="url(#pikaYellow)"
          stroke="#4E342E"
          strokeWidth={5}
          filter="url(#shadow)"
        />
      </G>

      {/* ARMS (Positioned dynamically in front to look like hugging) */}
      <G id="huggingArms" filter="url(#shadow)">
        {/* Left Hugging Arm */}
        <Path
          d="M 170 330 C 120 340, 140 400, 210 380 C 230 374, 215 340, 190 340"
          fill="url(#pikaYellow)"
          stroke="#4E342E"
          strokeWidth={4.5}
          strokeLinejoin="round"
        />
        {/* Left tiny claws */}
        <Path d="M 205 372 L 212 376 M 208 367 L 215 370" stroke="#4E342E" strokeWidth={3} strokeLinecap="round" />

        {/* Right Hugging Arm */}
        <Path
          d="M 330 330 C 380 340, 360 400, 290 380 C 270 374, 285 340, 310 340"
          fill="url(#pikaYellow)"
          stroke="#4E342E"
          strokeWidth={4.5}
          strokeLinejoin="round"
        />
        {/* Right tiny claws */}
        <Path d="M 295 372 L 288 376 M 292 367 L 285 370" stroke="#4E342E" strokeWidth={3} strokeLinecap="round" />
      </G>

      {/* HEAD (Tilted forward slightly for cuteness) */}
      <G transform="translate(250, 210) rotate(4)" filter="url(#shadow)">
        
        {/* Left Ear */}
        <G transform="translate(-75, -80) rotate(-35)">
          <Path
            d="M -25 10 C -25 -50, 0 -110, 20 -130 C 35 -100, 30 -30, 15 25 Z"
            fill="url(#pikaYellow)"
            stroke="#4E342E"
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* Black Ear Tip */}
          <Path
            d="M 0 -85 C 9 -101, 20 -130, 20 -130 C 20 -130, 31 -112, 28 -95 C 22 -80, 10 -75, 0 -85 Z"
            fill="#231F20"
          />
        </G>

        {/* Right Ear */}
        <G transform="translate(75, -80) rotate(35)">
          <Path
            d="M 25 10 C 25 -50, 0 -110, -20 -130 C -35 -100, -30 -30, -15 25 Z"
            fill="url(#pikaYellow)"
            stroke="#4E342E"
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* Black Ear Tip */}
          <Path
            d="M 0 -85 C -9 -101, -20 -130, -20 -130 C -20 -130, -31 -112, -28 -95 C -22 -80, -10 -75, 0 -85 Z"
            fill="#231F20"
          />
        </G>

        {/* Main Head Structure */}
        <Path
          d="M -110 0 C -140 60, -90 120, 0 120 C 90 120, 140 60, 110 0 C 90 -70, -90 -70, -110 0 Z"
          fill="url(#pikaYellow)"
          stroke="#4E342E"
          strokeWidth={5}
          strokeLinejoin="round"
        />

        {/* Red Cheeks */}
        <Circle cx="-85" cy="55" r="24" fill="url(#cheekRed)" stroke="#B71C1C" strokeWidth={1} />
        <Circle cx="85" cy="55" r="24" fill="url(#cheekRed)" stroke="#B71C1C" strokeWidth={1} />

        {/* Anime Eyes */}
        {/* Left Eye */}
        <G transform="translate(-45, 15)">
          <Circle cx="0" cy="0" r="16" fill="#231F20" />
          <Circle cx="-5" cy="-5" r="6.5" fill="#FFFFFF" /> {/* Main Twinkle */}
          <Circle cx="5" cy="6" r="2.5" fill="#FFFFFF" />   {/* Baby Twinkle */}
        </G>
        {/* Right Eye */}
        <G transform="translate(45, 15)">
          <Circle cx="0" cy="0" r="16" fill="#231F20" />
          <Circle cx="-5" cy="-5" r="6.5" fill="#FFFFFF" /> {/* Main Twinkle */}
          <Circle cx="5" cy="6" r="2.5" fill="#FFFFFF" />   {/* Baby Twinkle */}
        </G>

        {/* Tiny Nose */}
        <Polygon points="0,32 -4,26 4,26" fill="#231F20" />

        {/* Happy W-shaped Mouth */}
        <Path
          d="M -16 42 Q -8 34, 0 42 Q 8 34, 16 42"
          fill="none"
          stroke="#4E342E"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        {/* Open Cute Tongue Depth */}
        <Path
          d="M -10 41.5 C -10 60, 10 60, 10 41.5 Z"
          fill="url(#mouthPink)"
          stroke="#4E342E"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
