# C. THIẾT KẾ CHI TIẾT

## I. CƠ SỞ DỮ LIỆU

### 1. Mô hình thực thể - quan hệ (ERD)

#### 1.1. Sơ đồ ERD

Mô hình dữ liệu hiện tại của hệ thống được thiết kế theo định hướng cân bằng giữa ba yêu cầu: (i) đáp ứng đầy đủ nghiệp vụ cốt lõi của phiên bản MVP, (ii) đảm bảo tính toàn vẹn dữ liệu trong quá trình vận hành thực tế, và (iii) duy trì khả năng mở rộng cho các pha phát triển tiếp theo. Tại thời điểm hiện tại, cơ sở dữ liệu gồm **13 thực thể**, với tổng cộng **132 trường dữ liệu**, **11 kiểu enum** và **21 chỉ mục** (trong đó có **6 chỉ mục tổng hợp**).

Về cấu trúc nghiệp vụ, `User` đóng vai trò thực thể lõi, quản lý tập trung danh tính và xác thực cho ba nhóm người dùng: quản trị viên, chủ cửa hàng và khách du lịch. Thay vì tách ba bảng tài khoản độc lập, hệ thống sử dụng một bảng người dùng hợp nhất kết hợp với cơ chế phân vai trò bằng enum. Cách tiếp cận này giúp đơn giản hóa toàn bộ luồng xác thực (đăng nhập, cấp quyền, kiểm tra quyền truy cập), đồng thời giảm chi phí bảo trì ở tầng ứng dụng.

Dữ liệu đặc thù theo vai trò được tách sang hai bảng mở rộng `ShopOwner` và `TouristUser` theo quan hệ 1:1 với `User`. Thiết kế này tránh phát sinh nhiều cột rỗng trong bảng người dùng chung, đồng thời vẫn giữ được khả năng truy vấn trực tiếp và rõ ràng theo từng loại hồ sơ. Đối với miền nội dung, `Poi` là thực thể trung tâm của hệ thống, liên kết với các thành phần liên quan như `PoiMedia`, `Favorite`, `ViewHistory`, `TriggerLog`, và tập hợp vào `Tour` thông qua bảng trung gian `TourPoi`.

Đáng chú ý, bảng `TourPoi` không chỉ đóng vai trò liên kết N:M cơ bản giữa tour và điểm tham quan, mà còn chứa tập metadata phục vụ kịch bản tour tùy biến, bao gồm tiêu đề thay thế, mô tả theo ngữ cảnh, thời gian lưu lại đề xuất, ghi chú chuyển tiếp và quy tắc mở khóa điểm dừng. Quyết định này cho phép hệ thống biểu diễn các hành trình có mức độ linh hoạt cao mà vẫn giữ được tính nhất quán về dữ liệu.

Ở khía cạnh đa ngôn ngữ, mô hình hiện tại kết hợp hai lớp: nội dung song ngữ lưu trực tiếp trên thực thể nghiệp vụ (`nameVi/nameEn`, `descriptionVi/descriptionEn`) để tối ưu truy vấn ở MVP, và danh mục cấu hình ngôn ngữ `SupportedLanguage` để mở rộng năng lực dịch thuật, TTS và lựa chọn ngôn ngữ hiển thị trong tương lai.

Tóm lược các thực thể chính trong mô hình ERD như sau:

| Thực thể | Số trường | Quan hệ chính | Vai trò trong mô hình |
|---|---:|---|---|
| User | 13 | 1:1 với ShopOwner/TouristUser; 1:N với Poi, Tour | Quản lý danh tính, xác thực và phân quyền tập trung |
| ShopOwner | 9 | 1:1 với User | Thông tin mở rộng dành cho chủ cửa hàng |
| TouristUser | 10 | 1:1 với User; 1:N với Favorite, ViewHistory | Thông tin mở rộng và tùy chọn hành vi của du khách |
| Poi | 16 | Liên kết đến User, PoiMedia, TourPoi, Favorite, ViewHistory, TriggerLog | Thực thể nội dung trung tâm của hệ thống |
| PoiMedia | 13 | N:1 với Poi | Quản lý tài nguyên ảnh/âm thanh theo từng POI |
| Tour | 12 | N:1 với User; N:M với Poi qua TourPoi | Tập hợp POI thành lộ trình tham quan |
| TourPoi | 13 | N:1 với Tour và Poi | Liên kết tour-điểm dừng kèm metadata tùy biến |
| Favorite | 4 | N:1 với TouristUser và Poi | Danh sách POI yêu thích của du khách |
| ViewHistory | 6 | N:1 với TouristUser và Poi | Lịch sử truy cập POI của người dùng đã đăng nhập |
| TriggerLog | 9 | N:1 với Poi | Nhật ký kích hoạt nội dung toàn hệ thống (kể cả anonymous) |
| PasswordResetToken | 6 | N:1 với User | Quản lý token đặt lại mật khẩu một lần |
| RevokedToken | 7 | N:1 với User | Theo dõi token JWT đã thu hồi |
| SupportedLanguage | 14 | Độc lập | Cấu hình năng lực ngôn ngữ, TTS và fallback |

