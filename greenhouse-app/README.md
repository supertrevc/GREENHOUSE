# Greenhouse Monitoring App

React Native (Expo) mobile app for monitoring greenhouse temperature and humidity. Connects to the greenhouse backend API (Phases 1–3) and provides a complete UI for viewing sensor data, configuring alert thresholds, and reviewing alert history.

## Setup

```bash
cd greenhouse-app

# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

## Testing on a Physical Device

1. Install **Expo Go** from the App Store (iOS) or Google Play (Android)
2. Run `npx expo start` in this directory
3. Scan the QR code shown in the terminal with your phone's camera (iOS) or the Expo Go app (Android)
4. Make sure your phone and dev machine are on the same network

**Important:** Update the backend server URL in the Settings screen to point to your machine's local IP (e.g., `http://192.168.1.100:8000`) — `localhost` won't work from a physical device.

## Configuring the Backend URL

The app defaults to `http://localhost:8000`. To change it:

- **In the app:** Go to the **Settings** tab and update the "Backend URL" field
- **In code:** Edit the `BASE_URL` in `src/api.js`

## Screens

### Dashboard

The main screen showing current sensor readings at a glance:

- Large temperature (°F) and humidity (%) display
- Color-coded status indicator:
  - **Green** — readings are within thresholds with comfortable margin
  - **Yellow** — readings are within 5°F/5% of a threshold
  - **Red** — a threshold is currently breached
- "Last updated" timestamp
- Sensor status badge: **Online** (green) if last reading < 10 min old, **Offline** (red) otherwise
- Auto-refreshes every 30 seconds; pull-to-refresh supported

### History

Line charts showing temperature and humidity over time:

- Time range selector: Last 24 Hours / Last 7 Days / Last 30 Days
- Temperature chart with threshold reference lines
- Humidity chart with threshold reference lines
- Data point count indicator

### Settings

Configure alert thresholds and server connection:

- Min/Max Temperature (°F)
- Min/Max Humidity (%)
- Alert Cooldown (minutes)
- Backend Server URL
- Client-side validation (min < max, positive cooldown)
- Save confirmation or error feedback

### Alerts

Scrollable list of past alerts:

- Color-coded icons per alert type (low/high temp, low/high humidity)
- Alert message and timestamp
- "Notified" badge if push notification was sent
- Pull-to-refresh supported
- Empty state when no alerts exist

## Project Structure

```
greenhouse-app/
├── App.js                      # Entry point, tab navigation, push notification setup
├── src/
│   ├── api.js                  # Base URL config, fetch helpers
│   ├── screens/
│   │   ├── DashboardScreen.js  # Live readings display
│   │   ├── HistoryScreen.js    # Charts with time range selector
│   │   ├── SettingsScreen.js   # Threshold configuration
│   │   └── AlertsScreen.js     # Alert history list
│   ├── components/
│   │   ├── StatusIndicator.js  # Green/yellow/red status badge
│   │   ├── ReadingCard.js      # Large temp/humidity card
│   │   └── AlertItem.js        # Single alert row
│   └── utils/
│       └── formatters.js       # Date formatting, rounding helpers
├── package.json
└── app.json
```

## End-to-End Testing

1. Start the backend: `cd greenhouse-backend && uvicorn app.main:app --reload`
2. Run the simulator in live mode: `cd greenhouse-simulator && python simulator.py live --interval 10`
3. Start the app: `cd greenhouse-app && npx expo start`
4. Verify:
   - Dashboard shows current readings and auto-refreshes
   - History renders charts (run `python simulator.py backfill` first for data)
   - Settings loads and saves thresholds
   - Alerts shows alert history (run `python simulator.py stress` to trigger alerts)
   - Status indicator changes color based on threshold proximity
