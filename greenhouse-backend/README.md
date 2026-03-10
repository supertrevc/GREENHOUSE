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

## Database

SQLite is used by default (`greenhouse.db` created in the project root). To switch to PostgreSQL, edit the `DATABASE_URL` in `app/database.py`:

```python
DATABASE_URL = "postgresql://user:password@localhost/greenhouse"
```

and remove the `connect_args` parameter from `create_engine`.
