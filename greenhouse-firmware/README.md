# Greenhouse Monitoring Firmware

Arduino firmware for an ESP32 microcontroller that reads temperature and humidity from a DHT22 sensor and sends data to the greenhouse backend API via HTTP POST. This replaces the Python simulator (Phase 2) with real hardware.

## Hardware Shopping List

| Part | Approx. Cost |
|---|---|
| ESP32 Development Board (NodeMCU-32S or similar) | $5–10 |
| DHT22 Sensor Module (pre-mounted on breakout board) | $3–5 |
| Breadboard | $3–5 |
| Jumper Wires (male-to-male and male-to-female) | included with breadboard kit |
| Micro-USB Cable (data-capable, not charge-only) | $2–3 |
| 10KΩ Resistor (pull-up for DHT22 data line) | $0.10 |

**Total: ~$15–25**

## Wiring Diagram

```
ESP32                     DHT22 Module
─────                     ────────────
                          ┌──────────┐
3.3V  ──────────────────► │ VCC (+)  │
                     ┌──► │ DATA     │
GPIO 4 ──────────────┤    │          │
                     │    │ GND (-)  │◄── GND
                     │    └──────────┘
                     │
                  [10KΩ]  (pull-up resistor)
                     │
3.3V  ───────────────┘

Pin Connections:
  ESP32 3.3V   →  DHT22 VCC (pin 1)
  ESP32 GPIO 4 →  DHT22 DATA (pin 2)
  ESP32 GND    →  DHT22 GND (pin 4)
  10KΩ resistor between DHT22 DATA and 3.3V

Note: If using a DHT22 breakout board module (3-pin), the pull-up
resistor is usually already included on the board. Check your module.

LED: The built-in LED on GPIO 2 is used for status indication.
No additional wiring needed.
```

## Arduino IDE Setup

### 1. Install ESP32 Board Support

1. Open Arduino IDE
2. Go to **File → Preferences**
3. In "Additional Boards Manager URLs", add:
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Go to **Tools → Board → Boards Manager**
5. Search for **"esp32"** and install **"ESP32 by Espressif Systems"**

### 2. Install Required Libraries

Go to **Tools → Manage Libraries** and install:

- **DHT sensor library** by Adafruit (also install the prompted "Adafruit Unified Sensor" dependency)
- **ArduinoJson** by Benoit Blanchon

The `WiFi.h` and `HTTPClient.h` libraries are built-in with ESP32 board support.

### 3. Configure Your Settings

Edit `config.h` with your values:

```c
const char* WIFI_SSID     = "MyHomeWiFi";
const char* WIFI_PASSWORD  = "mypassword123";
const char* SERVER_URL     = "http://192.168.1.100:8000/api/readings";
```

**Important:** Use your server machine's local IP address (not `localhost`). Find it with `ifconfig` (Mac/Linux) or `ipconfig` (Windows).

### 4. Upload to ESP32

1. Connect the ESP32 via USB
2. Go to **Tools → Board** and select **"ESP32 Dev Module"** (or your specific board, e.g., "NodeMCU-32S")
3. Go to **Tools → Port** and select the ESP32's serial port (e.g., `/dev/cu.usbserial-0001` on Mac, `COM3` on Windows)
4. Click the **Upload** button (→)
5. If upload fails, hold the **BOOT** button on the ESP32 while uploading

## Serial Monitor

Open **Tools → Serial Monitor** and set baud rate to **115200**.

### What Each Message Means

| Message | Meaning |
|---|---|
| `=== Greenhouse Monitor Starting ===` | ESP32 is booting up |
| `WiFi attempt 3/10...` | Trying to connect to WiFi (attempt 3 of 10) |
| `WiFi connected! IP address: 192.168.1.50` | Successfully connected to WiFi |
| `Reading: 72.5°F, 55.0% humidity` | Successfully read the DHT22 sensor |
| `Sending: {"temperature":72.5,"humidity":55.0}` | Posting data to the backend |
| `Success! HTTP 201` | Backend accepted the reading |
| `ERROR: Failed to read from DHT22 sensor!` | DHT22 returned NaN — check wiring |
| `Server error: HTTP 422` | Backend rejected the data (validation error) |
| `Connection failed: connection refused` | Backend is not reachable — check server URL and network |
| `WiFi disconnected — attempting reconnect...` | WiFi dropped, trying to reconnect |
| `WiFi connection failed after max retries. Restarting ESP32...` | All WiFi retries failed, rebooting |

### LED Indicators

| Pattern | Meaning |
|---|---|
| Solid on (1 second) | Successful data POST |
| Rapid blink (5×, fast) | Sensor read failure |
| Slow blink (3×, slow) | HTTP request failure |
| Off | Idle / sleeping between readings |

## Timing Configuration

The default reading interval is 5 minutes (300,000 ms). To change it, edit `READING_INTERVAL_MS` in `config.h`:

```c
#define READING_INTERVAL_MS 60000    // 1 minute
#define READING_INTERVAL_MS 300000   // 5 minutes (default)
#define READING_INTERVAL_MS 600000   // 10 minutes
```

## Deep Sleep (Battery Power)

For battery or solar-powered setups, uncomment the deep sleep section at the bottom of `loop()` in the `.ino` file and comment out the `delay()` line. Deep sleep reduces power consumption from ~80mA to ~10μA, but the ESP32 fully reboots each cycle (WiFi reconnects every time).

**Trade-off:** Use `delay()` for USB-powered setups (simpler, WiFi stays connected). Use deep sleep for battery setups (saves power, adds ~3–5s reconnection overhead per cycle).

## Testing

1. Upload the firmware and open Serial Monitor at 115200 baud
2. Verify WiFi connects and an IP address is printed
3. Wait for the first reading (5 seconds after boot, then every 5 minutes)
4. Check that readings appear in the mobile app's Dashboard and History screens
5. Verify LED indicators match the expected behavior
6. You can run the Python simulator alongside the real sensor — both data sources coexist in the backend without conflict

## Troubleshooting

| Problem | Solution |
|---|---|
| "Failed to read from DHT22 sensor" every time | Check wiring, ensure 10KΩ pull-up is between DATA and 3.3V, verify GPIO pin matches `config.h` |
| Upload fails | Hold the BOOT button on the ESP32 during upload. Try a different USB cable (some are charge-only). |
| WiFi won't connect | Double-check SSID and password in `config.h`. Ensure 2.4GHz network (ESP32 doesn't support 5GHz). |
| "Connection refused" on POST | Verify server URL and port. Ensure the backend is running and reachable from the ESP32's network. |
| Readings are way off | DHT22 needs 1–2 seconds between reads. The firmware handles this with the 5-minute interval. If reading immediately after boot, the first value may be inaccurate. |
