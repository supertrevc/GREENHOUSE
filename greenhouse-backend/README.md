# Greenhouse Monitoring Backend API

FastAPI backend that receives, stores, and serves temperature and humidity sensor readings for a greenhouse monitoring system.

## Setup

```bash
cd greenhouse-backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Run the server

```bash
uvicorn app.main:app --reload
```

The server starts at `http://127.0.0.1:8000`. Interactive API docs are available at `http://127.0.0.1:8000/docs`.

## API Endpoints

### POST /api/readings — Create a reading

```bash
curl -X POST http://127.0.0.1:8000/api/readings \
  -H "Content-Type: application/json" \
  -d '{"temperature": 72.5, "humidity": 55.0}'
```

### GET /api/readings — List readings (newest first)

```bash
# All readings (max 1000)
curl http://127.0.0.1:8000/api/readings

# Only readings from the last 2 hours
curl "http://127.0.0.1:8000/api/readings?hours=2"
```

### GET /api/readings/latest — Most recent reading

```bash
curl http://127.0.0.1:8000/api/readings/latest
```

### GET /api/status — Health check

```bash
curl http://127.0.0.1:8000/api/status
```

### GET /api/settings — Get threshold settings

```bash
curl http://127.0.0.1:8000/api/settings
```

Returns current alert thresholds. Creates a row with defaults on first call.

### PUT /api/settings — Update threshold settings

```bash
curl -X PUT http://127.0.0.1:8000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"max_temperature": 100, "min_humidity": 30, "max_humidity": 90}'
```

Partial update — only include the fields you want to change. Validates that min < max when both are set.

### GET /api/alerts — Alert history

```bash
# All alerts (max 100, newest first)
curl http://127.0.0.1:8000/api/alerts

# Only alerts from the last 6 hours
curl "http://127.0.0.1:8000/api/alerts?hours=6"
```

## Alert System

When a new reading is posted, the backend checks it against all configured thresholds. If a threshold is breached and the cooldown period has elapsed since the last alert of that type, an alert record is created and a push notification is sent via Firebase Cloud Messaging.

**Alert types:** `low_temperature`, `high_temperature`, `low_humidity`, `high_humidity`

**Firebase setup (optional):** Set the `FIREBASE_CREDENTIALS_PATH` environment variable to a Firebase service account JSON file. If not configured, alerts are still logged in the database but push notifications are skipped.

```bash
export FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json
```

## Database

SQLite is used by default (`greenhouse.db` created in the project root). To switch to PostgreSQL, edit the `DATABASE_URL` in `app/database.py`:

```python
DATABASE_URL = "postgresql://user:password@localhost/greenhouse"
```

and remove the `connect_args` parameter from `create_engine`.
