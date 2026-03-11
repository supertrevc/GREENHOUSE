# Greenhouse Sensor Simulator

A Python script that simulates a greenhouse temperature/humidity sensor by sending realistic fake readings to the backend API. Stands in for real ESP32 hardware during development and testing.

## Setup

```bash
cd greenhouse-simulator
pip install -r requirements.txt
```

Make sure the backend server (`greenhouse-backend`) is running on `http://localhost:8000` (or specify a different URL with `--server-url`).

## Usage

```bash
python simulator.py [mode] [options]
```

## Modes

### `live` (default)

Runs continuously, sending one reading per interval. Temperature follows a realistic day/night sinusoidal curve with random noise. Humidity is inversely correlated with temperature.

```bash
python simulator.py live
python simulator.py live --interval 10 --base-temp 75
```

Sample output:

```
Live mode — sending every 10s to http://localhost:8000
Press Ctrl+C to stop.

[14:32:05] Sending: temp=83.2°F, humidity=52.1% ... HTTP 201
[14:32:15] Sending: temp=84.0°F, humidity=50.8% ... HTTP 201
[14:32:25] Sending: temp=82.7°F, humidity=53.4% ... HTTP 201
```

### `backfill`

Generates and sends 7 days of historical readings (one every 5 minutes = 2,016 readings) as fast as possible. Useful for populating the database with chart-ready data.

```bash
python simulator.py backfill
python simulator.py backfill --server-url http://192.168.1.50:8000
```

Sample output:

```
Backfill mode — sending 2016 readings (7 days @ 5-min intervals)
Target server: http://localhost:8000

  Sent 100/2016 readings (0 errors)
  Sent 200/2016 readings (0 errors)
  ...
  Sent 2016/2016 readings (0 errors)

Done. 2016 successful, 0 failed.
```

**Note:** Backfill mode sends readings with simulated timestamps for the curve shape, but the backend auto-timestamps each reading on receipt. For true historical timestamps, modify the backend to accept an optional `timestamp` field in the POST body.

### `stress`

Sends 20 deliberately problematic payloads to test backend validation. Includes out-of-range values, missing fields, non-numeric types, and null values, mixed with a few valid readings.

```bash
python simulator.py stress
```

Sample output:

```
Stress mode — sending 20 edge-case payloads to http://localhost:8000

[ 1/20] Payload: {'temperature': 72.0, 'humidity': 55.0}
        Response: HTTP 201 — {"id":1,"timestamp":"...","temperature":72.0,"humidity":55.0}

[ 8/20] Payload: {'temperature': -50.0, 'humidity': 50.0}
        Response: HTTP 422 — {"detail":[{"type":"greater_than_equal",...}]}

[12/20] Payload: {'temperature': 72.0}
        Response: HTTP 422 — {"detail":[{"type":"missing",...}]}
```

## CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--base-temp` | 72 | Baseline temperature in °F |
| `--temp-range` | 15 | Degrees above/below baseline the curve swings |
| `--humidity-base` | 65 | Baseline humidity % |
| `--humidity-range` | 15 | Humidity variation range |
| `--interval` | 300 | Seconds between readings in live mode |
| `--server-url` | `http://localhost:8000` | Backend API URL |

## Examples

```bash
# Quick test with 5-second intervals
python simulator.py live --interval 5

# Simulate a cooler greenhouse
python simulator.py live --base-temp 60 --temp-range 10

# Populate DB with a week of data
python simulator.py backfill

# Test backend validation
python simulator.py stress
```
