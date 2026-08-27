# HGS Passenger Rating Kiosk System (rating-app-v1)

**English** | [Tiếng Việt](README.vi.md)

---

A cross-platform tablet feedback kiosk and management application built for **Hanoi Ground Services (HGS)** at airport check-in counters and boarding gates. Powered by **Expo SDK 57**, **React Native 0.86**, **React 19**, **NativeWind (Tailwind CSS v4)**, and **Bun**.

---

## 📱 Features & Highlights

### 1. Passenger Feedback Kiosk (`/kiosk`)
- **Intuitive Touch UI**: High-contrast, tablet-optimized layout with corporate HGS branding and typography (`SVN-PFDinTextPro`).
- **4-Level Rating System**: Fast one-tap rating selection (Very Dissatisfied, Dissatisfied, Satisfied, Very Satisfied).
- **Dynamic Reason Tags**: Contextual feedback categories fetched dynamically based on selected rating sentiment.
- **Optional Detailed Feedback**: Passenger remarks/comments and contact information input.
- **Automatic Session Reset**: Auto-submits / auto-clears back to the primary rating screen after a configurable inactivity timeout.
- **Multilingual Support**: Instant toggle between Vietnamese (`VI`) and English (`EN`) with persistent localization.
- **Counter & Flight Context Banner**: Displays active flight number, route, counter ID, and operating staff.
- **Tamper-Proof Kiosk Mode**: Secure PIN-protected modal and inactivity auto-lock to prevent unauthorized tampering.

