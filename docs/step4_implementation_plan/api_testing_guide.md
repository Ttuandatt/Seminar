# Hướng dẫn Kiểm thử API (API Testing Guide) - Chi Tiết

Tài liệu này hướng dẫn chi tiết từng bước kiểm thử hệ thống API Seminar GPS Tours.
**Môi trường (Base URL):** `http://localhost:3000/api/v1`

---

## 1. Setup & Database Prerequisites
Để test API thành công, bạn **BẮT BUỘC** phải đảm bảo Database đang chạy và kết nối được.

### 1.1. Kiểm tra Database (Docker)
1.  Mở **Docker Desktop**.
2.  Đảm bảo 2 container sau đang có trạng thái **Running** (màu xanh):
    *   `gpstours-db` (PostgreSQL - Port 5432)
    *   `gpstours-cache` (Redis - Port 6379)
3.  Nếu chưa chạy, hãy mở terminal tại thư mục `apps/api` và chạy lệnh:
    ```bash
    docker-compose up -d
    ```

### 1.2. Khởi chạy Backend Server
API cần phải chạy thì mới test được.
1.  Mở một terminal mới.
2.  Di chuyển vào thư mục API:
    ```bash
    cd apps/api
    ```
3.  Chạy server:
    ```bash
    npm run start:prod
    ```
    *(Hoặc `npm run start:dev` nếu bạn muốn chế độ development)*
4.  Chờ đến khi thấy thông báo: `Nest application successfully started`.
    *   Server sẽ chạy tại: `http://localhost:3000/api/v1`

### 1.3. Xem & Quản lý dữ liệu (Khuyên dùng)
Cách dễ nhất để kiểm tra dữ liệu (User, POI, Tour) mà không cần cài thêm tool quản lý DB:
1.  Mở terminal tại thư mục `apps/api`.
2.  Chạy lệnh:
    ```bash
    npx prisma studio
    ```
3.  Truy cập trình duyệt: `http://localhost:5555`.
    *   Tại đây bạn có thể xem trực tiếp danh sách `User`, `POI`, `Tour`.
    *   Dùng để verify dữ liệu đã được tạo thành công sau khi gọi API.

### 1.3. Cài đặt Client Test (Hoppscotch/Postman)
1.  Import file `api_collection.json` (OpenAPI 3.0.1) vào **Hoppscotch** hoặc **Postman**.
2.  Đảm bảo biến môi trường `baseUrl` là `http://localhost:3000/api/v1`.

---

## 2. Kịch bản Kiểm thử (Test Flow)

### Bước 1: Tạo tài khoản Admin (System Administrator)
*   **Mục đích**: Tạo user có quyền cao nhất để quản lý hệ thống.
*   **Request**:
    *   **Method**: `POST`
    *   **Endpoint**: `/auth/register`
    *   **Body (JSON)**:
        ```json
        {
          "email": "admin@gpstours.vn",
          "password": "admin123",
          "fullName": "System Admin",
          "role": "ADMIN"
        }
        ```
*   **Kết quả mong đợi**: HTTP `201 Created`. Trả về thông tin user (không bao gồm password).

### Bước 2: Đăng nhập Admin & Lấy Token
*   **Mục đích**: Lấy `accessToken` để thực hiện các quyền Admin.
*   **Request**:
    *   **Method**: `POST`
    *   **Endpoint**: `/auth/login`
    *   **Body (JSON)**:
        ```json
        {
          "email": "admin@gpstours.vn",
          "password": "admin123"
        }
        ```
*   **Kết quả mong đợi**: HTTP `200 OK`. Trả về `accessToken` và `refreshToken`.
*   **LƯU Ý**:
    *   Copy `accessToken`.
    *   Paste vào phần **Authorization** (kiểu **Bearer Token**) cho các bước 3, 4, 6.

### Bước 3: Admin tạo Địa điểm (POI)
*   **Mục đích**: Tạo một địa điểm du lịch (ví dụ: Quán Ốc).
*   **Request**:
    *   **Method**: `POST`
    *   **Endpoint**: `/pois`
    *   **Header**: `Authorization: Bearer <ADMIN_TOKEN>`
    *   **Body (JSON)**:
        ```json
        {
          "nameVi": "Quán Ốc Oanh",
          "nameEn": "Oc Oanh Snail Restaurant",
          "category": "MAIN",
          "status": "ACTIVE",
          "latitude": 10.762622,
          "longitude": 106.660172,
          "address": "534 Vĩnh Khánh, Q.4",
          "triggerRadius": 20
        }
        ```
*   **Kết quả mong đợi**: HTTP `201 Created`. Trả về object POI có `id` (ghi nhớ ID này, ví dụ: `1`).

### Bước 4: Admin tạo Tour và Gán POI
**4.1. Tạo Tour**
*   **Request**:
    *   **Method**: `POST`
    *   **Endpoint**: `/tours`
    *   **Header**: `Authorization: Bearer <ADMIN_TOKEN>`
    *   **Body**:
        ```json
        {
          "nameVi": "Food Tour Vĩnh Khánh",
          "estimatedDuration": 120,
          "status": "ACTIVE"
        }
        ```
*   **Kết quả mong đợi**: HTTP `201 Created`. Ghi nhớ `id` của Tour (ví dụ: `1`).

**4.2. Gán POI vào Tour**
*   **Request**:
    *   **Method**: `POST`
    *   **Endpoint**: `/tours/:id/pois` (Ví dụ: `/tours/1/pois`)
    *   **Header**: `Authorization: Bearer <ADMIN_TOKEN>`
    *   **Body**:
        ```json
        {
          "poiIds": [1]  // Thay [1] bằng danh sách ID các POI thực tế
        }
        ```
*   **Kết quả mong đợi**: HTTP `201 Created`.

### Bước 5: Tạo tài khoản Chủ Shop (Shop Owner)
*   **Mục đích**: Đăng ký đối tác kinh doanh.
*   **Request**:
    *   **Method**: `POST`
    *   **Endpoint**: `/auth/register`
    *   **Body**:
        ```json
        {
            "role": "SHOP_OWNER",
            "email": "shop@bunmam.vn",
            "password": "shop123",
            "fullName": "Nguyen Van Tung",
            "shopName": "Bún Mắm Tùng",
            "shopAddress": "144 Vĩnh Khánh"
        }
        ```
*   **Kết quả mong đợi**: HTTP `201 Created`.

### Bước 6: App Khách du lịch (Public API)
*   **Mục đích**: Khách xem danh sách địa điểm xung quanh (Không cần Login).
*   **Request**:
    *   **Method**: `GET`
    *   **Endpoint**: `/public/pois/nearby`
    *   **Query Params**:
        *   `lat`: `10.762`
        *   `lng`: `106.660`
        *   `radius`: `1000`
*   **Kết quả mong đợi**: HTTP `200 OK`. Trả về danh sách POI (bao gồm Quán Ốc Oanh vừa tạo).

---

## 3. Các lỗi thường gặp (Troubleshooting)

| Mã Lỗi | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| **401 Unauthorized** | Chưa gửi Token hoặc Token hết hạn. | Login lại lấy Token mới, paste vào Header Authorization. |
| **403 Forbidden** | Sai quyền (VD: ShopOwner gọi API Admin). | Dùng đúng tài khoản (Admin cho POI/Tour). |
| **Connection Refused** | Server chưa chạy. | Kiểm tra terminal `npm run start:prod`. |
