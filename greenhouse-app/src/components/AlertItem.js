import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTimestamp } from '../utils/formatters';

const ALERT_CONFIG = {
  low_temperature: { icon: 'arrow-down-circle', color: '#3b82f6', label: 'Low Temperature' },
  high_temperature: { icon: 'arrow-up-circle', color: '#ef4444', label: 'High Temperature' },
  low_humidity: { icon: 'arrow-down-circle', color: '#8b5cf6', label: 'Low Humidity' },
  high_humidity: { icon: 'arrow-up-circle', color: '#f97316', label: 'High Humidity' },
};

export default function AlertItem({ alert }) {
  const config = ALERT_CONFIG[alert.alert_type] || {
    icon: 'alert-circle',
    color: '#64748b',
    label: alert.alert_type,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: config.color + '15' }]}>
        <Ionicons name={config.icon} size={24} color={config.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
          {alert.notified && (
            <View style={styles.notifiedBadge}>
              <Text style={styles.notifiedText}>Notified</Text>
            </View>
          )}
        </View>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(alert.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 14,
    flex: 1,
  },
  notifiedBadge: {
    backgroundColor: '#22c55e20',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  notifiedText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