#### 1.2. Các quyết định thiết kế trọng yếu

Về phương diện kiến trúc dữ liệu, nhóm triển khai lựa chọn mô hình **Unified User** nhằm gom điểm quản trị danh tính về một nơi duy nhất. Quyết định này giúp giảm độ phức tạp ở cả tầng API lẫn tầng phân quyền, vì toàn bộ quy tắc xác thực có thể tái sử dụng trên một nguồn dữ liệu thống nhất. Các thông tin nghiệp vụ chuyên biệt theo vai trò được tách sang bảng mở rộng theo quan hệ 1:1, từ đó vẫn đảm bảo tính chuẩn hóa của lược đồ.

Đối với vòng đời dữ liệu nghiệp vụ, hệ thống áp dụng **soft delete** cho `Poi` và `Tour` thông qua trường `deletedAt`. Cách tiếp cận này giữ nguyên khả năng truy vết lịch sử tương tác, đặc biệt trong các bảng phân tích hành vi như `ViewHistory` và `TriggerLog`. Trong khi đó, đối tượng `User` sử dụng trạng thái hoạt động (`ACTIVE`, `INACTIVE`, `LOCKED`) thay cho xóa mềm để phù hợp với yêu cầu kiểm soát truy cập và an toàn tài khoản.

Ở góc độ nhận diện định danh, toàn bộ khóa chính sử dụng **UUID v4** thay vì số tự tăng. Lựa chọn này hạn chế nguy cơ suy đoán ID, đồng thời phù hợp với kịch bản mở rộng theo mô hình dịch vụ phân tán sau này.

Cuối cùng, mô hình hiện tại thể hiện rõ định hướng “MVP trước, mở rộng sau”: nội dung song ngữ được lưu trực tiếp để đảm bảo hiệu năng truy vấn và đơn giản hóa triển khai, trong khi phần đa ngôn ngữ nâng cao được chuẩn bị thông qua bảng `SupportedLanguage` và pipeline translation/TTS.

---

### 2. Cơ sở dữ liệu mức logic

#### 2.1. Tổng quan mô hình logic

Ở mức logic, cơ sở dữ liệu được tổ chức theo ba nhóm chức năng chính. Nhóm thứ nhất là **quản lý danh tính và bảo mật**, bao gồm `User`, `PasswordResetToken`, `RevokedToken` và hai bảng hồ sơ mở rộng theo vai trò. Nhóm thứ hai là **quản lý nội dung và hành trình**, bao gồm `Poi`, `PoiMedia`, `Tour`, `TourPoi`. Nhóm thứ ba là **theo dõi hành vi người dùng**, bao gồm `Favorite`, `ViewHistory`, `TriggerLog`, cùng `SupportedLanguage` như một danh mục cấu hình hệ thống.

Mối liên hệ giữa các bảng được thiết kế theo hướng phản ánh trực tiếp quan hệ nghiệp vụ. Quan hệ 1:1 được sử dụng khi dữ liệu mở rộng bắt buộc gắn với một thực thể lõi duy nhất; quan hệ 1:N được sử dụng cho các luồng phát sinh bản ghi theo thời gian; và quan hệ N:M được chuẩn hóa thông qua bảng trung gian để hỗ trợ mở rộng thuộc tính liên kết.

#### 2.2. Mô tả các thực thể mức logic

**Bảng User** lưu thông tin tài khoản nền tảng, bao gồm email đăng nhập duy nhất, mật khẩu đã băm, vai trò người dùng, trạng thái tài khoản, và các thông tin phục vụ kiểm soát đăng nhập thất bại. Đây là điểm bắt đầu của hầu hết các nghiệp vụ xác thực và phân quyền.

