import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTimestamp } from '../utils/formatters';
import { colors, glassCard, spacing } from '../theme';

const ALERT_CONFIG = {
  low_temperature: { icon: 'arrow-down-circle', color: '#80d8ff', label: 'Low Temperature' },
  high_temperature: { icon: 'arrow-up-circle', color: '#ff8a80', label: 'High Temperature' },
  low_humidity: { icon: 'arrow-down-circle', color: '#b388ff', label: 'Low Humidity' },
  high_humidity: { icon: 'arrow-up-circle', color: '#ffcc80', label: 'High Humidity' },
};

export default function AlertItem({ alert }) {
  const config = ALERT_CONFIG[alert.alert_type] || {
    icon: 'alert-circle',
    color: colors.textSecondary,
    label: alert.alert_type,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: config.color + '15' }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
          {alert.notified && (
            <View style={styles.notifiedBadge}>
              <Text style={styles.notifiedText}>NOTIFIED</Text>
            </View>
          )}
        </View>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(alert.timestamp)}</Text>
      </View>
      {/* Left accent line */}
      <View style={[styles.accentLine, { backgroundColor: config.color + '40' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    ...glassCard,
    padding: spacing.md,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 2,
    borderRadius: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeLabel: {
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
    letterSpacing: 0.5,
  },
  notifiedBadge: {
    backgroundColor: colors.greenDim,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.green + '30',
  },
  notifiedText: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
});
