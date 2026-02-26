# 📝 Q&A & Ghi chú Giảng viên (Lecturer Notes)
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Ngày tạo:** 2026-02-26  
> **Mục đích:** Lưu trữ các câu hỏi, phản biện từ giảng viên và các luận điểm (luận cứ) để bảo vệ đồ án/bài tập lớn.

---

### Câu hỏi 1: Về cơ chế quét mã QR Offline vs Online
**Giảng viên hỏi/Ghi chú:** Khi quét QR có 2 trường hợp: 
- TH1: Data thuyết minh < cấu hình thiết bị thì không cần yêu cầu wifi. Cần xuất ra SQLite lưu trữ nội bộ.
- TH2: Data thuyết minh > cấu hình thiết bị thì cần yêu cầu wifi. Cần tải từ SQL Server.

**Trả lời / Giải pháp trong Dự án:**
Hệ thống Mobile App của mình được thiết kế hỗ trợ Offline thông qua cơ chế sau:
- **Trường hợp 1 (Dung lượng nhỏ - Offline Mode):** Nếu tổng dữ liệu text/audio của điểm tham quan đó nhẹ và nằm trong giới hạn lưu trữ cho phép của thiết bị (`AsyncStorage` hoặc `SQLite`), app sẽ ưu tiên **không gọi mạng**. Dữ liệu sẽ được load thẳng từ bộ nhớ nội bộ máy lên để phát âm thanh mà không có độ trễ, tiết kiệm băng thông.
- **Trường hợp 2 (Dung lượng lớn - Online Mode):** Khi dữ liệu Media (file MP3 chất lượng cao/hình ảnh gốc) đồ sộ và vượt quá ngưỡng bộ nhớ đệm (cache), ứng dụng bắt buộc phải chuyển sang Online. Lúc này, app sẽ bắn HTTP Request lên **PostgreSQL Server (Backend NestJS)** để query dữ liệu và Stream luồng âm thanh qua Wi-Fi/4G. 

*(Ghi chú: Những luật này đã được team chuẩn hóa và đưa vào thành quy tắc **BR-809a** trong tài liệu Đặc tả Yêu cầu `functional_requirements.md`)*.

---

### Câu hỏi 2: Về tính năng Auto-trigger và Quản lý luồng Audio
**Giảng viên hỏi/Ghi chú:** App cần quản lý hàng chờ audio (multithread/đa tiến trình), cần set hàng chờ. Phải giải quyết bài toán không phát trùng lặp: Khi user vừa ra khỏi 1 vùng và vào 1 vùng khác ngay sau đó thì thằng audio của vùng trước phải tắt và audio của vùng sau phải phát ngay sau đó.

**Trả lời / Giải pháp trong Dự án:**
Đây là một bài toán hóc búa về quản lý trạng thái luồng (Audio Queue Control). Trong Mobile App, team đã xử lý theo cơ chế **Chặn phát đè ngẫu nhiên (Concurrency Control)**:
- **Audio Queue Management:** Hệ thống chỉ duy trì **duy nhất 01 object Audio (Sound Object)** tồn tại trong RAM. Nếu một âm thanh đang phát, các lệnh phát khác sẽ bị chặn đẩy vào hàng chờ (hoặc bị drop tùy logic) để giảm thiểu tràn bộ nhớ (Memory Leak).
- **Trường hợp Đi chuyển vùng liền nhau:** Khi GPS định vị user đang ở Point A và bắt đầu bước chân sang Point B (Point giao nhau). Module GPS Tracking (`Location.watchPositionAsync`) sẽ detect Point B gần hơn. Ngay lập tức, App sẽ bắn sự kiện `stopAsync()` và `unloadAsync()` để **GIẾT/HỦY ngay luồng audio A** ra khỏi bộ nhớ bộ đệm, sau đó mới cấp phát load `playAsync()` luồng Audio B. Tránh tuyệt đối tình trạng rác âm thanh (2 bài thuyết minh nói đè lên nhau cùng 1 lúc).

*(Ghi chú: Yêu cầu này đã được thể chế hóa thành Requirement **BR-804** và **BR-805** trên PRD)*.

---

### Câu hỏi 3: Vibecode (hoặc các AI Tools) có sinh được Unit Test không?
**Giảng viên hỏi:** Vibecode có sinh được unit test không?

