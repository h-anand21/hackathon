export const Colors = {
  background: '#09090b',
  foreground: '#fafafa',
  card: '#09090b',
  cardForeground: '#fafafa',
  border: '#ffffff', // For Neo-brutalist borders, we use solid white or high-contrast border
  borderDark: '#27272a',
  primary: '#2dd4bf', // Teal
  primaryForeground: '#09090b',
  accent: '#fbbf24', // Amber/Yellow
  accentForeground: '#09090b',
  muted: '#18181b',
  mutedForeground: '#a1a1aa',
  destructive: '#fb7185',
  success: '#34d399',
  chartColors: [
    '#2dd4bf', // Teal
    '#fbbf24', // Amber
    '#34d399', // Green
    '#a3e635', // Lime
    '#facc15', // Yellow
  ]
};

export const BrutalStyles = {
  border: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  shadow: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, // Android equivalent shadow
  },
  shadowAccent: {
    shadowColor: '#fbbf24',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  shadowPrimary: {
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    paddingHorizontal: 20,
    paddingVertical: 15,
  }
};
