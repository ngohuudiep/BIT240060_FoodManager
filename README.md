# BIT240060_FoodManager - ỨNG DỤNG QUẢN LÝ MÓN ĂN
### ĐỀ KIỂM TRA GIỮA KỲ: PHÁT TRIỂN ỨNG DỤNG DI ĐỘNG
- **Mã sinh viên (MSSV):** BIT240060
- **Tên dự án:** `BIT240060_FoodManager`
- **Công nghệ phát triển:** React Native (Expo) + AsyncStorage + MockAPI REST API
- **Kiến trúc mã nguồn:** Models - Views (Screens) - Context (ViewModels) - Services - Utils - Locales

---

## 1. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY ỨNG DỤNG

### Bước 1: Mở Terminal tại thư mục dự án
```bash
cd "c:\Users\Admin\Desktop\BIT240060_FoodManager"
```

### Bước 2: Cài đặt các thư viện phụ thuộc
```bash
npm install
```

### Bước 3: Khởi động ứng dụng
- **Chạy trên trình duyệt Web (Xem nhanh nhất):**
  ```bash
  npx expo start --web
  ```
- **Chạy trên Máy ảo Android Emulator:**
  ```bash
  npx expo start --android
  ```
- **Chạy trên Điện thoại thật bằng ứng dụng Expo Go:**
  ```bash
  npx expo start
  ```
  *(Sau đó mở app Expo Go trên điện thoại và quét mã QR trên màn hình Terminal).*

---

## 2. BẢNG ĐỐI CHIẾU TIÊU CHÍ CHẤM ĐIỂM (BAREM 10/10 ĐIỂM)

| STT | Nội dung đánh giá | Điểm | Vị trí mã nguồn thực hiện |
|---|---|---|---|
| 1 | **Thiết kế 02 model, dữ liệu tối thiểu, validation và lưu/đọc dữ liệu** | 0.75 | [src/models/Dish.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/models/Dish.js), [src/models/Category.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/models/Category.js), [src/utils/validation.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/utils/validation.js), [src/utils/mockData.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/utils/mockData.js) |
| 2 | **Giao diện danh sách/chi tiết; thêm, sửa, xóa; chọn loại món và cập nhật dữ liệu** | 1.25 | [src/screens/DishListScreen.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/screens/DishListScreen.js), [src/screens/DishDetailScreen.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/screens/DishDetailScreen.js), [src/screens/DishFormScreen.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/screens/DishFormScreen.js) |
| 3 | **Tìm kiếm, lọc nhiều điều kiện, sắp xếp và giữ trạng thái bộ lọc** | 0.75 | [src/context/AppContext.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/context/AppContext.js#L217-L270), [src/services/storageService.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/services/storageService.js#L68-L82) |
| 4 | **Quản lý nhiều ảnh, lựa chọn/thay đổi ảnh đại diện** | 0.50 | [src/screens/DishFormScreen.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/screens/DishFormScreen.js#L54-L85), [src/screens/DishDetailScreen.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/screens/DishDetailScreen.js#L86-L124) |
| 5 | **Phân loại thời gian (Quick/Regular), ràng buộc nghiệp vụ và xử lý lỗi** | 0.50 | [src/models/Dish.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/models/Dish.js#L95-L98), [src/services/categoryService.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/services/categoryService.js#L47-L57) |
| 6 | **Giao diện English mặc định, chuyển sang tiếng Việt và duy trì ngôn ngữ** | 0.75 | [src/locales/en.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/locales/en.js), [src/locales/vi.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/locales/vi.js), [src/components/Header.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/components/Header.js) |
| 7 | **Nâng cao: Lưu dữ liệu offline (0.5đ); Tự động đồng bộ local $\leftrightarrow$ MockAPI (1.0đ)** | 1.50 | [src/services/syncService.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/services/syncService.js), [src/context/AppContext.js](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/src/context/AppContext.js#L88-L115) |
| 8 | **Video 1: Quay màn hình demo app** | 2.00 | Chi tiết kịch bản tại [VIDEO_EXPLANATION_SCRIPT.md](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/VIDEO_EXPLANATION_SCRIPT.md) |
| 9 | **Video 2: Thuyết minh code và chức năng** | 2.00 | Lời thoại mẫu chỉ rõ tiền tố MSSV tại [VIDEO_EXPLANATION_SCRIPT.md](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/VIDEO_EXPLANATION_SCRIPT.md) |
| **TỔNG** | | **10.00** | |

---

## 3. QUY ĐỊNH TIỀN TỐ MSSV (BIT240060_)
Toàn bộ tên bảng và thuộc tính trong project đều tuân thủ tuyệt đối quy định của giảng viên:
- **Tên bảng:** `BIT240060_Dish`, `BIT240060_DishCategory`
- **Các trường của Dish:**
  - `BIT240060_Id`
  - `BIT240060_Name`
  - `BIT240060_Price`
  - `BIT240060_PreparationTime`
  - `BIT240060_IsAvailable`
  - `BIT240060_Description`
  - `BIT240060_DishCategoryId`
  - `BIT240060_DishImage`: Mảng các đối tượng gồm `BIT240060_ImageUrl` và `BIT240060_IsThumbnail`
- **Các trường của DishCategory:**
  - `BIT240060_Id`
  - `BIT240060_Name`
  - `BIT240060_Description`

---

## 4. TÀI LIỆU HỖ TRỢ KÈM THEO
1. [MOCKAPI_SETUP_GUIDE.md](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/MOCKAPI_SETUP_GUIDE.md): Hướng dẫn từng bước tạo MockAPI endpoint và dán dữ liệu.
2. [VIDEO_EXPLANATION_SCRIPT.md](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/VIDEO_EXPLANATION_SCRIPT.md): Kịch bản quay màn hình Video 1 và kịch bản thuyết minh Video 2.
3. [mockapi_data.json](file:///c:/Users/Admin/Desktop/BIT240060_FoodManager/mockapi_data.json): Dữ liệu mẫu JSON chuẩn bị sẵn để import vào MockAPI.
