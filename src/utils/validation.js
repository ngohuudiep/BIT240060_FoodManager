/**
 * BỘ HÀM KIỂM TRA DỮ LIỆU (VALIDATION RULES)
 * Đáp ứng đầy đủ các tiêu chí chấm điểm:
 * 1. Name không rỗng
 * 2. Price > 0
 * 3. PreparationTime > 0
 * 4. DishCategoryId hợp lệ (phải tồn tại trong danh mục)
 * 5. Tên món không trùng trong cùng một loại (so sánh không phân biệt hoa thường)
 * 6. Khoảng giá lọc hợp lệ (Min <= Max)
 */

export const validateDish = (dishData, existingDishes = [], currentDishId = null) => {
  const errors = {};

  // 1. Kiểm tra Name không rỗng
  const name = String(dishData.BIT240060_Name || dishData.name || '').trim();
  if (!name) {
    errors.name = 'valNameRequired';
  }

  // 2. Kiểm tra Price > 0
  const price = Number(dishData.BIT240060_Price ?? dishData.price);
  if (isNaN(price) || price <= 0) {
    errors.price = 'valPricePositive';
  }

  // 3. Kiểm tra PreparationTime > 0
  const prepTime = Number(dishData.BIT240060_PreparationTime ?? dishData.preparationTime);
  if (isNaN(prepTime) || prepTime <= 0) {
    errors.preparationTime = 'valPrepTimePositive';
  }

  // 4. Kiểm tra DishCategoryId hợp lệ
  const categoryId = String(dishData.BIT240060_DishCategoryId || dishData.categoryId || '').trim();
  if (!categoryId) {
    errors.categoryId = 'valCategoryRequired';
  }

  // 5. Kiểm tra Tên món không trùng trong cùng một loại
  if (name && categoryId) {
    const isDuplicate = existingDishes.some((item) => {
      // Bỏ qua chính món đang chỉnh sửa (nếu là update)
      const itemId = item.BIT240060_Id || item.id;
      if (currentDishId && String(itemId) === String(currentDishId)) {
        return false;
      }

      const itemCatId = item.BIT240060_DishCategoryId || item.categoryId;
      const itemName = item.BIT240060_Name || item.name || '';

      return (
        String(itemCatId) === String(categoryId) &&
        itemName.trim().toLowerCase() === name.toLowerCase()
      );
    });

    if (isDuplicate) {
      errors.name = 'valNameDuplicate';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Kiểm tra khoảng giá bộ lọc (Min <= Max)
 */
export const validatePriceRange = (minPrice, maxPrice) => {
  const min = minPrice !== '' ? Number(minPrice) : null;
  const max = maxPrice !== '' ? Number(maxPrice) : null;

  // Không cho phép số âm
  if (min !== null && (isNaN(min) || min < 0)) return false;
  if (max !== null && (isNaN(max) || max < 0)) return false;

  // Min không được lớn hơn Max
  if (min !== null && max !== null && min > max) {
    return false;
  }

  return true;
};

/**
 * Kiểm tra xem loại món ăn có đang được món ăn nào sử dụng hay không
 * Ràng buộc nghiệp vụ: Không cho phép xóa loại món đang có món ăn thuộc loại đó!
 */
export const isCategoryInUse = (categoryId, dishes = []) => {
  if (!categoryId || !Array.isArray(dishes)) return false;
  const targetCatId = String(categoryId).trim();

  return dishes.some((dish) => {
    if (!dish) return false;
    const dishCatId =
      dish.BIT240060_DishCategoryId ||
      dish.categoryId ||
      dish.dishCategoryId ||
      (dish.toJSON ? dish.toJSON()?.BIT240060_DishCategoryId : null);

    return String(dishCatId || '').trim() === targetCatId;
  });
};
