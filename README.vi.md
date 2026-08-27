# Hệ Thống Kiosk Đánh Giá Dịch Vụ HGS (rating-app-v1)

[English](README.md) | **Tiếng Việt**

---

Ứng dụng kiosk thu thập đánh giá và phản hồi của hành khách đa nền tảng (tablet/web) được xây dựng cho **Công ty Cổ phần Phục vụ Mặt đất Hà Nội (HGS)** tại các quầy làm thủ tục (check-in counters) và cửa khởi hành (boarding gates). Dự án được phát triển với **Expo SDK 57**, **React Native 0.86**, **React 19**, **NativeWind (Tailwind CSS v4)**, và **Bun runtime**.

---

## 📱 Tính Năng & Điểm Nổi Bật

### 1. Kiosk Đánh Giá Hành Khách (`/kiosk`)
- **Giao diện cảm ứng tối ưu**: Thiết kế độ tương phản cao, tối ưu hóa cho máy tính bảng theo nhận diện thương hiệu HGS và bộ phông chữ chuẩn doanh nghiệp (`SVN-PFDinTextPro`).
- **Thang điểm đánh giá 4 mức**: Thao tác 1 chạm nhanh chóng (Rất không hài lòng, Không hài lòng, Hài lòng, Rất hài lòng).
- **Nhóm lý do đánh giá linh hoạt**: Danh mục lý do được tải động từ máy chủ theo từng mức độ hài lòng được chọn.
- **Phản hồi chi tiết (Tùy chọn)**: Cho phép hành khách nhập ý kiến đóng góp cụ thể và thông tin liên hệ.
- **Tự động đặt lại phiên (Auto Reset)**: Tự động gửi/làm mới về màn hình đánh giá ban đầu sau khoảng thời gian không có tương tác.
- **Hỗ trợ đa ngôn ngữ**: Chuyển đổi linh hoạt giữa Tiếng Việt (`VI`) và Tiếng Anh (`EN`) với bộ nhớ ngôn ngữ cục bộ.
- **Thanh thông tin chuyến bay & quầy phục vụ**: Hiển thị số hiệu chuyến bay, chặng bay, số quầy và nhân viên phụ trách đang hoạt động.
- **Chế độ Kiosk chống can thiệp**: Bảo vệ quyền quản trị bằng mã PIN và tự động khóa màn hình quản trị sau thời gian chờ.

### 2. Quản Trị & Chuẩn Bị Cho Nhân Viên (`/admin`)
- **Đăng nhập nhân viên**: Xác thực an toàn với chu kỳ mã xác thực JWT (Access token + Tự động làm mới Refresh token).
- **Đăng ký & ghép nối thiết bị**: Tự động nhận diện và đăng ký phần cứng máy tính bảng (`devicesApi`) gắn liền với quầy phục vụ tương ứng.
- **Chọn & gán chuyến bay (`/admin/select-flight`)**: Tìm kiếm và phân công chuyến bay trực tiếp (hãng bay, số hiệu, điểm đi/đến, giờ khởi hành dự kiến) cho kiosk.
- **Bảng điều khiển & Thống kê trực tiếp (`/admin/dashboard`)**: Theo dõi điểm đánh giá theo thời gian thực, số lượng phản hồi và trạng thái hoạt động của thiết bị.
- **Cài đặt & Bảo mật mã PIN (`/admin/staff`)**: Quản lý phiên làm việc của nhân viên, đổi mã PIN mở khóa Admin và khóa chế độ Kiosk.

---

## 🛠️ Công Nghệ Sử Dụng

