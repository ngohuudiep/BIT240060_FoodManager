# HƯỚNG DẪN IMPORT DỮ LIỆU VÀO MOCKAPI
### Endpoint của bạn: `https://6ad73db595e98f36aef21ac0.mockapi.io/BIT240060_Dish`

---

## 1. Dán dữ liệu mẫu vào MockAPI
1. Mở trang quản lý MockAPI của bạn tại: [https://mockapi.io/](https://mockapi.io/)
2. Bấm vào tài nguyên **BIT240060_Dish**.
3. Bấm vào biểu tượng **Data** (dữ liệu).
4. Xóa dữ liệu cũ (nếu có) và dán toàn bộ mảng JSON dưới đây vào:

```json
[
  {
    "BIT240060_Id": "1",
    "BIT240060_Name": "Phở bò tái nạm đặc biệt",
    "BIT240060_Price": 65000,
    "BIT240060_PreparationTime": 12,
    "BIT240060_IsAvailable": true,
    "BIT240060_Description": "Phở bò gia truyền Hà Nội với nước dùng hầm xương 24h thơm lừng quế hồi thảo quả.",
    "BIT240060_DishCategoryId": "cat_1",
    "BIT240060_DishImage": [
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600",
        "BIT240060_IsThumbnail": true
      },
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=600",
        "BIT240060_IsThumbnail": false
      }
    ]
  },
  {
    "BIT240060_Id": "2",
    "BIT240060_Name": "Bò bít tết sốt tiêu đen",
    "BIT240060_Price": 145000,
    "BIT240060_PreparationTime": 25,
    "BIT240060_IsAvailable": true,
    "BIT240060_Description": "Thăn bò áp chảo vừa tới kèm khoai tây nghiền và sốt tiêu đen thượng hạng.",
    "BIT240060_DishCategoryId": "cat_1",
    "BIT240060_DishImage": [
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1558030006-450675393462?w=600",
        "BIT240060_IsThumbnail": true
      },
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
        "BIT240060_IsThumbnail": false
      }
    ]
  },
  {
    "BIT240060_Id": "3",
    "BIT240060_Name": "Gỏi cuốn tôm thịt Sài Gòn",
    "BIT240060_Price": 40000,
    "BIT240060_PreparationTime": 10,
    "BIT240060_IsAvailable": true,
    "BIT240060_Description": "Tôm tươi, thịt luộc, bún tươi và rau thơm cuốn trong bánh tráng dẻo chấm tương bơ đậu phộng.",
    "BIT240060_DishCategoryId": "cat_2",
    "BIT240060_DishImage": [
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600",
        "BIT240060_IsThumbnail": true
      },
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600",
        "BIT240060_IsThumbnail": false
      }
    ]
  },
  {
    "BIT240060_Id": "4",
    "BIT240060_Name": "Cánh gà chiên nước mắm tỏi ớt",
    "BIT240060_Price": 85000,
    "BIT240060_PreparationTime": 20,
    "BIT240060_IsAvailable": false,
    "BIT240060_Description": "Cánh gà chiên giòn rụm đảo đều nước mắm tỏi ớt đậm đà thơm ngậy (Đang ngừng bán để test lọc).",
    "BIT240060_DishCategoryId": "cat_2",
    "BIT240060_DishImage": [
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600",
        "BIT240060_IsThumbnail": true
      }
    ]
  },
  {
    "BIT240060_Id": "5",
    "BIT240060_Name": "Trà đào cam sả hạt chia",
    "BIT240060_Price": 35000,
    "BIT240060_PreparationTime": 7,
    "BIT240060_IsAvailable": true,
    "BIT240060_Description": "Trà hoa vàng ướp lạnh cùng miếng đào tươi giòn ngọt, tinh dầu cam sả thơm sảng khoái.",
    "BIT240060_DishCategoryId": "cat_3",
    "BIT240060_DishImage": [
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
        "BIT240060_IsThumbnail": true
      },
      {
        "BIT240060_ImageUrl": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600",
        "BIT240060_IsThumbnail": false
      }
    ]
  }
]
```
5. Bấm **Update** hoặc **Save**.

---

## 2. Kiểm tra trên ứng dụng
Mã nguồn ứng dụng đã được cấu hình sẵn endpoint:
`https://6ad73db595e98f36aef21ac0.mockapi.io/BIT240060_Dish`
Khi chạy app, ứng dụng sẽ tự động gọi trực tiếp endpoint này để lấy dữ liệu và đồng bộ hai chiều!
