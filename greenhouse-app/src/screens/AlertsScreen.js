import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getAlerts } from '../api';
import AlertItem from '../components/AlertItem';
import { colors, spacing } from '../theme';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts(true);
  }, [fetchAlerts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts(false);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.mint} />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchAlerts(true)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (alerts.length === 0) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.center}>
        <View style={styles.emptyIcon}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.green} />
        </View>
        <Text style={styles.emptyTitle}>All Clear</Text>
        <Text style={styles.emptyText}>No active alerts — all systems nominal.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={styles.content}
        data={alerts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <AlertItem alert={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.mint}
            progressBackgroundColor={colors.bgDeep}
          />
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
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
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
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
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.greenDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
