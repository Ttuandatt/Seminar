# User Personas & Roles
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 2.0  
> **Ngày tạo:** 2026-02-08  
> **Cập nhật:** 2026-02-10

---

## 1. User Personas

### 1.1 Persona 1: Admin (Quản trị viên)

| Attribute | Description |
|-----------|-------------|
| **Tên** | Minh - Content Manager |
| **Tuổi** | 28-40 |
| **Tech Savvy** | Trung bình - Quen dùng các CMS cơ bản |
| **Thiết bị** | Desktop/Laptop, Chrome browser |
| **Ngôn ngữ** | Tiếng Việt (primary), tiếng Anh (basic) |

**Goals:**
- Quản lý nội dung POI và Tour hiệu quả
- Cập nhật thông tin nhanh chóng
- Theo dõi hiệu quả nội dung

**Pain Points:**
- Hiện tại quản lý bằng Excel/Word - dễ lỗi
- Khó đồng bộ nội dung đa ngôn ngữ
- Không có công cụ preview trước khi publish

**Behaviors:**
- Làm việc giờ hành chính
- Cần giao diện đơn giản, trực quan
- Thường xuyên cập nhật nội dung theo sự kiện

---

### 1.2 Persona 2: Du khách Việt Nam

| Attribute | Description |
|-----------|-------------|
| **Tên** | Hương - Freelancer |
| **Tuổi** | 25-45 |
| **Tech Savvy** | Cao - Quen dùng smartphone |
| **Thiết bị** | Android/iOS smartphone |
| **Ngôn ngữ** | Tiếng Việt |

**Goals:**
- Tìm hiểu về địa điểm tham quan
- Trải nghiệm như có hướng dẫn viên
- Tiết kiệm thời gian tìm kiếm thông tin

**Pain Points:**
- Thiếu thông tin khi không có guide
- Phải tra cứu nhiều nguồn
- Bỏ lỡ điểm tham quan hay

**Behaviors:**
- Đi du lịch vào cuối tuần/nghỉ lễ
- Chụp ảnh và chia sẻ social media
- Thích khám phá những điểm ít người biết

---

### 1.3 Persona 3: Du khách Quốc tế

| Attribute | Description |
|-----------|-------------|
| **Tên** | John - Traveler |
| **Tuổi** | 25-55 |
| **Tech Savvy** | Cao |
| **Thiết bị** | iPhone/Android, có thể không có 4G local |
| **Ngôn ngữ** | English (primary), có thể basic tiếng Việt |

**Goals:**
- Hiểu văn hóa địa phương
- Trải nghiệm authentic
- Điều hướng dễ dàng không cần biết tiếng Việt

**Pain Points:**
- Rào cản ngôn ngữ
- Không biết đọc bảng chỉ dẫn tiếng Việt
- Internet có thể không ổn định

**Behaviors:**
- Du lịch theo kiểu backpacker hoặc self-guided
- Tải trước nội dung khi có WiFi
- Đánh giá cao offline capability

---

### 1.4 Persona 4: Tourist đã đăng ký (Registered Tourist)

| Attribute | Description |
|-----------|-------------|
| **Tên** | Thảo - Food Explorer |
| **Tuổi** | 20-35 |
| **Tech Savvy** | Cao |
| **Thiết bị** | Smartphone Android/iOS |
| **Ngôn ngữ** | Tiếng Việt hoặc English |

**Goals:**
- Lưu lại những địa điểm yêu thích để quay lại
- Xem lại lịch sử các nơi đã tham quan
- Đồng bộ dữ liệu giữa các thiết bị

**Pain Points:**
- Mất dữ liệu khi đổi điện thoại
- Không nhớ đã xem những POI nào rồi
- Muốn chia sẻ danh sách yêu thích với bạn bè

**Behaviors:**
- Thường đăng ký bằng Social Login (Google/Facebook)
- Sử dụng app nhiều lần (returning user)
- Chủ động lưu favorites và xem history

---

### 1.5 Persona 5: Chủ quán (Shop Owner)

| Attribute | Description |
|-----------|-------------|
| **Tên** | Anh Tùng - Chủ quán bún mắm |
| **Tuổi** | 35-55 |
| **Tech Savvy** | Trung bình - Thấp |
| **Thiết bị** | Smartphone + Laptop cơ bản |
| **Ngôn ngữ** | Tiếng Việt |

