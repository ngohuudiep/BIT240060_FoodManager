# KỊCH BẢN QUAY VIDEO DEMO & THUYẾT MINH MÃ NGUỒN (4.0 ĐIỂM)
### Mã số sinh viên: **BIT240060**
### Tên Project: **BIT240060_FoodManager**
### Endpoint MockAPI: `https://6ad73db595e98f36aef21ac0.mockapi.io/BIT240060_Dish`
### Link Google Drive Video Demo: [https://drive.google.com/drive/folders/15J7kvIuClKN6LJzUzGhzjaTwfpIepHjN?usp=sharing](https://drive.google.com/drive/folders/15J7kvIuClKN6LJzUzGhzjaTwfpIepHjN?usp=sharing)

---

# VIDEO 1: QUAY MÀN HÌNH CHẠY DEMO ỨNG DỤNG (2.0 ĐIỂM)
> **Mục tiêu:** Chứng minh toàn bộ tính năng giao diện, CRUD, bộ lọc, đa ngôn ngữ và tính năng tự động đồng bộ khi offline hoạt động trơn tru.

### Các bước quay Video 1 (Thời lượng khuyến nghị: 3 - 5 phút):

1. **Giới thiệu đầu video:**
   - Mở màn hình ứng dụng: Chỉ rõ dòng chữ trên thanh Header: `BIT240060 | Food Manager` và tiêu đề ứng dụng.
   - Nói: *"Chào thầy/cô, em tên là sinh viên mang mã số BIT240060. Hôm nay em xin demo ứng dụng BIT240060_FoodManager cho bài kiểm tra giữa kỳ."*

2. **Demo Danh sách món ăn (Dish List) & Gắn thẻ thời gian:**
   - Cuộn danh sách hiển thị các món ăn: Chỉ ra huy hiệu `⏱ Quick (12 mins)` cho món có thời gian chế biến <= 15 phút và `⏱ Regular (25 mins)` cho món > 15 phút.
   - Chỉ ra trạng thái kinh doanh: `Đang bán (Available)` màu xanh và `Ngừng bán (Unavailable)` màu đỏ.

3. **Demo Tìm kiếm, Bộ lọc đa điều kiện & Sắp xếp:**
   - Nhập vào ô tìm kiếm: Gõ chữ `Phở` -> Danh sách lập tức hiển thị Phở bò. Xóa tìm kiếm.
   - Bấm mở **Bộ lọc (Filter & Search)**:
     - Chọn Loại món: `Món chính` -> Chỉ hiện các món chính.
     - Chọn Trạng thái: `Đang bán (Available only)` -> Món ngừng bán biến mất.
     - Nhập khoảng giá: Từ `40000` đến `100000` -> Kết hợp cả 3 điều kiện cùng lúc.
     - Chọn sắp xếp: `Giá: Tăng dần` hoặc `Thời gian chế biến: Nhanh nhất`.
     - Nhấn nút **Đặt lại bộ lọc (Reset)** để quay về danh sách đầy đủ.

4. **Demo Xem chi tiết món ăn (Detail) & Quản lý nhiều ảnh:**
   - Bấm vào một món ăn (ví dụ: *Phở bò tái nạm đặc biệt*).
   - Xem bộ sưu tập ảnh (Image Gallery): Bấm vào từng ảnh thu nhỏ để xem ảnh lớn thay đổi.
   - Chỉ ra huy hiệu `★ Ảnh đại diện (Thumbnail)`.

5. **Demo Thêm mới món ăn (Create) & Ràng buộc Validation:**
   - Bấm nút **"+ Thêm món ăn mới"**.
   - Bấm **Lưu** ngay khi chưa nhập gì: Ứng dụng báo lỗi đỏ:
     - Tên không rỗng.
     - Giá phải > 0.
     - Thời gian chế biến phải > 0.
   - Nhập tên trùng với một món đã có trong cùng loại: Ứng dụng báo lỗi: *"Tên món ăn đã tồn tại trong cùng loại món này!"*.
   - Nhập dữ liệu hợp lệ:
     - Tên: `Nem rán Hà Nội`
     - Loại: `Khai vị & Ăn nhẹ`
     - Giá: `50000`
     - Thời gian: `14` (sẽ được gắn thẻ Quick)
     - Dán 1 link ảnh và bấm **Đặt làm ảnh đại diện**.
   - Bấm **Lưu**: Món mới xuất hiện ngay trên danh sách.

6. **Demo Chỉnh sửa (Edit) & Đổi ảnh đại diện:**
   - Bấm nút Sửa món vừa tạo: Thay đổi giá hoặc thời gian chế biến, đổi ảnh thumbnail.
   - Bấm Lưu: Dữ liệu cập nhật ngay lập tức.

