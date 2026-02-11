# 🔄 User Flows
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh — Step 2

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-11  
> **Ref:** Step 2 Low-code (UI + Flow + Rule)

---

## 1. Admin Login Flow

**Screens:** S01, S02, S03

**Happy Path:**
1. Admin truy cập `/admin/login` → S01
2. Nhập email + password
3. System validate credentials
4. Tạo JWT tokens, lưu localStorage
5. Redirect → S03 Dashboard Overview

**Edge Cases:**

| ID | Scenario | Expected Behavior | Screen |
|----|----------|-------------------|--------|
| EC-01 | Sai email hoặc password | Hiển thị "Invalid email or password", không tiết lộ cái nào sai | S01 |
| EC-02 | Sai 5 lần liên tiếp trong 15 phút | Lock account 15 phút, hiển thị "Account locked" | S01 |
| EC-03 | Access token hết hạn khi đang dùng | Auto-refresh bằng refresh token, user không bị gián đoạn | — |
| EC-04 | Refresh token hết hạn | Force logout, redirect → S01 Login | S01 |
| EC-05 | Tài khoản bị disable bởi super admin | Hiển thị "Account disabled, contact administrator" | S01 |
| EC-06 | Network error khi submit login | Toast "Connection error, please try again" | S01 |
| EC-07 | Quên mật khẩu | Click "Forgot password?" → S02 → nhập email → check email → reset | S02 |

---

## 2. POI Management Flow (Admin)

**Screens:** S04, S05, S06

**Happy Path (Create):**
1. Admin vào S04 POI List
2. Nhấn "+ Add New POI" → S05
3. Nhập name (VN/EN), description, chọn vị trí trên map
4. Chọn category (MAIN/SUB), set trigger radius
5. Upload images (drag & drop) + audio (VN/EN)
6. Nhấn "Publish" → toast "POI created!" → redirect S04

**Happy Path (Edit):**
1. Admin nhấn "Edit" trên POI row → S05 (pre-filled)
2. Sửa thông tin, thêm/xóa media
3. Nhấn "Save" → toast "POI updated!"

**Happy Path (Delete):**
1. Admin nhấn 🗑️ Delete → confirm dialog
2. Xác nhận → POI soft-deleted (status='archived')
3. POI biến mất khỏi danh sách

**Edge Cases:**

| ID | Scenario | Expected Behavior | Screen |
|----|----------|-------------------|--------|
| EC-08 | Upload ảnh > 5MB | Error "File too large, max 5MB" | S05 |
| EC-09 | Upload file không phải image (PDF) | Error "Invalid file type, only JPEG/PNG/WebP" | S05 |
| EC-10 | Upload > 10 ảnh | Error "Maximum 10 images" | S05 |
| EC-11 | Tên POI trùng với POI khác | Error "POI name already exists" | S05 |
| EC-12 | Tọa độ ngoài vùng phục vụ | Error "Location outside service area" | S05 |
| EC-13 | Xóa POI thuộc 1+ Tours | Warning cascade: "POI belongs to Tour A, Tour B", cần xác nhận lần 2 | S04 |
| EC-14 | Network fail khi upload | Retry 3 lần, nếu vẫn fail → "Upload failed, try again" | S05 |
| EC-15 | Edit POI đã bị archived | Error "Cannot edit deleted POI" | S05 |

---

## 3. Tour Management Flow (Admin)

**Screens:** S07, S08

**Happy Path:**
1. Admin vào S07 Tour List
2. Nhấn "+ New Tour" → S08
3. Nhập tên, mô tả
4. Chọn POIs từ danh sách (chỉ published) → drag & drop sắp xếp thứ tự
5. Preview route trên map, system tính estimated_duration
6. Nhấn "Create Tour" → toast "Tour created!" → redirect S07

**Edge Cases:**

| ID | Scenario | Expected Behavior | Screen |
|----|----------|-------------------|--------|
| EC-16 | Chọn < 2 POIs | Error "Tour must have at least 2 POIs" | S08 |
| EC-17 | POI bị unpublish sau khi thêm vào Tour | Auto-remove POI khỏi Tour, notify Admin | S07 |
| EC-18 | Xóa Tour đang published | Confirm dialog, Tour biến mất khỏi Tourist App | S07 |
| EC-19 | Duplicate Tour name | Warning nhưng cho phép (không unique constraint) | S08 |
| EC-20 | Drag POI ra ngoài list | POI bị remove khỏi Tour, order auto-reindex | S08 |

---

## 4. Shop Owner Registration + POI Flow

**Screens:** S11, S12, S13, S14

**Happy Path (Register):**
1. Shop Owner truy cập /register → S12
2. Nhập email, password, fullName, business_name, phone
3. Chọn role = Shop Owner
4. Submit → tạo User + Shop_Owner record
5. Auto-login → redirect S13 Dashboard

**Happy Path (Manage POI):**
1. SO vào S13 → tab "My POIs"
2. Nhấn "+ New POI" → S14
3. Nhập thông tin, upload media
4. Submit → POI tạo với owner_id = current SO, status = draft
5. Quay lại S13, POI xuất hiện trong danh sách

