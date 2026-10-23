/**
 * CẤU HÌNH HỆ THỐNG VÀ TIỀN TỐ MSSV (BIT240060)
 * Bắt buộc theo yêu cầu đề thi:
 * - Tên project: BIT240060_FoodManager
 * - Tất cả tên bảng và thuộc tính đều bắt đầu bằng BIT240060_
 */

export const MSSV = 'BIT240060';
export const PROJECT_NAME = 'BIT240060_FoodManager';

// MockAPI Base URL của sinh viên BIT240060
export const DEFAULT_MOCKAPI_BASE_URL = 'https://6ad73db595e98f36aef21ac0.mockapi.io';

// Tên Endpoint / Table trên MockAPI
export const TABLE_NAMES = {
  DISH: `${MSSV}_Dish`,
  CATEGORY: `${MSSV}_DishCategory`,
};

// Định nghĩa chuẩn hóa tên các trường dữ liệu (Field Names) theo MSSV
export const DISH_FIELDS = {
  ID: `${MSSV}_Id`,
  NAME: `${MSSV}_Name`,
  PRICE: `${MSSV}_Price`,
  PREPARATION_TIME: `${MSSV}_PreparationTime`,
  IS_AVAILABLE: `${MSSV}_IsAvailable`,
  DESCRIPTION: `${MSSV}_Description`,
  CATEGORY_ID: `${MSSV}_DishCategoryId`,
  DISH_IMAGE: `${MSSV}_DishImage`,
  IMAGE_URL: `${MSSV}_ImageUrl`,
  IS_THUMBNAIL: `${MSSV}_IsThumbnail`,
};

export const CATEGORY_FIELDS = {
  ID: `${MSSV}_Id`,
  NAME: `${MSSV}_Name`,
  DESCRIPTION: `${MSSV}_Description`,
};

// Ngưỡng thời gian món nhanh (Quick dish threshold in minutes)
export const QUICK_PREP_TIME_THRESHOLD = 15;

// Khóa lưu trữ Local Storage (AsyncStorage)
export const STORAGE_KEYS = {
  DISHES: `@${MSSV}_dishes_local`,
  CATEGORIES: `@${MSSV}_categories_local`,
  SYNC_QUEUE: `@${MSSV}_sync_queue`,
  DELETED_DISHES: `@${MSSV}_deleted_dishes`,
  DELETED_NAME_CATS: `@${MSSV}_deleted_name_cats`,
  LANGUAGE: `@${MSSV}_language_setting`,
  FILTER_STATE: `@${MSSV}_filter_state`,
  MOCKAPI_URL: `@${MSSV}_mockapi_url`,
};