**Bảng ShopOwner** và **TouristUser** là hai bảng hồ sơ mở rộng theo vai trò. `ShopOwner` lưu thông tin phục vụ vận hành cửa hàng (tên cửa hàng, số điện thoại, giờ mở cửa), trong khi `TouristUser` lưu các tùy chọn trải nghiệm của khách du lịch (ngôn ngữ ưu tiên, tự động phát âm thanh, thông tin push).

**Bảng Poi** biểu diễn điểm tham quan/địa điểm, bao gồm tên và mô tả song ngữ, tọa độ địa lý, bán kính kích hoạt, phân loại, trạng thái và thông tin sở hữu. Bảng này có quan hệ đến hầu hết thành phần nghiệp vụ khác, do đó đóng vai trò trục dữ liệu của hệ thống.

**Bảng PoiMedia** chuẩn hóa việc quản lý tệp media theo từng POI, cho phép hệ thống lưu trữ và truy vấn hiệu quả theo loại nội dung, ngôn ngữ và thứ tự hiển thị.

**Bảng Tour** biểu diễn tuyến tham quan, còn **TourPoi** biểu diễn từng điểm dừng thuộc tuyến đó. Điểm quan trọng là `TourPoi` chứa thêm dữ liệu ngữ cảnh cho từng stop, giúp hành trình có thể cá nhân hóa mà không phá vỡ cấu trúc dữ liệu tổng thể.

**Bảng Favorite** và **ViewHistory** phục vụ theo dõi tương tác của người dùng đã đăng nhập; trong khi đó **TriggerLog** ghi nhận rộng hơn mọi sự kiện kích hoạt nội dung, kể cả khi chưa có phiên đăng nhập. Sự tách biệt này giúp phân biệt rõ dữ liệu hành vi cá nhân và dữ liệu phân tích hệ thống.

**Bảng PasswordResetToken** quản lý vòng đời token đặt lại mật khẩu (tạo, hết hạn, đã dùng), còn **RevokedToken** hỗ trợ cơ chế thu hồi JWT theo kiểu blacklist phía máy chủ.

**Bảng SupportedLanguage** cung cấp lớp cấu hình cho năng lực ngôn ngữ của hệ thống, bao gồm khả năng hỗ trợ văn bản/TTS, giọng mặc định, giọng dự phòng và mức ưu tiên hiển thị.

---

### 3. Cơ sở dữ liệu mức vật lý

#### 3.1. Thiết kế chỉ mục và tối ưu truy vấn

Ở mức vật lý, chiến lược chỉ mục tập trung vào các truy vấn có tần suất cao và ảnh hưởng trực tiếp đến trải nghiệm người dùng. Đối với luồng xác thực, chỉ mục duy nhất trên `users.email` rút ngắn thời gian định vị tài khoản đăng nhập. Với các truy vấn liên kết hồ sơ, chỉ mục duy nhất trên `shop_owners.userId` và `tourist_users.userId` đảm bảo truy vấn join 1:1 ổn định.

Trong miền nội dung, chỉ mục trên `pois.createdById` và `pois.ownerId` hỗ trợ lọc dữ liệu nhanh theo người tạo/chủ sở hữu, đặc biệt quan trọng với màn hình quản trị. Ở mức điều phối lộ trình, cặp ràng buộc duy nhất `tour_pois(tourId, poiId)` và `tour_pois(tourId, orderIndex)` đồng thời đảm bảo hai mục tiêu: không trùng POI trong cùng tour, và không trùng thứ tự điểm dừng.

Đối với an toàn phiên, chỉ mục duy nhất trên `revoked_tokens.tokenId` cho phép kiểm tra trạng thái thu hồi token với chi phí thấp trong mỗi request cần xác thực. Tương tự, `password_reset_tokens.token` được đánh chỉ mục duy nhất nhằm đảm bảo hiệu năng và độ chính xác cho luồng đặt lại mật khẩu.

#### 3.2. Chiến lược soft delete và toàn vẹn dữ liệu

Hệ thống áp dụng xóa mềm cho các thực thể nội dung (`Poi`, `Tour`) bằng cách ghi nhận thời điểm xóa vào `deletedAt` thay vì xóa vật lý bản ghi. Về mặt triển khai, mọi truy vấn nghiệp vụ mặc định đều loại trừ bản ghi đã xóa mềm. Cách làm này cho phép duy trì toàn vẹn tham chiếu từ các bảng lịch sử và phân tích, đồng thời tạo điều kiện phục hồi dữ liệu khi cần.

