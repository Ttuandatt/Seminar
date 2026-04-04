# 3.2. Ma trận phân quyền

## Mô tả phân quyền theo vai trò (RBAC)

- **Admin**: Toàn quyền trên tất cả modules (POI CRUD, Tour CRUD, User management, Analytics, Merchant management, Media management, TTS, Translation, QR Code).
- **Shop Owner**: Tạo/Xem/Sửa/Xóa POI sở hữu (`owner_id = user_id`), Upload media cho POI mình, Tạo TTS & dịch nội dung, Xem/tải QR Code POI mình, Xem analytics riêng, Cập nhật hồ sơ cửa hàng. KHÔNG truy cập POI người khác (HTTP 403), KHÔNG đổi trạng thái POI, KHÔNG xóa media.
- **Tourist**: Xem tất cả POI/Tour active (qua Public API không cần auth), Đăng ký/Đăng nhập, Quản lý yêu thích và lịch sử (cần auth), **Tạo/Sửa/Xóa tour tùy chỉnh (Custom Tour)**, Trigger GPS/QR events, Cài đặt cá nhân (ngôn ngữ, auto-play). KHÔNG tạo/sửa nội dung POI.

---

## Bảng ma trận chi tiết

> **Chú thích:**
> ✓ = Toàn quyền &emsp; ◐ = Chỉ dữ liệu sở hữu (`owner_id = user_id`) &emsp; ✗ = Không có quyền (HTTP 403) &emsp; — = Không áp dụng

### Xác thực & Hồ sơ

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Đăng ký tài khoản | — | ✓ | ✓ | ✓ |
| Đăng nhập / Đăng xuất | ✓ | ✓ | ✓ | — |
| Đặt lại mật khẩu (forgot/reset) | ✓ | ✓ | ✓ | ✓ |
| Làm mới token (refresh) | ✓ | ✓ | ✓ | — |
| Xem / Sửa hồ sơ cá nhân | ✓ | ✓ | ✓ | ✗ |
| Upload avatar | ✓ | ✓ | ✓ | ✗ |

### Quản lý POI

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Tạo POI | ✓ | ◐ | ✗ | ✗ |
| Xem danh sách tất cả POI | ✓ | ✗ | ✗ | ✗ |
| Xem danh sách POI sở hữu | ✓ | ◐ | ✗ | ✗ |
| Xem chi tiết POI | ✓ | ◐ | ✗ | ✗ |
| Sửa POI | ✓ | ◐ | ✗ | ✗ |
| Xóa POI (soft delete) | ✓ | ◐ | ✗ | ✗ |
| Đổi trạng thái POI (DRAFT/ACTIVE/ARCHIVED) | ✓ | ✗ | ✗ | ✗ |

### Quản lý Media (Ảnh/Audio POI)

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Upload media cho POI (qua `/pois/:id/media`) | ✓ | ✗ | ✗ | ✗ |
| Upload media cho POI sở hữu (qua `/shop-owner/pois/:id/media`) | — | ◐ | ✗ | ✗ |
| Xóa media POI | ✓ | ✗ | ✗ | ✗ |

### Quản lý Tour (Official)

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Tạo Tour (official) | ✓ | ✗ | ✗ | ✗ |
| Xem danh sách Tour | ✓ | ✗ | ✗ | ✗ |
| Sửa Tour / Quản lý stops | ✓ | ✗ | ✗ | ✗ |
| Sắp xếp lại thứ tự stops | ✓ | ✗ | ✗ | ✗ |
| Publish / Unpublish Tour | ✓ | ✗ | ✗ | ✗ |
| Xóa Tour | ✓ | ✗ | ✗ | ✗ |

### Tour tùy chỉnh (Custom Tour — Tourist)

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Tạo tour tùy chỉnh | — | — | ✓ | ✗ |
| Xem danh sách tour tùy chỉnh của mình | — | — | ✓ | ✗ |
| Xem chi tiết tour tùy chỉnh | — | — | ✓ | ✗ |
| Sửa tour tùy chỉnh | — | — | ✓ | ✗ |
| Xóa tour tùy chỉnh | — | — | ✓ | ✗ |

### TTS (Text-to-Speech)

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Sinh audio TTS cho POI | ✓ | ◐ | ✗ | ✗ |
| Sinh audio TTS kèm dịch tự động | ✓ | ◐ | ✗ | ✗ |
| Xem danh sách ngôn ngữ TTS | ✓ | ✓ | ✗ | ✗ |
| Xem danh sách giọng đọc | ✓ | ✓ | ✗ | ✗ |

