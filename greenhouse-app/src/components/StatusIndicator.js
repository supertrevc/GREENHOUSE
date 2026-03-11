import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MARGIN = 5; // degrees/percent from threshold to trigger yellow

export function getStatus(reading, settings) {
  if (!reading || !settings) return 'unknown';

  const { temperature, humidity } = reading;
  const { min_temperature, max_temperature, min_humidity, max_humidity } = settings;

  // Check for breaches (red)
  if (min_temperature != null && temperature < min_temperature) return 'red';
  if (max_temperature != null && temperature > max_temperature) return 'red';
  if (min_humidity != null && humidity < min_humidity) return 'red';
  if (max_humidity != null && humidity > max_humidity) return 'red';

  // Check for proximity warnings (yellow)
  if (min_temperature != null && temperature < min_temperature + MARGIN) return 'yellow';
  if (max_temperature != null && temperature > max_temperature - MARGIN) return 'yellow';
  if (min_humidity != null && humidity < min_humidity + MARGIN) return 'yellow';
  if (max_humidity != null && humidity > max_humidity - MARGIN) return 'yellow';

  return 'green';
}

const COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  unknown: '#9ca3af',
};

const LABELS = {
  green: 'Normal',
  yellow: 'Warning',
  red: 'Alert',
  unknown: 'Unknown',
};

export default function StatusIndicator({ reading, settings }) {
  const status = getStatus(reading, settings);
  const color = COLORS[status];

  return (
    <View style={[styles.container, { backgroundColor: color + '20', borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
  },
});
