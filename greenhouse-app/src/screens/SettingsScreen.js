import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getSettings, updateSettings, getBaseUrl, setBaseUrl } from '../api';
import { colors, glassCard, spacing } from '../theme';

function FieldInput({ label, value, onChangeText, placeholder, suffix }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          returnKeyType="done"
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [minHumidity, setMinHumidity] = useState('');
  const [maxHumidity, setMaxHumidity] = useState('');
  const [cooldown, setCooldown] = useState('');
  const [serverUrl, setServerUrl] = useState(getBaseUrl());

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getSettings();
      setMinTemp(s.min_temperature != null ? String(s.min_temperature) : '');
      setMaxTemp(s.max_temperature != null ? String(s.max_temperature) : '');
      setMinHumidity(s.min_humidity != null ? String(s.min_humidity) : '');
      setMaxHumidity(s.max_humidity != null ? String(s.max_humidity) : '');
      setCooldown(String(s.alert_cooldown_minutes));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const minT = minTemp ? parseFloat(minTemp) : null;
    const maxT = maxTemp ? parseFloat(maxTemp) : null;
    const minH = minHumidity ? parseFloat(minHumidity) : null;
    const maxH = maxHumidity ? parseFloat(maxHumidity) : null;
    const cd = cooldown ? parseInt(cooldown, 10) : null;

    if (minT != null && maxT != null && minT >= maxT) {
      Alert.alert('Validation Error', 'Min temperature must be less than max temperature.');
      return;
    }
    if (minH != null && maxH != null && minH >= maxH) {
      Alert.alert('Validation Error', 'Min humidity must be less than max humidity.');
      return;
    }
    if (cd != null && cd < 1) {
      Alert.alert('Validation Error', 'Cooldown must be at least 1 minute.');
      return;
    }

    setSaving(true);
    try {
      const body = {};
      if (minTemp !== '') body.min_temperature = minT;
      if (maxTemp !== '') body.max_temperature = maxT;
      if (minHumidity !== '') body.min_humidity = minH;
      if (maxHumidity !== '') body.max_humidity = maxH;
      if (cooldown !== '') body.alert_cooldown_minutes = cd;

      await updateSettings(body);
      Alert.alert('Saved', 'Settings updated successfully.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleServerUrlSave = () => {
    if (!serverUrl.trim()) {
      Alert.alert('Error', 'Server URL cannot be empty.');
      return;
    }
    setBaseUrl(serverUrl.trim());
    Alert.alert('Saved', `Server URL set to ${serverUrl.trim()}`);
    loadSettings();
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.mint} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.textTertiary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadSettings}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Alert Thresholds Section */}
          <Text style={styles.sectionTitle}>ALERT THRESHOLDS</Text>
          <View style={styles.card}>
            <FieldInput
              label="Min Temperature"
              value={minTemp}
              onChangeText={setMinTemp}
              placeholder="35"
              suffix="°F"
            />
            <FieldInput
              label="Max Temperature"
              value={maxTemp}
              onChangeText={setMaxTemp}
              placeholder="100"
              suffix="°F"
            />
            <FieldInput
              label="Min Humidity"
              value={minHumidity}
              onChangeText={setMinHumidity}
              placeholder="30"
              suffix="%"
            />
            <FieldInput
              label="Max Humidity"
              value={maxHumidity}
              onChangeText={setMaxHumidity}
              placeholder="90"
              suffix="%"
            />
            <FieldInput
              label="Alert Cooldown"
              value={cooldown}
              onChangeText={setCooldown}
              placeholder="30"
              suffix="min"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.bgDeep} size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Thresholds</Text>
            )}
          </TouchableOpacity>

          {/* Server Configuration Section */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>SERVER</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Backend URL</Text>
              <TextInput
                style={[styles.input, { flex: 1, textAlign: 'left' }]}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://localhost:8000"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="url"
                returnKeyType="done"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleServerUrlSave}>
            <Text style={styles.secondaryBtnText}>Update Server URL</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 3,
    marginBottom: 12,
  },
  card: {
    ...glassCard,
    padding: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    minWidth: 80,
    textAlign: 'right',
    color: colors.textPrimary,
  },
  suffix: {
    fontSize: 13,
    color: colors.textTertiary,
    marginLeft: 8,
    width: 28,
  },
  saveBtn: {
    backgroundColor: colors.mint,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: colors.bgDeep,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  secondaryBtn: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