7. **Demo Xóa món ăn (Delete) với Popup xác nhận:**
   - Bấm nút Xóa: Modal popup hiện lên hỏi: *"Bạn có chắc chắn muốn xóa món..."*
   - Bấm Hủy -> Món không bị xóa.
   - Bấm Xóa lại -> Bấm Xác nhận -> Món biến mất khỏi danh sách.

8. **Demo Đa ngôn ngữ (English <-> Tiếng Việt):**
   - Bấm nút chuyển ngôn ngữ góc trên bên phải Header `[🇻🇳 VI] / [🇺🇸 EN]`.
   - Quan sát toàn bộ giao diện: Tên nút bấm, nhãn trường, trạng thái Quick/Regular, bộ lọc và thông báo chuyển sang Tiếng Việt.
   - Bấm chuyển qua lại giữa các màn hình chi tiết, thêm mới: Ngôn ngữ vẫn được duy trì nguyên vẹn.

9. **Demo Tính năng NÂNG CAO: Mất mạng (Offline) -> Tự động đồng bộ lên MockAPI (1.5 điểm):**
   - **Bước 1:** Tắt kết nối Wi-Fi/Internet trên máy (hoặc bật Airplane mode trên điện thoại).
   - Thanh trạng thái lập tức chuyển sang: `🔴 Ngoại tuyến (Offline)`.
   - **Bước 2:** Thực hiện Thêm 1 món mới (ví dụ: `Cơm rang dưa bò`, Giá `60000`, Thời gian `15`) khi không có mạng.
   - Món ăn được lưu ngay vào bộ nhớ máy, thanh trạng thái báo: `🟡 1 thay đổi chờ đồng bộ`.
   - **Bước 3:** Bật kết nối Wi-Fi/Internet trở lại.
   - **Quan sát kết quả:** Ứng dụng tự động kích hoạt tiến trình ngầm, icon xoay và chuyển sang `🟢 Đã đồng bộ toàn bộ` mà **KHÔNG CẦN BẤM NÚT ĐỒNG BỘ NÀO**.
   - Mở trình duyệt web MockAPI: Refresh trang web để chứng minh bản ghi mới đã được POST lên MockAPI thành công!

---

# VIDEO 2: THUYẾT MINH MÃ NGUỒN VÀ CHỨC NĂNG ỨNG DỤNG (2.0 ĐIỂM)

#### Phần 1: Giới thiệu cấu trúc Project và Tiền tố MSSV (BIT240060)
- Mở file package.json và app.json: Em sử dụng React Native Expo, tên project BIT240060_FoodManager.
- Mở file src/constants/config.js:
  - MSSV: `BIT240060`
  - MockAPI endpoint: `https://6ad73db595e98f36aef21ac0.mockapi.io/BIT240060_Dish`
  - Các trường dữ liệu: `BIT240060_Id`, `BIT240060_Name`, `BIT240060_Price`, `BIT240060_PreparationTime`, `BIT240060_IsAvailable`, `BIT240060_Description`, `BIT240060_DishCategoryId`, `BIT240060_DishImage`.

#### Phần 2: Thuyết minh Data Models
- Mở file src/models/Dish.js:
  - Chỉ rõ constructor nhận các field có tiền tố `BIT240060_`.
  - Getter `thumbnailUrl`: Tìm ảnh có `BIT240060_IsThumbnail === true`.
  - Getter `isQuick`: So sánh `preparationTime <= 15` phút.

#### Phần 3: Thuyết minh Validation & Ràng buộc nghiệp vụ
- Mở file src/utils/validation.js:
  - Name không rỗng, Price > 0, PrepTime > 0, Category hợp lệ.
  - Không trùng tên món trong cùng 1 loại (so sánh không phân biệt hoa thường).
  - Không cho phép xóa loại món đang có món ăn sử dụng.

#### Phần 4: Thuyết minh Đa ngôn ngữ (i18n)
- Mở thư mục src/locales/ (en.js, vi.js):
  - English là mặc định, chuyển sang Tiếng Việt và lưu giữ khi chuyển màn hình qua AsyncStorage.

#### Phần 5: Thuyết minh Tính năng Nâng cao (Offline & Tự động đồng bộ MockAPI)
- Mở file src/services/syncService.js:
  - Khi offline: Lưu vào hàng đợi SyncQueue và AsyncStorage.
  - Khi online trở lại: Tự động chạy ngầm đẩy các thay đổi lên MockAPI.
  - Xử lý ánh xạ ID tạm sang ID thật từ MockAPI để chống trùng lặp bản ghi.