### 2. Staff & Admin Management (`/admin`)
- **Staff Authentication**: Secure login flow with JWT token lifecycle (access + automatic refresh token rotation).
- **Device Registration & Pairing**: Automatic hardware/tablet registration (`devicesApi`) linked to designated airport counters.
- **Flight Assignment (`/admin/select-flight`)**: Search and assign active flights (airline, flight number, origin/destination, scheduled departure time) to the kiosk.
- **Kiosk Status & Live Dashboard (`/admin/dashboard`)**: Monitor real-time feedback scores, submission metrics, and device heartbeat.
- **Settings & PIN Security (`/admin/staff`)**: Manage staff session, change admin unlock PIN, and lock/unlock kiosk mode.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) (with Expo Router v4 file-based routing) |
| **Runtime & PM** | [Bun](https://bun.sh/) |
| **Core Libraries** | React 19, React Native 0.86, React Native Reanimated 4 |
| **Styling** | Tailwind CSS v4 + [NativeWind v5](https://www.nativewind.dev/) + Custom HGS Design System |
| **Typography** | Custom font family: `SVN-PFDinTextPro` (Light, Regular, Medium, Bold, CondensedBold, Italic) |
| **Icons** | Material Icons (`@expo/vector-icons/MaterialIcons`) |
| **Localization** | `i18n-js`, `expo-localization` (Vietnamese, English) |
| **Storage & Security** | `expo-secure-store`, Session Context with PIN auto-lock |
| **Network & Sync** | Axios with interceptors, token auto-refresh queue, and fallback mock services |

---

## 📂 Project Structure

```text
rating-app-v1/
├── assets/
│   ├── Fonts/               # SVN-PFDinTextPro custom corporate fonts
│   └── images/              # HGS brand banners, backgrounds, icons
├── src/
│   ├── app/                 # Expo Router file-based pages
│   │   ├── _layout.tsx      # Root layout, fonts & theme provider
│   │   ├── index.tsx        # Entry point / routing switch
│   │   ├── kiosk/
│   │   │   └── index.tsx    # Passenger rating kiosk screen
│   │   └── admin/
│   │       ├── _layout.tsx  # Admin navigation stack
│   │       ├── index.tsx    # Staff login screen
│   │       ├── dashboard.tsx# Feedback metrics & analytics
│   │       ├── select-flight.tsx # Flight search & assignment
│   │       └── staff.tsx    # Staff profile & security settings
│   ├── components/          # Reusable UI components (AppButton, AppCard, HgsFooter, etc.)
│   ├── features/
│   │   └── session/         # Active flight & device SessionContext
│   ├── locales/             # i18n translation files (en.ts, vi.ts)
│   ├── services/
│   │   ├── api/             # API modules (auth, devices, evaluations, flights, reasons)
│   │   ├── apiClient.ts     # Axios instance with JWT refresh interceptors
│   │   ├── mockData.ts      # Offline/fallback mock data
│   │   └── storage.ts       # Secure storage abstraction
│   ├── theme/               # HGS color palette, typography & spacing
│   └── tw/                  # NativeWind Tailwind utility wrappers
├── app.json                 # Expo application configuration & plugins
├── bun.lock                 # Bun lockfile
└── package.json             # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (Recommended runtime & package manager) or [Node.js](https://nodejs.org/) LTS (v20+) with `npm`
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) (`npx expo`)
- Android Studio / Xcode (for running native simulators or development builds)

### 1. Installation

Clone the repository and install dependencies using **Bun** (recommended) or **npm**:

```bash
# Using Bun (Recommended)
bun install

# Or using npm
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API endpoint:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Backend API Base URL
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.vn/api/v1/
```

> **Note:** In Expo SDK 50+, variables prefixed with `EXPO_PUBLIC_` are automatically exposed to the client bundle.

### 3. Running the App

Start the Expo development server:

```bash
# Using Bun
bun start

# Using npm
npm start
```

Or run directly on your target platform:

- **Android Device / Emulator**:
  ```bash
  # Bun
  bun run android

  # npm
  npm run android
  ```

- **iOS Simulator / Device**:
  ```bash
  # Bun
  bun run ios

  # npm
  npm run ios
  ```

- **Web Browser (Kiosk Preview)**:
  ```bash
  # Bun
  bun run web

  # npm
  npm run web
  ```

---

## 📦 Development Build & Generating APK

Because this project uses native custom fonts and modules with [`expo-dev-client`](https://docs.expo.dev/develop/development-builds/introduction/), standalone development and production builds are compiled directly via Android/Gradle or EAS Build.

### 1. Running the Native Development Build
To compile the native app and install the custom development client directly onto your connected tablet or emulator:

```bash
# Using Bun
bun run android

# Using npm
npm run android
# or
npx expo run:android
```

Once installed on the device, simply run `bun start` or `npm start` to connect the bundler and stream code changes in real-time.

---

### 2. Building Standalone APK Locally (Offline)

You can build APK files directly using the local Gradle wrapper without requiring internet cloud services:

#### A. Build Debug APK (Fastest for testing)
```bash
# Windows (PowerShell)
cd android; ./gradlew assembleDebug; cd ..

# macOS / Linux (Bash)
cd android && ./gradlew assembleDebug && cd ..
```
📁 **APK Output Location**:
`android/app/build/outputs/apk/debug/app-debug.apk`

#### B. Build Release APK (Production Kiosk)
```bash
# Windows (PowerShell)
cd android; ./gradlew assembleRelease; cd ..

# macOS / Linux (Bash)
cd android && ./gradlew assembleRelease && cd ..
```
📁 **APK Output Location**:
`android/app/build/outputs/apk/release/app-release.apk` (or unsigned if keystore is pending)

---

### 3. Installing APK to Tablet via ADB

Connect your Android tablet via USB (with **USB Debugging** enabled in Developer Options) and install the APK:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

### 4. Cloud Build via EAS (Alternative)

If you prefer building in the cloud via [EAS Build](https://docs.expo.dev/build/introduction/):

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in and initiate APK preview build:
   ```bash
   eas build --platform android --profile preview
   ```
3. Once completed, EAS will provide a direct download link and QR code for the APK file.

## 🔐 Admin Access & Default Credentials

To configure a tablet for a flight counter:
1. On the Kiosk screen, tap the **Settings / Lock** icon or secret header trigger to open the Admin PIN prompt.
2. Default Developer/Admin PIN: `123456` (or `1234`).
3. Select the operating flight and counter.
4. Once configured, the tablet enters locked Kiosk mode for passenger feedback.
5. Inactivity timeout will automatically return any open Admin pages back to the Kiosk screen after 60 seconds.

---

## 🌐 Localization (i18n)

The app supports English (`en`) and Vietnamese (`vi`).
- Translation keys are located in [src/locales/vi.ts](file:///d:/projects/expo-test/rating-app-v1/src/locales/vi.ts) and [src/locales/en.ts](file:///d:/projects/expo-test/rating-app-v1/src/locales/en.ts).
- Switch languages anytime via the top-right flag toggle button on the Kiosk screen.

---

## 📜 Available Scripts

| Bun Command | npm Command | Description |
| :--- | :--- | :--- |
| `bun start` | `npm start` (or `npx expo start`) | Starts the Expo development server |
| `bun run android` | `npm run android` | Builds and runs the app on Android |
| `bun run ios` | `npm run ios` | Builds and runs the app on iOS |
| `bun run web` | `npm run web` | Launches the app in a web browser |
| `bun run lint` | `npm run lint` | Runs ESLint / Expo lint checks |

---

## 📄 License

This project is proprietary and maintained for Hanoi Ground Services (HGS). All rights reserved.
