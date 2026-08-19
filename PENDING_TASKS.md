# 🚀 Docpa: Pending Tasks & Production Deployment Checklist

This document tracks all remaining **operational tasks**, **third-party service integrations**, and **infrastructure configurations** required before deploying the Docpa backend to a live production environment.

---

## 📋 Task Categories & Progress

```
  ┌─────────────────────────────────────────────────────────────┐
  │  [ ] 1. Third-Party Service Credentials & Live Integrations │
  │  [ ] 2. Production Database (MongoDB Atlas) & Indexes       │
  │  [ ] 3. Cloud Storage & File Uploads (S3 / Cloudinary)      │
  │  [ ] 4. Domain, SSL/TLS & Reverse Proxy (Nginx / Cloudflare)│
  │  [ ] 5. Production Environment Variables (.env)             │
  │  [ ] 6. Process Management & Containerization (PM2 / Docker)│
  │  [ ] 7. Error Tracking, Telemetry & SIEM Monitoring (Sentry)│
  │  [ ] 8. Final Pre-Flight Launch Checklist                   │
  └─────────────────────────────────────────────────────────────┘
```

---

## 1. 🔑 Third-Party Service Credentials & Live Integrations

- [ ] **SMS Gateway Provider Setup**:
  - Choose and sign up for an Indian/Global SMS provider: **Fast2SMS**, **Twilio**, or **MSG91**.
  - Obtain DLT registration (for Indian SMS regulations) and create an approved sender ID (e.g., `DOCPA`).
  - Configure the provider API endpoint and header authorization in [services/notification/smsNotificationService.js](file:///c:/olpna/docpa/Docpa/services/notification/smsNotificationService.js).
  - Set `SMS_API_KEY` and `SMS_SENDER_ID` in production `.env`.

- [ ] **Transactional Email SMTP Configuration**:
  - Setup an enterprise email provider: **SendGrid**, **AWS SES**, **Resend**, or **Google Workspace SMTP**.
  - Verify domain DNS records (SPF, DKIM, DMARC) for high inbox deliverability.
  - Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` in production `.env`.

- [ ] **Google Cloud OAuth 2.0 Credentials**:
  - Open [Google Cloud Console](https://console.cloud.google.com/).
  - Create an OAuth 2.0 Client ID for Web, Android, and iOS applications.
  - Add your production domain in **Authorized Javascript Origins** and **Authorized Redirect URIs**.
  - Set `GOOGLE_CLIENT_ID` in production `.env`.

---

## 2. 🗄️ Production Database (MongoDB Atlas)

- [ ] **Provision MongoDB Atlas Cluster**:
  - Create a dedicated M10+ replica set cluster on AWS/GCP (Mumbai/ap-south-1 region recommended for low latency in India).
  - Configure strict Network Access: Whitelist only your production server IPs (or VPC peering).
  - Create a dedicated database user with read/write access (do not use admin credentials).
  - Set `MONGO_URI` in production `.env`.

- [ ] **Database Index Verification & Backups**:
  - Ensure all compound indexes are created on start (already defined on `Patient`, `Appointment`, `Prescription`, and `AuditLog`).
  - Enable Automated Daily Snapshots and Continuous Cloud Backups with point-in-time recovery.

---

## 3. ☁️ Cloud Storage for Clinic Logos & Doctor Signatures

- [ ] **Setup S3 / Cloudinary / Google Cloud Storage**:
  - Create a secure storage bucket (e.g. AWS S3 or Cloudinary) for clinic letterhead logos and doctor digital signatures.
  - Set private read/write permissions with Signed URL generation for authorized clinic users.
  - Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` (or Cloudinary credentials) in `.env`.

---

## 4. 🌐 Domain, SSL/TLS & Reverse Proxy (Nginx / Cloudflare)

- [ ] **Domain & DNS Setup**:
  - Point your API subdomain (e.g., `api.docpa.in` or `api.yourdomain.com`) to your server IP via Cloudflare / Route 53.
  - Enable Cloudflare Full (Strict) SSL proxy mode.

- [ ] **Nginx Reverse Proxy Configuration**:
  - Configure Nginx to proxy port `5000` to port `443` (HTTPS).
  - Enable WebSocket support (`proxy_set_header Upgrade $http_upgrade`).
  - Set client max body size to `10M` in `nginx.conf`.
  - Install free SSL certificate using Let's Encrypt / Certbot:
    ```bash
    sudo certbot --nginx -d api.yourdomain.com
    ```

- [ ] **CORS Configuration**:
  - Set `CORS_ORIGIN` in `.env` to your exact production web and mobile domain URLs (e.g., `https://app.docpa.in,https://portal.docpa.in`).

---

## 5. 🔒 Production Environment Variables (.env)

Ensure the following variables are securely populated on the production host (never commit to Git):

```env
# Server
NODE_ENV=production
PORT=5000
CLIENT_URL=https://app.docpa.in
CORS_ORIGIN=https://app.docpa.in,https://admin.docpa.in,https://patient.docpa.in

# Database
MONGO_URI=mongodb+srv://docpa_prod_user:<PASSWORD>@cluster0.mongodb.net/docpa_production?retryWrites=true&w=majority

# Cryptography & JWT Security (Generate using: openssl rand -base64 64)
JWT_ACCESS_SECRET=your_super_secret_high_entropy_access_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_high_entropy_refresh_key_here
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=12

# SMS Gateway (Fast2SMS / MSG91 / Twilio)
SMS_API_KEY=your_live_sms_api_key
SMS_SENDER_ID=DOCPA

# Email SMTP (SendGrid / AWS SES / Gmail)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM="Docpa Healthcare" <no-reply@docpa.in>

# Google OAuth
GOOGLE_CLIENT_ID=your_production_google_client_id.apps.googleusercontent.com
```

---

## 6. ⚙️ Process Management & Containerization (PM2 / Docker)

- [ ] **Process Management with PM2**:
  - Install PM2 on the server: `npm install -g pm2`
  - Start app in cluster mode to utilize all CPU cores:
    ```bash
    pm2 start server.js -i max --name docpa-backend
    pm2 save
    pm2 startup
    ```

- [ ] **Or Docker Deployment**:
  - Create a production multi-stage Dockerfile and run with `docker-compose.prod.yml`.

---

## 7. 📈 Monitoring, Error Tracking & Sentry SIEM

- [ ] **Sentry Error Monitoring**:
  - Install `@sentry/node` and configure DSN in `server.js` to receive real-time alerts when unhandled exceptions or crashes occur.
- [ ] **Uptime & Health Checks**:
  - Add a dedicated health endpoint (`/health` returning `{ status: "ok", uptime: process.uptime() }`).
  - Configure external uptime monitoring via **BetterStack**, **UptimeRobot**, or **Pingdom**.

---

## 8. 🏁 Final Pre-Flight Launch Checklist

Run through these checks right before opening the system to live clinics and doctors:

- [ ] Run security test suite: `node scratch/securityTest.js` (Must show **21/21 PASS**).
- [ ] Test live OTP delivery to a real Indian mobile number and email.
- [ ] Test creating a clinic, adding a staff member, generating an OPD token, and issuing a test prescription.
- [ ] Test invoice creation and click the generated WhatsApp link to verify mobile receipt formatting.
- [ ] Verify that `AuditLog` records are populating correctly in MongoDB Atlas.