| Hạng mục | Công nghệ |
| :--- | :--- |
| **Framework** | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) (với điều hướng tệp Expo Router v4) |
| **Runtime & Trình quản lý gói** | [Bun](https://bun.sh/) |
| **Thư viện cốt lõi** | React 19, React Native 0.86, React Native Reanimated 4 |
| **Giao diện & Styling** | Tailwind CSS v4 + [NativeWind v5](https://www.nativewind.dev/) + Hệ thống thiết kế nhận diện HGS |
| **Bộ phông chữ (Typography)** | Bộ phông HGS: `SVN-PFDinTextPro` (Light, Regular, Medium, Bold, CondensedBold, Italic) |
| **Biểu tượng (Icons)** | Bộ biểu tượng Material Icons (`@expo/vector-icons/MaterialIcons`) |
| **Đa ngôn ngữ (i18n)** | `i18n-js`, `expo-localization` (Tiếng Việt, Tiếng Anh) |
| **Lưu trữ & Bảo mật** | `expo-secure-store`, Session Context với cơ chế tự động khóa mã PIN |
| **Kết nối mạng & Đồng bộ** | Axios với Interceptors, hàng đợi tự động làm mới mã Token và dữ liệu dự phòng (Mock Data) |

---

## 📂 Cấu Trúc Dự Án

```text
rating-app-v1/
├── assets/
│   ├── Fonts/               # Bộ phông chữ doanh nghiệp SVN-PFDinTextPro
│   └── images/              # Banner thương hiệu, hình nền và biểu tượng HGS
├── src/
│   ├── app/                 # Các trang định tuyến tệp Expo Router
│   │   ├── _layout.tsx      # Bố cục gốc, cấu hình font chữ và theme
│   │   ├── index.tsx        # Điểm khởi động / Bộ chuyển hướng ban đầu
│   │   ├── kiosk/
│   │   │   └── index.tsx    # Màn hình kiosk đánh giá cho hành khách
│   │   └── admin/
│   │       ├── _layout.tsx  # Ngăn xếp điều hướng khu vực quản trị
│   │       ├── index.tsx    # Màn hình đăng nhập nhân viên
│   │       ├── dashboard.tsx# Bảng thống kê chỉ số đánh giá & phân tích
│   │       ├── select-flight.tsx # Tìm kiếm & gán chuyến bay vào quầy
│   │       └── staff.tsx    # Thông tin nhân viên & cài đặt bảo mật
│   ├── components/          # Các thành phần giao diện tái sử dụng (AppButton, AppCard, HgsFooter, v.v.)
│   ├── features/
│   │   └── session/         # Quản lý phiên làm việc, chuyến bay & thiết bị (SessionContext)
│   ├── locales/             # Tệp từ điển đa ngôn ngữ (en.ts, vi.ts)
│   ├── services/
│   │   ├── api/             # Các mô-đun kết nối API (auth, devices, evaluations, flights, reasons)
│   │   ├── apiClient.ts     # Cấu hình Axios với cơ chế tự động làm mới Token
│   │   ├── mockData.ts      # Dữ liệu mẫu dự phòng khi chạy offline
│   │   └── storage.ts       # Mô-đun lưu trữ an toàn thiết bị
│   ├── theme/               # Bảng màu HGS, typography & khoảng cách chuẩn
│   └── tw/                  # Các thẻ bọc tương thích NativeWind Tailwind
├── app.json                 # Cấu hình ứng dụng và tiện ích mở rộng Expo
├── bun.lock                 # Tệp khóa phiên bản Bun
└── package.json             # Danh sách phụ thuộc và các lệnh chạy
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường
- [Bun](https://bun.sh/) (Trình chạy & quản lý gói khuyến nghị) hoặc [Node.js](https://nodejs.org/) LTS (Khuyến nghị v20+) kèm `npm`
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) (`npx expo`)
- Android Studio / Xcode (dành cho chạy máy ảo hoặc biên dịch native)

### 1. Cài Đặt Thư Viện

Sao chép mã nguồn và cài đặt các gói phụ thuộc bằng **Bun** (khuyến nghị) hoặc **npm**:

```bash
# Sử dụng Bun (Khuyến nghị)
bun install

# Hoặc sử dụng npm
npm install
```

### 2. Cấu Hình Biến Môi Trường

Sao chép tệp mẫu biến môi trường và cấu hình đường dẫn API máy chủ:

```bash
cp .env.example .env
```

Chỉnh sửa tệp `.env`:

```env
# Địa chỉ Base URL của máy chủ Backend API
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.vn/api/v1/
```

> **Lưu ý:** Trong Expo SDK 50+, các biến môi trường bắt đầu bằng tiền tố `EXPO_PUBLIC_` sẽ được tự động tích hợp vào ứng dụng client.

### 3. Khởi Chạy Ứng Dụng

Khởi động máy chủ phát triển Expo:

```bash
# Bằng Bun
bun start

# Bằng npm
npm start
```

Hoặc chạy trực tiếp trên nền tảng mục tiêu:

- **Thiết bị / Máy ảo Android**:
  ```bash
  # Bun
  bun run android

  # npm
  npm run android
  ```

- **Thiết bị / Máy ảo iOS**:
  ```bash
  # Bun
  bun run ios

  # npm
  npm run ios
  ```

- **Trình duyệt Web (Xem trước Kiosk)**:
  ```bash
  # Bun
  bun run web

  # npm
  npm run web
  ```

---

## 📦 Bản Build Phát Triển (Dev Build) & Xuất Tệp Cài Đặt APK

Do ứng dụng sử dụng phông chữ doanh nghiệp tùy chỉnh và các mô-đun native với [`expo-dev-client`](https://docs.expo.dev/develop/development-builds/introduction/), bạn có thể chạy bản build phát triển hoặc xuất tệp `.apk` trực tiếp qua Gradle (Android) hoặc qua dịch vụ EAS Build.

### 1. Khởi Chạy Native Development Build
Để biên dịch mã nguồn native và cài đặt client phát triển trực tiếp lên máy tính bảng hoặc máy ảo Android đang kết nối:

```bash
# Bằng Bun
bun run android

# Bằng npm
npm run android
# hoặc
npx expo run:android
```

Sau khi ứng dụng đã cài đặt trên thiết bị, bạn chỉ cần chạy `bun start` hoặc `npm start` để kết nối Metro bundler và cập nhật mã tức thì (hot reload).

---

### 2. Xuất Tệp Cài Đặt APK Trực Tiếp Trên Máy (Offline)

Bạn có thể tự biên dịch tệp `.apk` trên máy cục bộ bằng Gradle Wrapper mà không cần tài khoản đám mây:

#### A. Xuất bản Debug APK (Kiểm thử nhanh trên máy tính bảng)
```bash
# Windows (PowerShell)
cd android; ./gradlew assembleDebug; cd ..

# macOS / Linux (Bash)
cd android && ./gradlew assembleDebug && cd ..
```
📁 **Vị trí tệp APK đầu ra**:
`android/app/build/outputs/apk/debug/app-debug.apk`

#### B. Xuất bản Release APK (Cài đặt vận hành chính thức)
```bash
# Windows (PowerShell)
cd android; ./gradlew assembleRelease; cd ..

# macOS / Linux (Bash)
cd android && ./gradlew assembleRelease && cd ..
```
📁 **Vị trí tệp APK đầu ra**:
`android/app/build/outputs/apk/release/app-release.apk` (hoặc bản unsigned nếu chưa cấu hình keystore)

---

### 3. Cài Đặt Tệp APK Lên Máy Tính Bảng Qua ADB

Kết nối máy tính bảng Android qua cáp USB (đã bật chế độ **Gỡ lỗi USB / USB Debugging** trong Tùy chọn nhà phát triển) và chạy lệnh:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

### 4. Biên Dịch APK Qua Đám Mây EAS (Tùy Chọn)

Nếu muốn biên dịch qua dịch vụ [EAS Build](https://docs.expo.dev/build/introduction/):

1. Cài đặt EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Đăng nhập và khởi chạy quá trình build APK:
   ```bash
   eas build --platform android --profile preview
   ```
3. Sau khi hoàn thành, hệ thống sẽ cung cấp đường link và mã QR để tải trực tiếp tệp APK về tablet.

---

## 🔐 Quyền Quản Trị & Cấu Hình Quầy

Quy trình thiết lập máy tính bảng tại quầy phục vụ:
1. Tại màn hình Kiosk, nhấn vào biểu tượng **Cài đặt / Khóa** hoặc vùng kích hoạt quản trị viên để mở cửa sổ nhập mã PIN.
2. Mã PIN quản trị viên mặc định: `123456` (hoặc `1234`).
3. Chọn chuyến bay và quầy phục vụ đang vận hành.
4. Sau khi hoàn tất thiết lập, ứng dụng sẽ khóa vào chế độ Kiosk phục vụ hành khách đánh giá.
5. Cơ chế tự động khóa sẽ đưa giao diện quản trị về màn hình Kiosk sau 60 giây nếu không có thao tác.

---

## 🌐 Đa Ngôn Ngữ (i18n)

Ứng dụng hỗ trợ hai ngôn ngữ Tiếng Việt (`vi`) và Tiếng Anh (`en`).
- Bộ từ điển được định nghĩa tại [src/locales/vi.ts](file:///d:/projects/expo-test/rating-app-v1/src/locales/vi.ts) and [src/locales/en.ts](file:///d:/projects/expo-test/rating-app-v1/src/locales/en.ts).
- Hành khách có thể chuyển đổi ngôn ngữ bất kỳ lúc nào thông qua nút cờ ở góc trên bên phải màn hình Kiosk.

---

## 📜 Các Lệnh Thường Dùng

| Lệnh Bun | Lệnh npm | Mô tả |
| :--- | :--- | :--- |
| `bun start` | `npm start` (hoặc `npx expo start`) | Khởi động máy chủ phát triển Expo |
| `bun run android` | `npm run android` | Biên dịch và chạy ứng dụng trên Android |
| `bun run ios` | `npm run ios` | Biên dịch và chạy ứng dụng trên iOS |
| `bun run web` | `npm run web` | Mở ứng dụng trên trình duyệt web |
| `bun run lint` | `npm run lint` | Kiểm tra cú pháp mã nguồn với ESLint / Expo lint |

---

## 📄 Bản Quyền

Dự án này là tài sản độc quyền được duy trì phục vụ hoạt động của Công ty Cổ phần Phục vụ Mặt đất Hà Nội (HGS). Mọi quyền được bảo lưu.
