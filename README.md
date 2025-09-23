Great — here’s your **README extended with Prometheus & Grafana setup**, so someone cloning your repo can bootstrap observability without guessing configs.

---

# Unified Notification Microservice API

This project is a **robust and scalable backend API** designed to handle and process notifications asynchronously.
It demonstrates the architecture of a distributed system, where different services collaborate to perform a single task.

The API can be integrated into various applications to manage and send notifications such as emails, SMS, or other message types.

---

## 🚀 **Technologies & Tools**

* **Backend:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **ORM:** TypeORM
* **Message Broker:** RabbitMQ
* **In-Memory Store:** Redis
* **Containerization:** Docker, Docker Compose
* **Load Balancer:** Nginx
* **Testing:** Jest
* **API Documentation:** Swagger
* **Logging:** Pino Logger, Loki
* **Metrics:** Prometheus
* **Observability:** Grafana Dashboard

---

## 🔑 **Key Features**

* **Secure Authentication:** API Key–based access control.
* **Asynchronous Processing:** Notifications are queued via RabbitMQ for non-blocking performance.
* **Data Integrity:** Database transactions ensure consistency during critical operations.
* **Scalability:** Easily scale API instances with Docker and Nginx load balancing.
* **High Performance:** Redis caching reduces database load.
* **Comprehensive Testing:** Unit and integration tests with Jest.
* **Observability:** Health checks, structured logging, metrics, and Grafana dashboards.

---

## 🔐 **Security Features**

* **Helmet** – Adds HTTP headers to protect against common web vulnerabilities.
* **CSRF Protection** – Mitigates Cross-Site Request Forgery (`csrf-csrf`).
* **API Key Authentication** – Enforces secure access to endpoints.
* **Rate Limiting & Throttling** – `@nestjs/throttler` prevents brute-force and abuse attacks.
* **Input Validation & Sanitization** – Ensured by `class-validator` & `class-transformer`.
* **Password Hashing** – Uses `bcrypt` for secure storage of credentials.
* **Secure Logging** – Structured logs with Pino, shipped to Loki.
* **Transport Security** – Recommended to run behind Nginx with HTTPS enabled.

---

## ⚙️ **Getting Started**

Follow these steps to set up and run the project locally.

### **Prerequisites**

* Docker & Docker Compose
* Node.js + npm

---

### **Setup**

1. **Clone the repository:**

   ```bash
   git clone [repository_url]
   cd [repository_folder]
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Copy environment files:**

   ```bash
   cp .env.example ./env/.env.development
   cp .env.example ./env/.env.production
   ```

   Update values for database, RabbitMQ, Redis, etc.

4. **Install Loki Docker plugin (for logging):**

   ```bash
   docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
   ```

5. **Start the services:**

   ```bash
   docker-compose up --build
   ```

   To scale API instances:

   ```bash
   docker-compose up --build --scale api=3
   ```

---

## 📖 **API Documentation**

Swagger docs are auto-generated.
Once running, access at:

```
http://localhost:[port]/api
```

---

## 🧪 **Running Tests**

Run unit and integration tests with:

```bash
npm run test
```

---

## 📊 **Observability**

This project ships with **Prometheus + Grafana + Loki** for a full observability stack.

### Prometheus Scrape Config

Prometheus collects metrics from the API.
Example `prometheus.yml` config:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'unified-notifications-api'
    metrics_path: /metrics
    static_configs:
      - targets: ['unified-notifications-api:3000']
```

> Ensure the API exposes `/metrics` (via `@willsoto/nestjs-prometheus`).

---

### Grafana Setup

1. Open Grafana at `http://localhost:3000`
   (default user: `admin` / password: `admin`).

2. Add Prometheus as a datasource:

   * URL: `http://prometheus:9090`

3. Add Loki as a datasource:

   * URL: `http://loki:3100`

---

### Recommended Dashboards

You can import these community dashboards directly in Grafana:

* **NestJS / Node.js API Metrics:**
  [Grafana Dashboard 14365](https://grafana.com/grafana/dashboards/14365-nestjs-api-metrics/)

* **Redis Overview:**
  [Grafana Dashboard 763](https://grafana.com/grafana/dashboards/763-redis-dashboard-for-prometheus-redis-exporter-1-x/)

* **RabbitMQ Overview:**
  [Grafana Dashboard 10991](https://grafana.com/grafana/dashboards/10991-rabbitmq-overview/)

* **PostgreSQL:**
  [Grafana Dashboard 9628](https://grafana.com/grafana/dashboards/9628-postgresql-database/)

* **Loki Logs:**
  Use Grafana’s Explore tab with Loki datasource to query structured logs.

---

## 🛡 **Security Note**

For production deployments:

* Run behind **HTTPS** (Nginx or similar).
* Store and rotate **API keys** securely.
* Use secret management for `.env` values.
* Tune Redis memory (`vm.overcommit_memory=1`).
* Enable container resource limits for stability.

---

## 👤 **Author**

**Matheus Julidori** – Senior Backend Software Engineer

* [LinkedIn](https://www.linkedin.com/in/matheusjulidori)
* [GitHub](https://github.com/MatheusJulidori)
* [Portfolio](https://julidori.dev/)

---

Would you like me to **inline the Prometheus & Grafana configs into your `docker-compose.yml`**, so people don’t even need to copy YAML or dashboards manually, or do you prefer keeping those external to the repo?
