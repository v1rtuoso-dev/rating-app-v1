
## Frontend React Native cho hệ thống đánh giá nhân viên

Mục tiêu của frontend là dùng **1 codebase nhưng tách hoàn toàn 2 mode**:
- `Kiosk mode`: chỉ dành cho hành khách tại quầy.
- `Admin mode`: dành cho nhân viên và quản lý, không hiển thị trên tablet kiosk.

Điểm quan trọng nhất là tablet đặt tại quầy **không được hiện màn hình đăng nhập của nhân viên/quản lý**. Kiosk chỉ chạy luồng đánh giá, còn admin mode chỉ mở ở ứng dụng riêng, màn hình riêng, hoặc một entrypoint được bảo vệ bằng cơ chế riêng.
Đăng nhập tài khoản Admin -> Tablet mở toàn bộ menu quản trị/cấu hình.

Đăng nhập tài khoản User -> Tablet chỉ mở giao diện giới hạn tính năng.
Mặc định Tablet chạy ở User Mode.

Khi muốn vào Admin Mode, bấm nút góc màn hình -> Hiện Popup yêu cầu nhập PIN / Mật khẩu Admin để kích hoạt phiên Admin. Sau một khoảng thời gian không thao tác (Inactivity Timeout), app tự trả về User Mode.

**Phạm vi thiết kế**
- Thiết bị chính: tablet/kiosk tại quầy check-in.
- Tách biệt hoàn toàn giữa luồng hành khách và luồng nội bộ.
- Phong cách: sạch, chuyên nghiệp, ít chữ, dễ đọc từ xa.
- Ưu tiên: thao tác một chạm, tốc độ nhanh, tự reset, ít bước.

**Nguyên tắc kiến trúc**
1. Một codebase, hai mode độc lập.
   - Kiosk mode không import các màn hình admin vào navigation chính.
   - Admin mode không chạy chung entrypoint với kiosk mode trên thiết bị khách.
   - Hai mode dùng chung component nền tảng, theme, data model và API client.
2. Tách entrypoint theo mode.
   - `kiosk` boot từ app launcher riêng hoặc cấu hình riêng.
   - `admin` boot từ app launcher khác, hoặc từ route được bảo vệ.
   - Cùng một repository nhưng build ra hai luồng khởi động khác nhau.
3. Không để user thấy chức năng nội bộ trong kiosk.
   - Không có nút login.
   - Không có menu quản trị.
   - Không có tab chuyển sang staff/manager.

**Luồng 1: Kiosk mode**
1. Sau khi nhân viên đã sign in tự chuyển sang màn hình đánh giá
2. Màn hình đánh giá.
   - 4 mức đánh giá bằng icon lớn.
   - Chạm một lần là chọn.
   - Tối ưu cho cảm ứng và khoảng cách nhìn xa.
3. Màn hình lý do nếu chọn “không hài lòng”.
   - Hiển thị nhiều lý do dạng chip/card.
   - Cho phép chọn nhiều đáp án.
4. Màn hình góp ý tùy chọn.
   - Text area đơn giản, có thể bỏ qua.
5. Màn hình cảm ơn.
   - Sau khi gửi thành công, hiển thị trạng thái hoàn tất.
   - Tự reset sau 20 giây hoặc khi không có thao tác.

**Luồng 2: Admin mode**
1. Đăng nhập.
   - Dành cho nhân viên và quản lý.
   - Không hiện trên kiosk.
2. Nhân viên chọn thông tin phục vụ.
   - Chọn chuyến bay đang phục vụ.
   - Chọn quầy check-in.
   - Bắt đầu phiên phục vụ.
3. Khu quản lý.
   - Danh sách đánh giá.
   - Dashboard thống kê.
   - Quản lý tài khoản nhân viên.
   - Quản lý thiết bị.
   - Lọc theo thời gian, chuyến bay, nhân viên, điểm đánh giá.

**Màn hình cần có**
- Kiosk mode:
  - Rating
  - Unsatisfied reasons
  - Comment optional
  - Thank you
- Admin mode:
  - Login
  - Select flight
  - Select counter
  - Active session
  - Evaluation list
  - Dashboard
  - Staff accounts
  - Devices
  - Reports

**Navigation đề xuất**
- Root bootstrap chỉ chọn một trong hai mode:
  - `KioskApp`
  - `AdminApp`
- Kiosk mode nên chạy theo state machine hơn là navigation phức tạp.
- Admin mode dùng `Stack Navigator`, có thể thêm `Tab Navigator` cho khu quản lý.
- Không dùng chung menu chính cho hai mode.

**Kiến trúc codebase**
- `src/bootstrap`
  - xác định mode khởi động, load config, chọn entrypoint.
- `src/kiosk`
  - toàn bộ màn hình và logic kiosk.
- `src/admin`
  - login, staff flow, manager flow.
- `src/components`
  - component dùng chung giữa hai mode.
- `src/features`
  - `auth`, `evaluation`, `device`, `dashboard`, `staff-management`.
- `src/services`
  - API client, storage, session, device identity.
- `src/theme`
  - màu, typography, spacing, shadows.
- `src/types`
  - model cho user, flight, evaluation, reason, device.

**Component dùng chung**
- Button.
- Card.
- Modal confirm.
- Empty state.
- Loading state.
- Filter bar.
- Rating icon button.
- Reason chip.

**Định hướng giao diện**
- Kiosk mode:
  - nền sáng, sạch, ít chữ.
  - nút lớn, tương phản cao, dễ chạm.
  - trạng thái đơn giản, tự động chuyển màn hình.
- Admin mode:
  - form rõ ràng, bảng dữ liệu dễ lọc.
  - ưu tiên năng suất thao tác hơn hiệu ứng.

**State và dữ liệu**
- Kiosk mode:
  - state ngắn hạn.
  - reset nhanh.
  - ít phụ thuộc vào cache dài hạn.
- Admin mode:
  - cần xác thực.
  - lưu token.
  - kiểm tra role-based access.
- Dữ liệu danh mục như chuyến bay, lý do, mức đánh giá, thiết bị nên lấy từ backend để mở rộng sau này.

**Tiêu chí kiểm thử**
1. Kiosk mode chỉ hiển thị luồng đánh giá, không lộ login nội bộ.
2. Kiosk reset đúng sau 20 giây không thao tác.
3. Admin mode đăng nhập và chọn chuyến bay/quầy thành công.
4. Đánh giá được gắn đúng chuyến bay, quầy và nhân viên trong admin flow.
5. Layout tablet không vỡ ở kích thước màn hình thực tế.
6. Chọn nhiều lý do khi không hài lòng hoạt động ổn định.
7. Dashboard và danh sách đánh giá lọc đúng theo yêu cầu.

**Kết luận thiết kế**
- Một codebase duy nhất.
- Hai mode tách biệt hoàn toàn ở cấp entrypoint, navigation và trải nghiệm người dùng.
- Tablet kiosk chỉ dành cho hành khách.
- Nhân viên và quản lý thao tác ở admin mode riêng, không xuất hiện trên tablet công khai.

