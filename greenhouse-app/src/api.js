import { Alert } from 'react-native';

let BASE_URL = 'http://192.0.2.2:8000';

export function getBaseUrl() {
  return BASE_URL;
}

export function setBaseUrl(url) {
  // Strip trailing slash
  BASE_URL = url.replace(/\/+$/, '');
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}`);
    }
    return data;
  } catch (error) {
    if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
      throw new Error('Cannot reach server. Check your connection and server URL.');
    }
    throw error;
  }
}

export async function getLatestReading() {
  return request('/api/readings/latest');
}

export async function getReadings(hours) {
  return request(`/api/readings?hours=${hours}`);
}

export async function getSettings() {
  return request('/api/settings');
}

export async function updateSettings(settings) {
  return request('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function getAlerts(hours) {
  const query = hours ? `?hours=${hours}` : '';
  return request(`/api/alerts${query}`);
}
