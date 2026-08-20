import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  heroToken: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  h1: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
  },
  tiny: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