Ở chiều ngược lại, một số quan hệ được cấu hình xóa dây chuyền (`CASCADE`) có kiểm soát, chẳng hạn như các bảng token bảo mật hoặc hồ sơ mở rộng theo người dùng. Việc phối hợp giữa soft delete và cascade delete giúp hệ thống cân bằng giữa yêu cầu lưu vết lịch sử và yêu cầu vệ sinh dữ liệu phụ trợ.

#### 3.3. Ước lượng dữ liệu và năng lực vận hành MVP

Theo kịch bản triển khai MVP, hệ thống dự kiến phục vụ khoảng 100 tài khoản người dùng, 50 điểm tham quan, 5 tuyến tour và khoảng 200 bản ghi media liên quan. Ở lớp hành vi, `ViewHistory` ước tính đạt khoảng 5.000 bản ghi mỗi tháng và `TriggerLog` khoảng 10.000 bản ghi mỗi tháng. Dung lượng lưu trữ media giai đoạn đầu vào khoảng 2GB.

Các con số này cho thấy PostgreSQL ở cấu hình tiêu chuẩn có thể đáp ứng tốt nhu cầu hiện tại. Tuy nhiên, khi lưu lượng tăng theo mùa du lịch hoặc mở rộng phạm vi địa lý, cần chủ động chuẩn bị chính sách lưu trữ dài hạn cho bảng nhật ký hành vi.

#### 3.4. Backup, lưu trữ lịch sử và giám sát hiệu năng

Để đảm bảo an toàn dữ liệu, hệ thống cần duy trì cơ chế sao lưu toàn phần theo ngày, kết hợp khả năng phục hồi theo thời điểm (nếu hạ tầng cho phép). Đối với các bảng tăng trưởng nhanh như `TriggerLog` và `ViewHistory`, nên áp dụng chính sách archive theo chu kỳ tháng hoặc quý nhằm kiểm soát kích thước bảng hoạt động chính.

Về giám sát, nhóm vận hành cần theo dõi định kỳ các chỉ số như tốc độ tăng dữ liệu, tỷ lệ sử dụng chỉ mục, truy vấn chậm và độ trễ endpoint trọng yếu. Việc thực hiện `EXPLAIN ANALYZE` cho các truy vấn quan trọng (đăng nhập, danh sách POI, chi tiết tour, analytics) nên được đưa vào checklist vận hành định kỳ.

#### 3.5. Rủi ro kỹ thuật và hướng giảm thiểu

Rủi ro lớn nhất ở giai đoạn mở rộng là tốc độ tăng dữ liệu log hành vi có thể vượt dự báo ban đầu, kéo theo suy giảm hiệu năng truy vấn phân tích. Biện pháp giảm thiểu là áp dụng chiến lược phân vùng/archiving và kiểm soát phạm vi truy vấn theo thời gian.

Rủi ro thứ hai là độ phức tạp gia tăng của mô-đun đa ngôn ngữ khi số ngôn ngữ hỗ trợ tăng. Việc chuẩn hóa cấu hình trong `SupportedLanguage` ngay từ đầu giúp giảm chi phí kỹ thuật khi mở rộng.

Rủi ro thứ ba liên quan đến kích thước bảng thu hồi token trong cơ chế JWT blacklist. Cần xây dựng tác vụ dọn dẹp định kỳ theo `expiresAt`, đồng thời có thể cân nhắc bổ sung lớp cache trong pha tiếp theo để tối ưu kiểm tra token ở tần suất cao.

---

### 4. Tóm tắt luồng dữ liệu phục vụ phản biện

Trong luồng xác thực, người dùng đăng nhập qua bảng `User`, hệ thống phát hành access/refresh token; khi đăng xuất hoặc thu hồi phiên, token được ghi vào `RevokedToken` và được kiểm tra lại ở tầng bảo vệ API. Trong luồng trải nghiệm tham quan, ứng dụng tải danh sách điểm dừng từ `TourPoi` theo thứ tự, truy cập chi tiết từng `Poi`, đồng thời ghi nhận lịch sử cá nhân vào `ViewHistory` (nếu đã đăng nhập) và ghi nhận nhật ký sự kiện hệ thống vào `TriggerLog`.

Các luồng trên cho thấy thiết kế dữ liệu hiện tại không chỉ đáp ứng lưu trữ thông tin nghiệp vụ mà còn phục vụ trực tiếp cho giám sát vận hành, phân tích hành vi và mở rộng tính năng trong tương lai.
