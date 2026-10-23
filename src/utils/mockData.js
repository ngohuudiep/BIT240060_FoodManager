/**
 * DỮ LIỆU MẪU BAN ĐẦU THEO ĐÚNG TIỀN TỐ MSSV (BIT240060)
 * Yêu cầu:
 * - Tối thiểu 3 loại món ăn (BIT240060_DishCategory)
 * - Tối thiểu 5 món ăn (BIT240060_Dish)
 * - Có cả món Quick (<= 15p) và Regular (> 15p)
 * - Có món đang bán (true) và ngừng bán (false)
 * - Món có nhiều ảnh với đúng 1 ảnh là Thumbnail (IsThumbnail: true)
 */

export const INITIAL_CATEGORIES = [
  {
    BIT240060_Id: 'cat_1',
    BIT240060_Name: 'Món chính (Main Dishes)',
    BIT240060_Description: 'Các món ăn no truyền thống và hiện đại giàu dinh dưỡng',
  },
  {
    BIT240060_Id: 'cat_2',
    BIT240060_Name: 'Khai vị & Ăn nhẹ (Appetizers & Snacks)',
    BIT240060_Description: 'Món khai vị thơm ngon kích thích vị giác và đồ ăn vặt',
  },
  {
    BIT240060_Id: 'cat_3',
    BIT240060_Name: 'Tráng miệng & Đồ uống (Desserts & Drinks)',
    BIT240060_Description: 'Các món ngọt tráng miệng thanh mát cùng đồ uống đa dạng',
  },
];

export const INITIAL_DISHES = [
  {
    BIT240060_Id: '1',
    BIT240060_Name: 'Phở bò tái nạm đặc biệt',
    BIT240060_Price: 65000,
    BIT240060_PreparationTime: 12, // Quick (<= 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Phở bò gia truyền Hà Nội với nước dùng hầm xương 24h thơm lừng quế hồi thảo quả.',
    BIT240060_DishCategoryId: 'cat_1',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '2',
    BIT240060_Name: 'Bò bít tết sốt tiêu đen',
    BIT240060_Price: 145000,
    BIT240060_PreparationTime: 25, // Regular (> 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Thăn bò nhập khẩu áp chảo vừa tới kèm khoai tây nghiền và sốt tiêu đen thượng hạng.',
    BIT240060_DishCategoryId: 'cat_1',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '3',
    BIT240060_Name: 'Cơm tấm sườn bì chả Sài Gòn',
    BIT240060_Price: 55000,
    BIT240060_PreparationTime: 15, // Quick (<= 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Cơm tấm thơm hạt dẻo ăn kèm sườn nướng mỡ hành đậm đà, chả trứng và bì heo thái chỉ giòn rụm.',
    BIT240060_DishCategoryId: 'cat_1',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '4',
    BIT240060_Name: 'Bún chả Hà Nội nướng than hoa',
    BIT240060_Price: 60000,
    BIT240060_PreparationTime: 14, // Quick (<= 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Chả viên và chả miếng nướng xém cạnh thơm phức trên than hoa ăn cùng nước chấm đu đủ cà rốt chua ngọt.',
    BIT240060_DishCategoryId: 'cat_1',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '5',
    BIT240060_Name: 'Gỏi cuốn tôm thịt Sài Gòn',
    BIT240060_Price: 40000,
    BIT240060_PreparationTime: 10, // Quick (<= 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Tôm tươi, thịt luộc, bún tươi và rau thơm cuốn trong bánh tráng dẻo chấm tương bơ đậu phộng.',
    BIT240060_DishCategoryId: 'cat_2',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '6',
    BIT240060_Name: 'Cánh gà chiên nước mắm tỏi ớt',
    BIT240060_Price: 85000,
    BIT240060_PreparationTime: 20, // Regular (> 15p)
    BIT240060_IsAvailable: false, // Ngừng bán (để test bộ lọc trạng thái)
    BIT240060_Description: 'Cánh gà chiên giòn rụm đảo đều nước mắm tỏi ớt đậm đà thơm ngậy.',
    BIT240060_DishCategoryId: 'cat_2',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1527477321055-43615862e771?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '7',
    BIT240060_Name: 'Mực một nắng chiên giòn sốt me',
    BIT240060_Price: 95000,
    BIT240060_PreparationTime: 15, // Quick (<= 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Mực một nắng tươi ngọt tẩm bột chiên vàng rộm sốt me chua cay kích thích vị giác.',
    BIT240060_DishCategoryId: 'cat_2',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '8',
    BIT240060_Name: 'Trà đào cam sả hạt chia',
    BIT240060_Price: 35000,
    BIT240060_PreparationTime: 7, // Quick (<= 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Trà hoa vàng ướp lạnh cùng miếng đào tươi giòn ngọt, tinh dầu cam sả thơm sảng khoái.',
    BIT240060_DishCategoryId: 'cat_3',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '9',
    BIT240060_Name: 'Bánh mì thịt nướng đặc biệt',
    BIT240060_Price: 30000,
    BIT240060_PreparationTime: 8, // Quick (<= 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Bánh mì giòn rụm nhân thịt heo nướng than hoa thơm lừng, kèm đồ chua cà rốt củ cải và rau thơm tươi mát.',
    BIT240060_DishCategoryId: 'cat_2',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '10',
    BIT240060_Name: 'Súp cua bắp non hải sản',
    BIT240060_Price: 75000,
    BIT240060_PreparationTime: 20, // Regular (> 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Súp cua đồng đặc sệt nấu cùng bắp non tươi, thịt cua thật, trứng cút và nấm hương thơm bổ dưỡng.',
    BIT240060_DishCategoryId: 'cat_1',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240060_Id: '11',
    BIT240060_Name: 'Chè đậu đỏ bánh lọt nước dừa',
    BIT240060_Price: 25000,
    BIT240060_PreparationTime: 10, // Quick (<= 15p)
    BIT240060_IsAvailable: true,
    BIT240060_Description: 'Chè mát lạnh với đậu đỏ bùi bùi, bánh lọt xanh lá dứa dai dẻo chan nước cốt dừa béo ngậy đá bào mịn.',
    BIT240060_DishCategoryId: 'cat_3',
    BIT240060_DishImage: [
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
        BIT240060_IsThumbnail: true,
      },
      {
        BIT240060_ImageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
        BIT240060_IsThumbnail: false,
      },
    ],
  },
];

