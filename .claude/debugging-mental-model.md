# Bug Debugging Mental Model

> Đúc kết từ session debug "POI markers không hiển thị trên mobile" — mất ~2 giờ để xác định root cause thực sự chỉ là `.env` sai URL.

---

## Vì sao mất thời gian?

### Timeline thực tế

| Bước | Việc làm | Kết quả |
|------|----------|---------|
| 1 | Fix custom View marker (New Architecture) | ❌ Không liên quan |
| 2 | Fix `pinColor='gold'` → hex color | ⚠️ Đúng nhưng không phải root cause |
| 3 | Fix `poiType` → `category` field mismatch | ⚠️ Đúng nhưng không phải root cause |
| 4 | Thêm debug log xem POI nào được fetch | ✅ Hướng đúng — nhưng quá muộn |
| 5 | Đọc `.env` → phát hiện URL khác nhau | ✅ Root cause |

### Nguyên nhân mất thời gian

1. **Giả định ngầm không được kiểm tra**: "Mobile và admin panel đang dùng chung database" — không ai hỏi điều này từ đầu.
2. **Debug từ lớp sâu nhất (rendering) thay vì từ lớp nông nhất (network/data)**
3. **Chưa phân biệt rõ hai loại lỗi khác nhau**: "data không fetch được" vs "data fetch được nhưng không render"
4. **Debug log được thêm quá muộn** — nếu thêm từ đầu, ngay lập tức thấy TRUE CAFE không có trong danh sách

---

## Mental Model: Debug theo lớp (Layer-First Debugging)

Khi một tính năng "không hoạt động", luôn đi từ **ngoài vào trong**, không nhảy vào lớp giữa:

```
[1. Environment] → [2. Network] → [3. Data] → [4. State] → [5. Render]
```

### Lớp 1 — Environment
> "Ứng dụng đang kết nối đến đâu?"

- Kiểm tra `.env` của từng service
- Kiểm tra các service (frontend/backend/mobile) có trỏ vào **cùng một data source** không
- Câu hỏi bắt buộc: **"Có bao nhiêu database/server đang chạy trong môi trường này?"**

**Dấu hiệu lỗi ở lớp này**: Một service thấy data, service kia không thấy — dù cùng hành động.

### Lớp 2 — Network
> "Request có đi đến đúng nơi không? Response trả về gì?"

- Log URL thực sự đang được gọi
- Kiểm tra status code, response body
- Câu hỏi: **"Nếu tôi gọi URL này bằng curl/Postman, kết quả có giống không?"**

**Dấu hiệu lỗi ở lớp này**: Request thành công (2xx) nhưng data thiếu/sai.

### Lớp 3 — Data
> "Data nhận về có đúng shape/giá trị không?"

- Log raw response trước khi transform
- Kiểm tra field names (e.g., `poiType` vs `category`)
- Kiểm tra data types (string vs number, enum values)
- Câu hỏi: **"Interface/type definition có khớp với API response thực tế không?"**

**Dấu hiệu lỗi ở lớp này**: Data fetch thành công nhưng giá trị `undefined`/sai kiểu.

### Lớp 4 — State
> "Data có vào đúng state không? State có trigger re-render không?"

- Log state sau khi setState
- Kiểm tra dependency array của hooks
- Câu hỏi: **"Component có re-render khi data thay đổi không?"**

**Dấu hiệu lỗi ở lớp này**: Log state đúng nhưng UI không cập nhật.

### Lớp 5 — Render
> "Data đã vào state đúng, tại sao UI vẫn không hiển thị?"

- Kiểm tra điều kiện render (`&&`, ternary)
- Kiểm tra styling (color, opacity, zIndex, size = 0)
- Kiểm tra platform-specific behavior (iOS vs Android)
- Câu hỏi: **"Nếu hardcode giá trị này, UI có hiển thị không?"**

**Dấu hiệu lỗi ở lớp này**: Tất cả lớp trên đều đúng, chỉ mắc ở hiển thị.

---

## Checklist Debug Nhanh

Khi gặp bug "X không hiển thị / không hoạt động":

```
[ ] 1. Kiểm tra .env của TẤT CẢ các service liên quan
[ ] 2. Log URL thực sự đang được gọi
[ ] 3. Log raw API response (số lượng record, field names)
[ ] 4. Log state sau khi set (đúng chưa?)
[ ] 5. Mới bắt đầu điều tra lớp rendering
```

> **Quy tắc vàng**: Thêm debug log NGAY LẬP TỨC khi gặp bug — trước khi đọc code, trước khi đưa ra giả thuyết.

---

## Anti-patterns cần tránh

| Anti-pattern | Thay bằng |
|---|---|
| "Chắc là lỗi rendering" → sửa màu, sửa style | Verify data flow trước |
| Fix nhiều thứ cùng lúc | Fix một thứ, test, rồi mới tiếp |
| Giả định các service dùng chung data source | Luôn kiểm tra `.env` của từng service |
| Đọc code để đoán lỗi | Log để quan sát thực tế |
| "Có thể là do X" → sửa X ngay | Confirm X trước, sửa sau |

---

## Áp dụng vào dự án này

- **Mobile** `.env`: `EXPO_PUBLIC_API_URL` — trỏ đến local hay Render?
- **Admin** `.env`: `VITE_API_URL` — trỏ đến đâu?
- **API** `.env`: `DATABASE_URL` — local Postgres hay Render Postgres?

Khi test local: **cả ba phải trỏ về cùng một local backend + local DB.**
