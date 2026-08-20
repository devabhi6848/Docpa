# 📱 DeployCraft Mobile App (iOS & Android)

**DeployCraft Mobile** is the React Native (Expo) companion mobile application for DeployCraft. It gives DevOps teams and developers full remote control over their VPS nodes, live container logs, auto-deployments, and custom domain SSL management directly from their phones.

---

## ✨ Mobile Features

- **Applications Screen**: View running containers, Git repo status, ports, trigger 1-tap deployments, restart, stop, and rollback.
- **Interactive ANSI Terminal**: Real-time streaming container logs with search filtering, pause/resume, and auto-scroll.
- **VPS Nodes & Live Telemetry**: Live CPU sparkline curves (3s WebSocket tick), memory pressure meters, and disk storage breakdown.
- **Deployments Audit Trail**: Chronological deployment feed with status badges and instant 1-tap rollback to previous Docker image tags.
- **Custom Domains & Auto-SSL**: Manage custom domains and trigger DNS verification tests.
- **Security & Multi-Server**: API endpoint switcher, biometrics (FaceID/Fingerprint) toggle, and dark-mode glassmorphic interface.

---

## 🚀 Getting Started

### 1. Navigate to the mobile app folder:
```bash
cd client/mobile-app
```

### 2. Install dependencies:
```bash
pnpm install # or npm install
```

### 3. Launch the Expo Development Server:
```bash
npx expo start
```

---

## 📱 Running on Devices

- **iOS Simulator**: Press `i` in the terminal after starting Expo.
- **Android Emulator**: Press `a` in the terminal after starting Expo.
- **Physical Device (iPhone or Android)**:
  1. Install the **Expo Go** app from the App Store or Google Play.
  2. Scan the QR code displayed in your terminal.
