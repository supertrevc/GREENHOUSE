import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const MARGIN = 5;

export function getStatus(reading, settings) {
  if (!reading || !settings) return 'unknown';

  const { temperature, humidity } = reading;
  const { min_temperature, max_temperature, min_humidity, max_humidity } = settings;

  if (min_temperature != null && temperature < min_temperature) return 'red';
  if (max_temperature != null && temperature > max_temperature) return 'red';
  if (min_humidity != null && humidity < min_humidity) return 'red';
  if (max_humidity != null && humidity > max_humidity) return 'red';

  if (min_temperature != null && temperature < min_temperature + MARGIN) return 'yellow';
  if (max_temperature != null && temperature > max_temperature - MARGIN) return 'yellow';
  if (min_humidity != null && humidity < min_humidity + MARGIN) return 'yellow';
  if (max_humidity != null && humidity > max_humidity - MARGIN) return 'yellow';

  return 'green';
}

const STATUS_MAP = {
  green: { color: colors.green, bg: colors.greenDim, label: 'OPTIMAL', icon: '●' },
  yellow: { color: colors.yellow, bg: colors.yellowDim, label: 'WARNING', icon: '●' },
  red: { color: colors.red, bg: colors.redDim, label: 'ALERT', icon: '●' },
  unknown: { color: colors.textTertiary, bg: colors.bgCard, label: 'UNKNOWN', icon: '○' },
};

export default function StatusIndicator({ reading, settings }) {
  const status = getStatus(reading, settings);
  const { color, bg, label, icon } = STATUS_MAP[status];

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: color + '40' }]}>
      <Text style={[styles.dot, { color }]}>{icon}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    fontSize: 10,
  },
  label: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 2,
  },
});