**Trả lời để bảo vệ đồ án:**
**CÓ, VÀ THẬM CHÍ RẤT MẠNH.**  
Các LLM (AI) như Vibecode, GitHub Copilot hay Gemini vô cùng xuất sắc trong việc hỗ trợ sinh Unit Test. Bản chất của Unit Test là một bộ khung chuẩn mực (`Arrange -> Act -> Assert`). 
AI có khả năng đọc hiểu luồng Code logic (điều kiện rẽ nhánh, các throw error) cực tốt để từ đó nó tự động sinh ra các đoạn code **Mocking** (thứ làm bằng tay rất mất thời gian). Lập trình viên thay vì ngồi gõ chay hàng nghìn dòng mock data, sẽ đóng vai trò như một người "Tổng đạo diễn" — chỉ đạo AI sinh test case cho đủ luồng (Happy path, Sad path, Edge case).

---

### Câu hỏi 4: Chứng minh chất lượng Unit Test do AI sinh ra
**Giảng viên hỏi:** Dựa vào đâu để sinh? Làm thế nào để xác định được Unit Test sinh bởi Vibecode là chất lượng? Trả lời + minh chứng để sau này show cho giảng viên thấy!

**Trả lời để bảo vệ đồ án:**
Thưa thầy/cô, AI dựa vào 3 nguồn ngữ cảnh để sinh Test: 
1. Source code gốc của Class/Hàm.
2. Cấu trúc Dependencies (Các layer như DB Repository, Helpers).
3. Tài liệu Business Rules mà dev yêu cầu.

Để chứng minh chất lượng (rằng sinh viên hiểu chứ không phải cho AI chạy bừa cho có lệ), nhóm áp dụng **4 Phương pháp Mạng lưới đo lường (Metrics) làm Minh chứng sống**:

#### Minh chứng 1: Bảng Báo Cáo Code Coverage (Độ bao phủ)
Chất lượng test nằm ở chỗ có quét "sạch" các luồng trong hàm không. Nhóm sử dụng công cụ Jest Coverage (chạy `jest --coverage`).
-> **Show kết quả:** Xuất ra báo cáo dạng bảng HTML/Terminal chứng minh tỷ lệ % Statements (câu lệnh), % Branches (rẽ nhánh if/else) đều đạt tiêu chuẩn công nghiệp (thường >70-80%). Điều này chứng minh AI không bỏ sót bất kỳ một ngóc ngách `if/else` nào.

#### Minh chứng 2: Soi trực quan vào hàm Assertions (Xác nhận KQ)
Một AI/Sinh viên đối phó thường viết test kiểu `expect(true).toBe(true)` để luôn vạch xanh (Pass ảo).
-> **Show kết quả:** Mở một file test do AI sinh lên cho thầy cô thấy cụm: `expect(result.data).toEqual(mockData)`. Nghĩa là Test đang đi kiểm định logic nghiệp vụ DỮ LIỆU thật, chứ không phải đi test cho xong chuyện.

#### Minh chứng 3: Bao phủ Cấm mập mờ (Negative & Exception Testing)
Kiểm thử code đúng thì ai cũng làm được. Kiểm thử hệ thống gãy vỡ như thế nào mới khẳng định được năng lực.
-> **Show kết quả:** Show cho giảng viên các file Test mà dòng code là `expect(...).rejects.toThrow(NotFoundException)`. Chứng tỏ AI đã lường trước đường lùi của hệ thống báo lỗi 404/400. Nhóm phải kiểm duyệt mới dám để luồng này lại.

#### Minh chứng 4 (Tuyệt chiêu): Mutation Testing (Kiểm thử đột biến trực tiếp)
Phương pháp uy tín nhất để bảo vệ trước hội đồng là "Chơi chiêu trực tiếp".
-> **Show kết quả:** Em sẽ đứng trực tiếp trước màn hình, mở file code gốc của nhóm lên. Em cố tình sửa sai 1 logic nghiệp vụ (Ví dụ sửa điều kiện code từ `<` thành `>`). 
Sau đó em chạy lại lệnh run Test. Ngay tức khắc, Terminal đỏ rực bắn lỗi `FAIL` vì một file Test đã báo "Ê luồng dữ liệu bị sai logic rồi nè!". 
=> **Kết luận:** Bộ Test do AI viết (dưới sự kiểm duyệt của người) THỰC SỰ đóng vai trò là Lưới An Toàn bảo vệ mã nguồn, chứ không phải chỉ là những file test sáo rỗng.