### Dịch thuật (Translation)

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Dịch văn bản đơn | ✓ | ✓ | ✗ | ✗ |
| Dịch hàng loạt (batch) | ✓ | ✓ | ✗ | ✗ |
| Xem danh sách ngôn ngữ hỗ trợ | ✓ | ✓ | ✗ | ✗ |

### QR Code

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Xem / Download QR Code POI | ✓ | ✓ | ✗ | ✗ |
| Sinh lại QR Code | ✓ | ✗ | ✗ | ✗ |

### Quản lý Merchant (Shop Owner)

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Tạo tài khoản Shop Owner | ✓ | ✗ | ✗ | ✗ |
| Xem danh sách Shop Owner | ✓ | ✗ | ✗ | ✗ |
| Xem chi tiết Shop Owner | ✓ | ✗ | ✗ | ✗ |
| Sửa thông tin Shop Owner | ✓ | ✗ | ✗ | ✗ |
| Xóa tài khoản Shop Owner | ✓ | ✗ | ✗ | ✗ |

### Shop Owner Portal

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Xem / Sửa hồ sơ cửa hàng | ✗ | ✓ | ✗ | ✗ |
| Xem analytics riêng (views, audio plays) | ✗ | ✓ | ✗ | ✗ |

### Tourist Portal

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Xem / Sửa hồ sơ du khách | ✗ | ✗ | ✓ | ✗ |
| Quản lý yêu thích (thêm/xóa/xem) | ✗ | ✗ | ✓ | ✗ |
| Xem lịch sử trải nghiệm | ✗ | ✗ | ✓ | ✗ |
| Ghi lịch sử xem POI | ✗ | ✗ | ✓ | ✗ |
| Cài đặt ngôn ngữ, auto-play | ✗ | ✗ | ✓ | ✗ |

### Analytics

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Xem analytics tổng quan (toàn hệ thống) | ✓ | ✗ | ✗ | ✗ |

### Public API (không cần xác thực)

| Chức năng | Admin | Shop Owner | Tourist | Public |
|---|:---:|:---:|:---:|:---:|
| Xem danh sách POI active | — | — | ✓ | ✓ |
| Xem chi tiết POI (kèm media) | — | — | ✓ | ✓ |
| Tìm POI gần vị trí (nearby) | — | — | ✓ | ✓ |
| Xem danh sách Tour active | — | — | ✓ | ✓ |
| Xem chi tiết Tour | — | — | ✓ | ✓ |
| Quét / Validate QR Code | — | — | ✓ | ✓ |
| Ghi nhật ký trigger (GPS/QR/MANUAL) | — | — | ✓ | ✓ |

---

## Các thay đổi so với phiên bản trước

| # | Mục | Trước | Sau | Lý do |
|---|---|---|---|---|
| 1 | Shop Owner — Xóa POI | ✗ | ◐ | Code thực tế cho phép `ADMIN + SHOP_OWNER` xóa, service kiểm tra `ownerId` |
| 2 | Tourist — Custom Tour (CRUD) | Không có trong ma trận | Thêm mới cả section | `tourist.controller.ts` có đầy đủ endpoints: POST/GET/PATCH/DELETE `/tourist/me/tours` |
| 3 | Dịch thuật (Translation) | Không có trong ma trận | Thêm mới cả section | `translate.controller.ts` với `@Roles(ADMIN, SHOP_OWNER)` |
| 4 | Upload avatar | Không có | Thêm vào Xác thực & Hồ sơ | `POST /me/avatar` cho tất cả user đã đăng nhập |
| 5 | Refresh token | Không có | Thêm vào Xác thực & Hồ sơ | `POST /auth/refresh` |
| 6 | Media management | Gộp chung với POI | Tách riêng section | Admin dùng `/pois/:id/media`, Shop Owner dùng `/shop-owner/pois/:id/media` — quyền khác nhau |
| 7 | Tourist Portal | Thiếu nhiều chức năng | Bổ sung đầy đủ | Thêm: ghi lịch sử, cài đặt ngôn ngữ/auto-play, sửa hồ sơ du khách |
| 8 | Public API | Thiếu xem Tour, chi tiết POI | Bổ sung đầy đủ | `public.controller.ts` có cả Tour list/detail và POI detail |
| 9 | Mô tả Tourist | "KHÔNG tạo/sửa nội dung" | Cập nhật cho phép tạo Custom Tour | Tourist tạo tour tùy chỉnh là tính năng đã implement |
