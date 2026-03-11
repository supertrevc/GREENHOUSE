// ============================================================
// Greenhouse Firmware Configuration
// Edit these values before uploading to your ESP32.
// ============================================================

// WiFi
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD  = "YOUR_WIFI_PASSWORD";

// Backend API
const char* SERVER_URL = "http://YOUR_SERVER_IP:8000/api/readings";

// Hardware pins
#define DHTPIN   4        // GPIO pin connected to DHT22 data pin
#define DHTTYPE  DHT22
#define LED_PIN  2        // Built-in LED (GPIO 2 on most ESP32 boards)

// Timing
#define READING_INTERVAL_MS   300000   // 5 minutes between readings
#define WIFI_RETRY_DELAY_MS   5000     // 5 seconds between WiFi reconnect attempts
#define WIFI_MAX_RETRIES      10       // Max retries before restarting ESP32
