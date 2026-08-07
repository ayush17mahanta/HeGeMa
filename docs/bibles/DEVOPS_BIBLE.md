# DevOps Bible — HEGEMA
**Docker Orchestration, Edge Node Architecture & Infrastructure**

---

## 1. Container Blueprint (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  mqtt_broker:
    image: eclipse-mosquitto:2.0
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./infra/mosquitto/mosquitto.conf:/mosquitto/config/mosquitto.conf

  postgres:
    image: postgis/postgis:16-3.4-alpine
    environment:
      POSTGRES_DB: hegema
      POSTGRES_USER: hegema_admin
      POSTGRES_PASSWORD: hegema_secure_password
    ports:
      - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - mqtt_broker

  frontend:
    build:
      context: .
      dockerfile: infra/docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 2. Environment Configuration Blueprint (`.env.example`)
```env
HEGEMA_ENV=development
SECRET_KEY=super-secret-tactical-jwt-key
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=hegema
POSTGRES_USER=hegema_admin
POSTGRES_PASSWORD=hegema_secure_password
MQTT_HOST=mqtt_broker
MQTT_PORT=1883
```
