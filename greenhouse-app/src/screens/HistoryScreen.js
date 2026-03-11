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
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { getReadings, getSettings } from '../api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const RANGES = [
  { label: 'Last 24 Hours', hours: 24 },
  { label: 'Last 7 Days', hours: 168 },
  { label: 'Last 30 Days', hours: 720 },
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
      // API returns newest first, reverse for chronological chart order
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

  const renderChart = (data, label, color, unit, minThreshold, maxThreshold) => {
    if (data.length === 0) return null;

    const datasets = [{ data, color: () => color, strokeWidth: 2 }];

    // Add threshold reference lines
    if (minThreshold != null) {
      datasets.push({
        data: Array(data.length).fill(minThreshold),
        color: () => 'rgba(239, 68, 68, 0.4)',
        strokeWidth: 1,
        withDots: false,
      });
    }
    if (maxThreshold != null) {
      datasets.push({
        data: Array(data.length).fill(maxThreshold),
        color: () => 'rgba(239, 68, 68, 0.4)',
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
          withOuterLines={true}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: () => color,
            labelColor: () => '#94a3b8',
            propsForBackgroundLines: {
              stroke: '#e2e8f0',
              strokeDasharray: '',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && readings.length === 0 && (
        <View style={styles.center}>
          <Ionicons name="analytics-outline" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>No data for this time range.</Text>
        </View>
      )}

      {!loading && !error && readings.length > 0 && (
        <>
          {renderChart(
            tempData,
            'Temperature (°F)',
            '#ef4444',
            '°',
            settings?.min_temperature,
            settings?.max_temperature,
          )}
          {renderChart(
            humData,
            'Humidity (%)',
            '#3b82f6',
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 20,
  },
  rangeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 3,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rangeBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  rangeBtnTextActive: {
    color: '#1e293b',
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 60,
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
  },
  dataInfo: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
});