**Edge Cases:**

| ID | Scenario | Expected Behavior | Screen |
|----|----------|-------------------|--------|
| EC-21 | Email đã đăng ký | Error "Email already registered" | S12 |
| EC-22 | Password yếu (< 8 chars) | Error "Password must be at least 8 characters" | S12 |
| EC-23 | SO cố truy cập POI của SO khác | 403 Forbidden, redirect My POIs | S14 |
| EC-24 | SO cố xóa POI | Button disabled/hidden, tooltip "Only Admin can delete" | S13 |
| EC-25 | SO cố truy cập Admin routes | 403 Forbidden | — |

---

## 5. Tourist Journey Flow

**Screens:** S17, S18, S19, S20, S21, S22

**Happy Path (Free Explore):**
1. Tourist mở app → request GPS permission → S30
2. Permission granted → lấy vị trí → hiển thị map S17
3. Map hiển thị nearby POIs (markers 🔴🟡)
4. Tap POI marker → bottom card preview
5. Tap card → S18 POI Detail (images, description, audio)
6. Tap ▶ Play → nghe thuyết minh → quay lại map

**Happy Path (Follow Tour):**
1. Tourist mở tab Tours → S19
2. Chọn Tour → S20 (route + POI list)
3. Nhấn "Bắt đầu Tour" → S21
4. Navigate to POI #1 → đến nơi → auto-trigger POI detail + audio
5. Nhấn "Next" → navigate to POI #2 → lặp lại
6. Hoàn thành tất cả POIs → 🎉 "Tour completed!"

**Edge Cases:**

| ID | Scenario | Expected Behavior | Screen |
|----|----------|-------------------|--------|
| EC-26 | Từ chối GPS permission | Chế độ hạn chế: chỉ xem list, không map/auto-trigger | S17 |
| EC-27 | Mất internet khi đang dùng | Banner "Offline", hiển thị cached POIs | S29 |
| EC-28 | Vào vùng trigger 2+ POIs cùng lúc (overlap) | Trigger POI gần nhất, hiển thị "Cũng gần bạn" bottom sheet | S22 |
| EC-29 | Trigger lại POI đã xem < 5 phút trước | Skip (cooldown), không trigger lại | — |
| EC-30 | GPS accuracy > 10m | Giữ vị trí cũ, đợi signal tốt hơn | S17 |
| EC-31 | Battery thấp | Giảm GPS update từ 5s → 30s | — |
| EC-32 | Incoming call khi đang nghe audio | Pause audio, resume khi call kết thúc | S18 |
| EC-33 | Nội dung EN không có | Fallback VN + badge "Not available in English" | S18 |
| EC-34 | QR code không hợp lệ | Error "QR code không hợp lệ" | S23 |

---

## 6. Tourist Favorites & History Flow

**Screens:** S24, S25

**Happy Path (Favorite):**
1. Tourist xem S18 POI Detail
2. Nhấn ❤️ → POST /tourist/favorites
3. Heart icon chuyển đỏ, toast "Saved to favorites"
4. Vào tab Favorites S24 → thấy POI đã lưu

**Edge Cases:**

| ID | Scenario | Expected Behavior | Screen |
|----|----------|-------------------|--------|
| EC-35 | Nhấn ❤️ khi chưa login | Dialog "Login to save favorites" | S18 |
| EC-36 | Unfavorite (toggle OFF) | Heart icon → trắng, toast "Removed" | S18 |
| EC-37 | Favorites list rỗng | Empty state "Chưa lưu điểm nào" | S24 |
| EC-38 | History list rỗng | Empty state "Chưa tham quan nơi nào" | S25 |
| EC-39 | POI bị xóa sau khi favorite | POI biến mất khỏi favorites list | S24 |

---

## 7. Language Switch Flow

**Screens:** S26, S18

**Happy Path:**
1. Tourist vào S26 Settings
2. Chọn ngôn ngữ: 🇻🇳 VN → 🇬🇧 EN
3. App re-render tất cả UI labels sang EN
4. Khi xem POI detail → hiển thị name_en, desc_en, audio_en

**Edge Cases:**

| ID | Scenario | Expected Behavior | Screen |
|----|----------|-------------------|--------|
| EC-40 | Nội dung EN null | Fallback VN + badge "Content not available in English" | S18 |
| EC-41 | Audio EN null | Play audio VN, show note | S18 |

---

## Tổng kết

| Flow | Happy Paths | Edge Cases | Total |
|------|-------------|------------|-------|
| Admin Login | 1 | 7 (EC-01~07) | 8 |
| POI Management | 3 | 8 (EC-08~15) | 11 |
| Tour Management | 1 | 5 (EC-16~20) | 6 |
| Shop Owner | 2 | 5 (EC-21~25) | 7 |
| Tourist Journey | 2 | 9 (EC-26~34) | 11 |
| Favorites & History | 1 | 5 (EC-35~39) | 6 |
| Language Switch | 1 | 2 (EC-40~41) | 3 |
| **Tổng** | **11** | **41 edge cases** | **52** |
