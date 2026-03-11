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
import { Ionicons } from '@expo/vector-icons';
import { getSettings, updateSettings, getBaseUrl, setBaseUrl } from '../api';

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
    // Validate
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadSettings}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Alert Thresholds</Text>
        <View style={styles.card}>
          <FieldInput
            label="Min Temperature"
            value={minTemp}
            onChangeText={setMinTemp}
            placeholder="e.g. 35"
            suffix="°F"
          />
          <FieldInput
            label="Max Temperature"
            value={maxTemp}
            onChangeText={setMaxTemp}
            placeholder="e.g. 100"
            suffix="°F"
          />
          <FieldInput
            label="Min Humidity"
            value={minHumidity}
            onChangeText={setMinHumidity}
            placeholder="e.g. 30"
            suffix="%"
          />
          <FieldInput
            label="Max Humidity"
            value={maxHumidity}
            onChangeText={setMaxHumidity}
            placeholder="e.g. 90"
            suffix="%"
          />
          <FieldInput
            label="Alert Cooldown"
            value={cooldown}
            onChangeText={setCooldown}
            placeholder="e.g. 30"
            suffix="min"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save Thresholds</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Server Configuration</Text>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Backend URL</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://localhost:8000"
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    minWidth: 80,
    textAlign: 'right',
    color: '#1e293b',
  },
  suffix: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 6,
    width: 24,
  },
  saveBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 15,
  },
});
