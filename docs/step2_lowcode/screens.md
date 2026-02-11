# 📱 Screen List
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh — Step 2

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-11  
> **Ref:** Step 2 Low-code (UI + Flow + Rule)

---

## A. Admin Dashboard (Web — React)

| ID | Screen | Purpose | UI Blocks | States |
|----|--------|---------|-----------|--------|
| S01 | Admin Login | Đăng nhập quản trị | Form (email, password), Forgot link | loading / error (invalid creds) / error (locked) / success (redirect) |
| S02 | Forgot Password | Reset mật khẩu | Form (email) → Form (new password) | loading / success (check email) / error (expired token) / success (reset done) |
| S03 | Dashboard Overview | Tổng quan hệ thống | Stat cards (4), Recent Activity, Quick Actions | loading (skeleton) / empty (no data) / error (API fail) / success |
| S04 | POI List | Quản lý danh sách POIs | Table, Search, Filters (status, category), Pagination | loading / empty (no POIs) / error / success |
| S05 | POI Create/Edit | Tạo mới / chỉnh sửa POI | Form tabs (VN/EN), Map picker, Media upload, Category, Radius slider | loading / error (validation) / error (upload fail) / success (toast) |
| S06 | POI Detail View | Xem chi tiết POI | Image carousel, Audio player, Map, Metadata | loading / error (404) / success |
| S07 | Tour List | Quản lý Tours | Table, Status filter, Pagination | loading / empty / error / success |
| S08 | Tour Create/Edit | Tạo/sửa Tour | Form (name, desc), POI picker (drag & drop), Route preview map | loading / error (< 2 POIs) / error (validation) / success |
| S09 | Admin Analytics | Thống kê tổng quan | Cards, Charts (line, bar), Tables, Period selector, Export | loading / empty (no data) / error / success |
| S10 | Admin Settings | Cài đặt hệ thống | System config form | loading / error / success |

---

## B. Shop Owner Dashboard (Web — React)

| ID | Screen | Purpose | UI Blocks | States |
|----|--------|---------|-----------|--------|
| S11 | SO Login | Đăng nhập Shop Owner | Form (email, password) | loading / error (invalid) / error (locked) / success |
| S12 | SO Register | Đăng ký tài khoản | Form (email, password, name, business_name, phone) | loading / error (email trùng) / error (validation) / success (auto-login) |
| S13 | SO Dashboard | Tổng quan cửa hàng | Stat cards (3), My POIs table, Quick actions | loading / empty (no POIs) / error / success |
| S14 | SO POI Create/Edit | Tạo/sửa POI của mình | Form (simplified, không category), Media upload | loading / error (validation) / error (403 forbidden) / success |
| S15 | SO Analytics | Thống kê views/plays | Cards, Line chart, Per-POI table, Period selector | loading / empty / error / success |
| S16 | SO Profile | Quản lý hồ sơ | Form (business_name, phone, avatar) | loading / error / success (toast) |

---

## C. Tourist App (Mobile — Expo/React Native)

| ID | Screen | Purpose | UI Blocks | States |
|----|--------|---------|-----------|--------|
| S17 | Map Screen (Main) | Bản đồ POIs | Mapbox map, Markers (🔴🟡), Bottom card, Location button | loading (GPS) / error (no GPS) / empty (no nearby) / success |
| S18 | POI Detail | Xem chi tiết POI | Image carousel, Audio player, Description, Directions CTA, ❤️ Favorite | loading / error (offline) / success / playing (audio) |
| S19 | Tour List | Danh sách Tours | Card list (thumbnail, name, POI count, duration) | loading / empty / error / success |
| S20 | Tour Detail | Chi tiết Tour | Route map, Ordered POI list, Start button | loading / error / success |
| S21 | Tour Following | Đang theo Tour | Map with route, Current POI highlight, Distance indicator, Next button | navigating / arrived (auto-trigger) / completed (🎉) / error (GPS lost) |
| S22 | Auto-trigger Popup | Notification POI gần | Bottom sheet (POI preview, Play button) | single POI / overlap (multiple POIs) |
| S23 | QR Scanner | Quét QR fallback | Camera view, QR frame | scanning / success (POI loaded) / error (invalid QR) |
| S24 | Favorites | Danh sách yêu thích | POI card list + distance | loading / empty ("Chưa lưu") / error / success |
| S25 | History | Lịch sử tham quan | Timeline list (POI, date, audio played) | loading / empty ("Chưa tham quan") / error / success |
| S26 | Settings | Cài đặt app | Language selector, GPS toggle, About, Logout | success |
| S27 | Login/Register | Đăng nhập Tourist | Form (email, password), Social login (Google) | loading / error / success |

---

## D. Shared / System Screens

| ID | Screen | Purpose | UI Blocks | States |
|----|--------|---------|-----------|--------|
| S28 | 404 Not Found | Trang không tồn tại | Illustration, Back/Home buttons | static |
| S29 | Offline Banner | Mất kết nối | Banner + cached data | offline / reconnecting / back online |
| S30 | Permission Request | Xin quyền GPS | Dialog (reason + grant button) | requesting / granted / denied |

---

## Tổng kết

| Platform | Screens | States Coverage |
|----------|---------|----------------|
| Admin Dashboard | 10 (S01-S10) | 4 states/screen ✅ |
| Shop Owner Dashboard | 6 (S11-S16) | 4 states/screen ✅ |
| Tourist App | 11 (S17-S27) | 4 states/screen ✅ |
| Shared | 3 (S28-S30) | — |
| **Tổng** | **30 screens** | **All have ≥4 states** |
