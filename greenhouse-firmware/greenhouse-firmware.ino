/*
 * Greenhouse Monitoring Firmware
 *
 * Reads temperature (°F) and humidity (%) from a DHT22 sensor and
 * sends the data to the greenhouse backend API via HTTP POST.
 *
 * Hardware: ESP32 + DHT22
 * Libraries: WiFi, HTTPClient, DHT, ArduinoJson
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include "config.h"

DHT dht(DHTPIN, DHTTYPE);

// ---------------------------------------------------------------------------
// LED helpers
// ---------------------------------------------------------------------------

void ledOn() {
  digitalWrite(LED_PIN, HIGH);
}

void ledOff() {
  digitalWrite(LED_PIN, LOW);
}

void blinkLed(int times, int onMs, int offMs) {
  for (int i = 0; i < times; i++) {
    ledOn();
    delay(onMs);
    ledOff();
    delay(offMs);
  }
}

// Solid on for 1 second — successful POST
void ledSuccess() {
  ledOn();
  delay(1000);
  ledOff();
}

// Rapid blink 5 times (100ms on/off) — sensor read failure
void ledSensorError() {
  blinkLed(5, 100, 100);
}

// Slow blink 3 times (500ms on/off) — HTTP request failure
void ledHttpError() {
  blinkLed(3, 500, 500);
}

// ---------------------------------------------------------------------------
// WiFi management
// ---------------------------------------------------------------------------

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < WIFI_MAX_RETRIES) {
    retries++;
    Serial.printf("  WiFi attempt %d/%d...\n", retries, WIFI_MAX_RETRIES);
    delay(WIFI_RETRY_DELAY_MS);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected! IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection failed after max retries. Restarting ESP32...");
    delay(1000);
    ESP.restart();
  }
}

// ---------------------------------------------------------------------------
// HTTP POST
// ---------------------------------------------------------------------------

void sendReading(float temperature, float humidity) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected — attempting reconnect...");
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Reconnect failed — skipping this reading.");
      ledHttpError();
      return;
    }
  }

  // Build JSON payload
  JsonDocument doc;
  doc["temperature"] = round(temperature * 10.0) / 10.0;
  doc["humidity"]    = round(humidity * 10.0) / 10.0;

  String payload;
  serializeJson(doc, payload);

  Serial.print("Sending: ");
  Serial.println(payload);

  // POST to backend
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(payload);

  if (httpCode == 201) {
    String response = http.getString();
    Serial.printf("Success! HTTP %d\n", httpCode);
    Serial.print("Response: ");
    Serial.println(response);
    ledSuccess();
  } else if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("Server error: HTTP %d\n", httpCode);
    Serial.print("Response: ");
    Serial.println(response);
    ledHttpError();
  } else {
    Serial.printf("Connection failed: %s\n", http.errorToString(httpCode).c_str());
    ledHttpError();
  }

  http.end();
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== Greenhouse Monitor Starting ===");

  // Initialize LED
  pinMode(LED_PIN, OUTPUT);
  ledOff();

  // Initialize DHT22 sensor
  dht.begin();
  Serial.println("DHT22 sensor initialized.");

  // Connect to WiFi
  connectWiFi();

  Serial.println("Setup complete. First reading in 5 seconds...");
  delay(5000);
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

void loop() {
  // Read sensor
  float humidity    = dht.readHumidity();
  float temperature = dht.readTemperature(true);  // true = Fahrenheit

  // Check for sensor read failure
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("ERROR: Failed to read from DHT22 sensor!");
    ledSensorError();
  } else {
    Serial.printf("Reading: %.1f°F, %.1f%% humidity\n", temperature, humidity);
    sendReading(temperature, humidity);
  }

  // Wait for next reading interval
  Serial.printf("Next reading in %d seconds...\n", READING_INTERVAL_MS / 1000);
  delay(READING_INTERVAL_MS);

  // --- Deep Sleep Alternative (for battery-powered setups) ---
  // Uncomment the lines below and comment out the delay() above to use
  // deep sleep instead. Deep sleep drastically reduces power consumption
  // (~10μA vs ~80mA), but the ESP32 fully reboots each cycle, meaning
  // WiFi must reconnect every time. Use delay() for always-on setups
  // with USB power; use deep sleep for battery or solar-powered setups.
  //
  // esp_sleep_enable_timer_wakeup(READING_INTERVAL_MS * 1000ULL);  // microseconds
  // Serial.println("Entering deep sleep...");
  // Serial.flush();
  // esp_deep_sleep_start();
}
