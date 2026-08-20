export const colors = {
  // Backgrounds
  background: '#080C16', // Deep Obsidian Medical Navy
  surface: '#0F172A',
  surfaceHover: '#1E293B',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  glassBackground: 'rgba(15, 23, 42, 0.75)',

  // Medical Accents
  primary: '#06B6D4', // Medical Cyan
  primaryGlow: 'rgba(6, 182, 212, 0.25)',
  secondary: '#3B82F6', // Doctor Blue
  teal: '#0D9488',
  emerald: '#10B981', // Active Queue / Live Token Green

  // Statuses
  serving: '#10B981', // Green - Currently inside chamber
  waiting: '#F59E0B', // Amber - In waiting area
  completed: '#64748B', // Muted Slate - Done
  skipped: '#EF4444', // Red - Patient absent
  emergency: '#DC2626', // Bright Crimson - Emergency Token

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#080C16',

  // Cards
  cardBg: '#0F172A',
  cardBorder: 'rgba(255, 255, 255, 0.06)',
};

export const shadows = {
  glowPrimary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  glowServing: {
    shadowColor: colors.serving,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
};
