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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getLatestReading, getSettings } from '../api';
import { formatTemperature, formatHumidity, formatTimeAgo, isOnline } from '../utils/formatters';
import ReadingCard from '../components/ReadingCard';
import StatusIndicator from '../components/StatusIndicator';
import { colors, glassCard, spacing } from '../theme';

const POLL_INTERVAL = 30000;

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
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.mint} />
        <Text style={styles.loadingText}>Initializing sensors...</Text>
      </LinearGradient>
    );
  }

  if (error && !reading) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.center}>
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textTertiary} />
        </View>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData(true)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const online = isOnline(reading?.timestamp);
  const tempValue = formatTemperature(reading?.temperature);
  const humValue = formatHumidity(reading?.humidity);

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.mint}
            progressBackgroundColor={colors.bgDeep}
          />
        }
      >
        {/* Status Badge */}
        <StatusIndicator reading={reading} settings={settings} />

        {/* Hero Temperature Display */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>TEMPERATURE</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroValue}>{tempValue}</Text>
            <Text style={styles.heroUnit}>°F</Text>
          </View>
        </View>

        {/* Reading Cards */}
        <View style={styles.cardsRow}>
          <ReadingCard
            icon="thermometer-outline"
            label="Temperature"
            value={tempValue}
            unit="°F"
            color={colors.tempColor}
          />
          <ReadingCard
            icon="water-outline"
            label="Humidity"
            value={humValue}
            unit="%"
            color={colors.humidityColor}
          />
        </View>

        {/* Data Strip */}
        <View style={styles.dataStrip}>
          <View style={styles.dataPoint}>
            <Text style={styles.dataLabel}>STATUS</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: online ? colors.green : colors.red }]} />
              <Text style={[styles.dataValue, { color: online ? colors.green : colors.red }]}>
                {online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <View style={styles.dataPoint}>
            <Text style={styles.dataLabel}>LAST UPDATE</Text>
            <Text style={styles.dataValue}>{formatTimeAgo(reading?.timestamp)}</Text>
          </View>
          <View style={styles.dataPoint}>
            <Text style={styles.dataLabel}>DEW POINT</Text>
            <Text style={styles.dataValue}>--</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: 16,
    color: colors.textTertiary,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: colors.mintDim,
    borderWidth: 1,
    borderColor: colors.mint,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryText: {
    color: colors.mint,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroValue: {
    fontSize: 96,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -6,
    lineHeight: 96,
  },
  heroUnit: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.textTertiary,
    marginLeft: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  dataStrip: {
    ...glassCard,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  dataPoint: {
    alignItems: 'center',
    flex: 1,
  },
  dataLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  dataValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