**Goals:**
- Quảng bá quán đến du khách
- Tự quản lý thông tin, hình ảnh quán trên app
- Biết được bao nhiêu người xem/nghe về quán mình

**Pain Points:**
- Không rành công nghệ, cần giao diện đơn giản
- Bận buôn bán, không có nhiều thời gian
- Không biết tự viết nội dung hấp dẫn

**Behaviors:**
- Thường dùng Facebook/Zalo để đăng ảnh quán
- Chụp ảnh bằng điện thoại, upload trực tiếp
- Check analytics vài lần/tuần

---

## 2. User Roles & Permissions

### 2.1 Role Matrix

| Role | Description | Platform | Permissions |
|------|-------------|----------|-------------|
| **Super Admin** | System administrator | Web | Full access, user management |
| **Admin** | Content manager | Web | CRUD POI, Tour, Media |
| **Viewer** | Read-only access | Web | View reports only |
| **Shop Owner** | Chủ quán/cửa hàng | Web | CRUD own POI(s), view own analytics |
| **Tourist (Guest)** | Du khách (anonymous) | Mobile App | View content, play audio |
| **Tourist (Registered)** | Du khách (đã đăng ký) | Mobile App | + Favorites, History, Sync |

### 2.2 Permission Details

#### Admin Dashboard Permissions

| Action | Super Admin | Admin | Viewer | Shop Owner |
|--------|-------------|-------|--------|------------|
| Login | ✅ | ✅ | ✅ | ✅ |
| Create POI | ✅ | ✅ | ❌ | ✅ (own) |
| Edit POI | ✅ | ✅ | ❌ | ✅ (own) |
| Delete POI | ✅ | ✅ | ❌ | ❌ |
| Create Tour | ✅ | ✅ | ❌ | ❌ |
| Edit Tour | ✅ | ✅ | ❌ | ❌ |
| Delete Tour | ✅ | ✅ | ❌ | ❌ |
| Upload Media | ✅ | ✅ | ❌ | ✅ (own POI) |
| View Reports | ✅ | ✅ | ✅ | ✅ (own POI) |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

#### Tourist App Permissions

| Action | Tourist (Guest) | Tourist (Registered) |
|--------|-----------------|----------------------|
| View POIs | ✅ | ✅ |
| Play Audio | ✅ | ✅ |
| Select Tour | ✅ | ✅ |
| Change Language | ✅ | ✅ |
| Download Offline | ✅ | ✅ |
| QR Code Scan | ✅ | ✅ |
| Save Favorites | ❌ | ✅ (P1) |
| View History | ❌ (device only) | ✅ (P1, synced) |
| Sync across devices | ❌ | ✅ (P1) |
| Social Login | ❌ | ✅ (P1) |

---

## 3. User Journey Maps

### 3.1 Admin Journey: Tạo POI mới

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Login  │───▶│ Dashboard│───▶│ POI List│───▶│ Create  │───▶│  Save   │
│         │    │         │    │         │    │   POI   │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
 Enter creds   View stats    Click "Add"   Fill form,     Submit,
                              button      upload media   see success
```

**Touchpoints:**
1. Login page
2. Dashboard overview
3. POI management page
4. Create/Edit form
5. Map picker component
6. Media uploader
7. Success notification

---

### 3.2 Tourist Journey: Tham quan với audio guide

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Open App │───▶│ See Map │───▶│Enter POI│───▶│Audio    │───▶│ Next    │
│         │    │ + POIs  │    │ Area    │    │ Plays   │    │  POI    │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │              │
     ▼              ▼              ▼              ▼              ▼
 Grant GPS      Explore       GPS trigger   Listen info   Continue
 permission     markers       auto-detect   about POI     tour
```

**Touchpoints:**
1. App splash screen
2. Permission request
3. Map interface
4. POI markers
5. Audio player
6. POI detail modal
7. Tour progress indicator

---

## 4. RACI Matrix

| Task | Product Owner | Dev Lead | Developer | Content Team | QA |
|------|---------------|----------|-----------|--------------|-----|
| Define requirements | A | C | I | C | I |
| Design UI/UX | C | A | R | I | C |
| Develop features | I | A | R | I | C |
| Create content | C | I | I | R | I |
| Testing | I | C | C | I | R |
| Deployment | I | A | R | I | C |
| User acceptance | R | C | I | C | C |

**Legend:** R = Responsible, A = Accountable, C = Consulted, I = Informed

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 3, 4
