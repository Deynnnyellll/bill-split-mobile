export const PokemonColors = {
  navy: '#2B3A6B',
  cream: '#FBF6E3',
  yellow: '#F5C445',
  lightBlue: "#94C9EF",
  border: '#1A1A1A',
  dialogBackground: '#FCF3D6',
  dialogArrow: '#C1524C',
  contentBackground: '#FFFFFF',
  screenBackground: '#EDEEF2',
  eyebrowMuted: '#C7CCE0',
  mutedText: '#7A7E88',
  hintText: '#9A9EA8',
  bodyText: '#2A2A2A',
  stepActive: '#E4554F',
  darkContainer: "#20303C",
  stepLine: 'rgba(255, 255, 255, 0.35)',
  stepInactiveBorder: 'rgba(255, 255, 255, 0.5)',
  stepInactiveText: 'rgba(255, 255, 255, 0.7)',
} as const;

export const PokemonTypography = {
  eyebrow: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  eyebrowMuted: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  dialogText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  hint: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 0.5,
  },
} as const;

export const TYPE_BADGES = [
  { label: 'Grass', bg: '#B7E4B0', border: '#4C9A4C', text: '#2F6B2F' },
  { label: 'Fire', bg: '#F5A3A0', border: '#C1524C', text: '#8A2F2A' },
  { label: 'Water', bg: '#A9D9F2', border: '#3E82AE', text: '#2A5A78' },
] as const;
