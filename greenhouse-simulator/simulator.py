#!/usr/bin/env python3
"""Greenhouse sensor simulator — sends fake temperature/humidity readings to the backend API."""

import argparse
import math
import random
import time
from datetime import datetime, timedelta, timezone

import requests


def generate_reading(ts: datetime, args) -> dict:
    """Generate a realistic temperature/humidity reading for the given timestamp.

    Temperature follows a sinusoidal day/night curve peaking around 2-3 PM.
    Humidity is inversely correlated with temperature.
    """
    hour = ts.hour + ts.minute / 60.0

    # Sine curve: peak at ~14.5 (2:30 PM), trough at ~2:30 AM
    # sin(0) = 0 at 8:30 AM, sin(pi/2) = 1 at 14:30 PM
    phase = (hour - 8.5) / 24.0 * 2 * math.pi
    temp_offset = math.sin(phase) * args.temp_range

    noise = random.uniform(-2, 2)
    temperature = round(args.base_temp + temp_offset + noise, 1)

    # Humidity inversely related to temperature offset
    humidity_offset = -temp_offset * (args.humidity_range / args.temp_range)
    humidity_noise = random.uniform(-2, 2)
    humidity = round(args.humidity_base + humidity_offset + humidity_noise, 1)
    humidity = max(0.0, min(100.0, humidity))

    return {"temperature": temperature, "humidity": humidity}


def send_reading(server_url: str, payload: dict) -> requests.Response | None:
    """POST a reading to the backend. Returns the response or None on error."""
    url = f"{server_url}/api/readings"
    try:
        resp = requests.post(url, json=payload, timeout=10)
        return resp
    except requests.RequestException as e:
        print(f"  Connection error: {e}")
        return None


def mode_live(args):
    """Continuously send one reading per interval in real time."""
    print(f"Live mode — sending every {args.interval}s to {args.server_url}")
    print("Press Ctrl+C to stop.\n")

    while True:
        now = datetime.now(timezone.utc)
        payload = generate_reading(now, args)
        print(f"[{now.strftime('%H:%M:%S')}] Sending: temp={payload['temperature']}°F, "
              f"humidity={payload['humidity']}%", end=" ... ")

        resp = send_reading(args.server_url, payload)
        if resp is not None:
            print(f"HTTP {resp.status_code}")
        else:
            print("FAILED — will retry next interval")

        time.sleep(args.interval)


def mode_backfill(args):
    """Generate and send 7 days of historical readings as fast as possible."""
    interval_seconds = 300  # one reading every 5 minutes
    total_seconds = 7 * 24 * 3600
    total_readings = total_seconds // interval_seconds
    now = datetime.now(timezone.utc)

    print(f"Backfill mode — sending {total_readings} readings (7 days @ 5-min intervals)")
    print(f"Target server: {args.server_url}\n")

    sent = 0
    errors = 0
    for i in range(total_readings):
        ts = now - timedelta(seconds=total_seconds - i * interval_seconds)
        payload = generate_reading(ts, args)

        resp = send_reading(args.server_url, payload)
        if resp is not None and resp.status_code == 201:
            sent += 1
        else:
            errors += 1

        if (i + 1) % 100 == 0 or i + 1 == total_readings:
            print(f"  Sent {i + 1}/{total_readings} readings ({errors} errors)")

    print(f"\nDone. {sent} successful, {errors} failed.")


def mode_stress(args):
    """Send 20 deliberately problematic payloads to test backend validation."""
    print(f"Stress mode — sending 20 edge-case payloads to {args.server_url}\n")

    payloads = [
        # Normal readings
        {"temperature": 72.0, "humidity": 55.0},
        {"temperature": 80.5, "humidity": 45.0},
        {"temperature": 65.0, "humidity": 70.0},
        # Below freezing
        {"temperature": 10.0, "humidity": 50.0},
        {"temperature": -5.0, "humidity": 60.0},
        # Dangerously hot
        {"temperature": 130.0, "humidity": 20.0},
        {"temperature": 145.0, "humidity": 10.0},
        # Out-of-range temperature (should be rejected)
        {"temperature": -50.0, "humidity": 50.0},
        {"temperature": 160.0, "humidity": 50.0},
        # Negative humidity (should be rejected)
        {"temperature": 72.0, "humidity": -5.0},
        # Humidity over 100 (should be rejected)
        {"temperature": 72.0, "humidity": 110.0},
        # Missing fields
        {"temperature": 72.0},
        {"humidity": 55.0},
        {},
        # Non-numeric values
        {"temperature": "hot", "humidity": 55.0},
        {"temperature": 72.0, "humidity": "wet"},
        {"temperature": "boiling", "humidity": "soaked"},
        # Null values
        {"temperature": None, "humidity": 55.0},
        {"temperature": 72.0, "humidity": None},
        # Normal reading to finish
        {"temperature": 75.0, "humidity": 50.0},
    ]

    for i, payload in enumerate(payloads, 1):
        print(f"[{i:2d}/20] Payload: {payload}")
        resp = send_reading(args.server_url, payload)
        if resp is not None:
            print(f"        Response: HTTP {resp.status_code} — {resp.text}")
        else:
            print("        Response: CONNECTION FAILED")
        print()


def main():
    parser = argparse.ArgumentParser(
        description="Greenhouse sensor simulator — generates and sends fake readings to the backend API."
    )
    parser.add_argument(
        "mode",
        nargs="?",
        default="live",
        choices=["live", "backfill", "stress"],
        help="Operating mode (default: live)",
    )
    parser.add_argument("--base-temp", type=float, default=72, help="Baseline temperature in °F (default: 72)")
    parser.add_argument("--temp-range", type=float, default=15, help="Temperature swing ± degrees (default: 15)")
    parser.add_argument("--humidity-base", type=float, default=65, help="Baseline humidity %% (default: 65)")
    parser.add_argument("--humidity-range", type=float, default=15, help="Humidity variation range (default: 15)")
    parser.add_argument("--interval", type=int, default=300, help="Seconds between readings in live mode (default: 300)")
    parser.add_argument("--server-url", default="http://localhost:8000", help="Backend URL (default: http://localhost:8000)")

    args = parser.parse_args()

    modes = {
        "live": mode_live,
        "backfill": mode_backfill,
        "stress": mode_stress,
    }
    try:
        modes[args.mode](args)
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
