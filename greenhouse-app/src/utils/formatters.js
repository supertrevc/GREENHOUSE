export function formatTemperature(temp) {
  if (temp == null) return '--';
  return `${Math.round(temp * 10) / 10}`;
}

export function formatHumidity(humidity) {
  if (humidity == null) return '--';
  return `${Math.round(humidity * 10) / 10}`;
}

export function formatTimestamp(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTimeAgo(isoString) {
  if (!isoString) return 'Never';
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.floor(diffHour / 24)}d ago`;
}

export function isOnline(isoString) {
  if (!isoString) return false;
  const diffMs = new Date() - new Date(isoString);
  return diffMs < 10 * 60 * 1000; // 10 minutes
}
