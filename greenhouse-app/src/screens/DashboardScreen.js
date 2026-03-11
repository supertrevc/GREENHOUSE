import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLatestReading, getSettings } from '../api';
import { formatTemperature, formatHumidity, formatTimeAgo, isOnline } from '../utils/formatters';
import ReadingCard from '../components/ReadingCard';
import StatusIndicator from '../components/StatusIndicator';

const POLL_INTERVAL = 30000; // 30 seconds

export default function DashboardScreen() {
  const [reading, setReading] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [readingData, settingsData] = await Promise.all([
        getLatestReading().catch(() => null),
        getSettings().catch(() => null),
      ]);
      if (readingData) setReading(readingData);
      if (settingsData) setSettings(settingsData);
      if (!readingData && !reading) {
        setError('No readings available yet.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(false);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error && !reading) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData(true)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const online = isOnline(reading?.timestamp);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <StatusIndicator reading={reading} settings={settings} />

      <View style={styles.cardsRow}>
        <ReadingCard
          icon="thermometer-outline"
          label="Temperature"
          value={formatTemperature(reading?.temperature)}
          unit="°F"
          color="#ef4444"
        />
        <ReadingCard
          icon="water-outline"
          label="Humidity"
          value={formatHumidity(reading?.humidity)}
          unit="%"
          color="#3b82f6"
        />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#94a3b8" />
          <Text style={styles.infoLabel}>Last updated</Text>
          <Text style={styles.infoValue}>{formatTimeAgo(reading?.timestamp)}</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={[styles.statusDot, { backgroundColor: online ? '#22c55e' : '#ef4444' }]} />
          <Text style={styles.infoLabel}>Sensor</Text>
          <Text style={[styles.infoValue, { color: online ? '#22c55e' : '#ef4444' }]}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 20,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
  },
  errorText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  cardsRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
