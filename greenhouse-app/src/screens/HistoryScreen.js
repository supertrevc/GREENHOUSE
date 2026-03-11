import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { getReadings, getSettings } from '../api';
import { colors, glassCard, spacing } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const RANGES = [
  { label: '24H', hours: 24 },
  { label: '7D', hours: 168 },
  { label: '30D', hours: 720 },
];

function downsample(data, maxPoints) {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, i) => i % step === 0);
}

function formatChartLabels(readings, hours) {
  if (readings.length === 0) return [];
  const count = Math.min(5, readings.length);
  const step = Math.max(1, Math.floor(readings.length / count));
  return readings.map((r, i) => {
    if (i % step !== 0 && i !== readings.length - 1) return '';
    const d = new Date(r.timestamp);
    if (hours <= 24) {
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });
}

export default function HistoryScreen() {
  const [range, setRange] = useState(RANGES[0]);
  const [readings, setReadings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [readingsData, settingsData] = await Promise.all([
        getReadings(range.hours),
        getSettings().catch(() => null),
      ]);
      setReadings(readingsData.reverse());
      if (settingsData) setSettings(settingsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartWidth = SCREEN_WIDTH - 40;
  const maxPoints = 50;
  const sampled = downsample(readings, maxPoints);
  const labels = formatChartLabels(sampled, range.hours);
  const tempData = sampled.map((r) => r.temperature);
  const humData = sampled.map((r) => r.humidity);

  const renderChart = (data, label, accentColor, unit, minThreshold, maxThreshold) => {
    if (data.length === 0) return null;

    const datasets = [{ data, color: () => accentColor, strokeWidth: 2 }];

    if (minThreshold != null) {
      datasets.push({
        data: Array(data.length).fill(minThreshold),
        color: () => 'rgba(248, 113, 113, 0.35)',
        strokeWidth: 1,
        withDots: false,
      });
    }
    if (maxThreshold != null) {
      datasets.push({
        data: Array(data.length).fill(maxThreshold),
        color: () => 'rgba(248, 113, 113, 0.35)',
        strokeWidth: 1,
        withDots: false,
      });
    }

    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{label}</Text>
        <LineChart
          data={{ labels, datasets }}
          width={chartWidth}
          height={200}
          yAxisSuffix={unit}
          withDots={false}
          withInnerLines={true}
          withOuterLines={false}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'rgba(255,255,255,0.02)',
            backgroundGradientTo: 'rgba(255,255,255,0)',
            decimalPlaces: 0,
            color: () => accentColor,
            labelColor: () => 'rgba(255, 255, 255, 0.3)',
            propsForBackgroundLines: {
              stroke: 'rgba(255, 255, 255, 0.06)',
              strokeDasharray: '4 4',
            },
            fillShadowGradientFrom: accentColor,
            fillShadowGradientTo: 'transparent',
            fillShadowGradientFromOpacity: 0.2,
            fillShadowGradientToOpacity: 0,
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Range Selector */}
        <View style={styles.rangeRow}>
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r.hours}
              style={[styles.rangeBtn, range.hours === r.hours && styles.rangeBtnActive]}
              onPress={() => setRange(r)}
            >
              <Text style={[styles.rangeBtnText, range.hours === r.hours && styles.rangeBtnTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <View style={styles.centerMsg}>
            <ActivityIndicator size="large" color={colors.mint} />
          </View>
        )}

        {error && (
          <View style={styles.centerMsg}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && readings.length === 0 && (
          <View style={styles.centerMsg}>
            <Ionicons name="analytics-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.errorText}>No data for this time range.</Text>
          </View>
        )}

        {!loading && !error && readings.length > 0 && (
          <>
            {renderChart(
              tempData,
              'Temperature',
              colors.tempColor,
              '°',
              settings?.min_temperature,
              settings?.max_temperature,
            )}
            {renderChart(
              humData,
              'Humidity',
              colors.humidityColor,
              '%',
              settings?.min_humidity,
              settings?.max_humidity,
            )}
            <Text style={styles.dataInfo}>
              {readings.length} readings · {range.label.toLowerCase()}
            </Text>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg - 4,
  },
  rangeRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 14,
  },
  rangeBtnActive: {
    backgroundColor: colors.mintDim,
    borderWidth: 1,
    borderColor: colors.mint + '30',
  },
  rangeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  rangeBtnTextActive: {
    color: colors.mint,
    fontWeight: '700',
  },
  chartCard: {
    ...glassCard,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  centerMsg: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: colors.mintDim,
    borderWidth: 1,
    borderColor: colors.mint,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 14,
  },
  retryText: {
    color: colors.mint,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dataInfo: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
  },
});
