import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReadingCard({ icon, label, value, unit, color = '#1e293b' }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={28} color={color} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={[styles.unit, { color }]}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 42,
    fontWeight: '700',
  },
  unit: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 2,
  },
});
