import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, glassCard, spacing } from '../theme';

export default function ReadingCard({ icon, label, value, unit, color = colors.mint }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={[styles.unit, { color }]}>{unit}</Text>
      </View>
      {/* Decorative glow line at bottom */}
      <View style={[styles.glowLine, { backgroundColor: color + '30' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    ...glassCard,
    padding: spacing.lg,
    alignItems: 'center',
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  unit: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 2,
  },
  glowLine: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 2,
    borderRadius: 1,
  },
});
