/**
 * MODEL: BIT240060_Dish
 * Định nghĩa cấu trúc dữ liệu cho Món ăn theo yêu cầu đề thi
 */
import { MSSV, QUICK_PREP_TIME_THRESHOLD } from '../constants/config';

export class DishModel {
  constructor({
    BIT240060_Id = '',
    BIT240060_Name = '',
    BIT240060_Price = 0,
    BIT240060_PreparationTime = 0,
    BIT240060_IsAvailable = true,
    BIT240060_Description = '',
    BIT240060_DishCategoryId = '',
    BIT240060_DishImage = [],
  } = {}) {
    this[`${MSSV}_Id`] = String(BIT240060_Id || '');
    this[`${MSSV}_Name`] = String(BIT240060_Name || '').trim();
    this[`${MSSV}_Price`] = Number(BIT240060_Price) || 0;
    this[`${MSSV}_PreparationTime`] = parseInt(BIT240060_PreparationTime, 10) || 0;

    // Xử lý an toàn boolean: tránh lỗi Boolean("false") === true trong JS
    if (
      BIT240060_IsAvailable === false ||
      BIT240060_IsAvailable === 'false' ||
      BIT240060_IsAvailable === 0 ||
      BIT240060_IsAvailable === '0'
    ) {
      this[`${MSSV}_IsAvailable`] = false;
    } else {
      this[`${MSSV}_IsAvailable`] = true;
    }

    this[`${MSSV}_Description`] = String(BIT240060_Description || '').trim();
    this[`${MSSV}_DishCategoryId`] = String(BIT240060_DishCategoryId || '');

    // Chuẩn hóa mảng DishImage: Mỗi phần tử gồm BIT240060_ImageUrl và BIT240060_IsThumbnail
    // Tối đa chỉ có 1 ảnh có IsThumbnail = true
    let hasThumbnail = false;
    this[`${MSSV}_DishImage`] = Array.isArray(BIT240060_DishImage)
      ? BIT240060_DishImage.filter((img) => img && (img[`${MSSV}_ImageUrl`] || img.imageUrl || img.url)).map((img) => {
          const isThumb = Boolean(img[`${MSSV}_IsThumbnail`] || img.isThumbnail);
          const shouldBeThumb = isThumb && !hasThumbnail;
          if (shouldBeThumb) hasThumbnail = true;
          return {
            [`${MSSV}_ImageUrl`]: String(img[`${MSSV}_ImageUrl`] || img.imageUrl || img.url || '').trim(),
            [`${MSSV}_IsThumbnail`]: shouldBeThumb,
          };
        })
      : [];

    // Nếu có ít nhất 1 ảnh nhưng chưa có ảnh nào được set thumbnail, gán ảnh đầu tiên làm thumbnail
    if (!hasThumbnail && this[`${MSSV}_DishImage`].length > 0) {
      this[`${MSSV}_DishImage`][0][`${MSSV}_IsThumbnail`] = true;
    }
  }

  get id() {
    return this[`${MSSV}_Id`];
  }

  get name() {
    return this[`${MSSV}_Name`];
  }

  get price() {
    return this[`${MSSV}_Price`];
  }

  get preparationTime() {
    return this[`${MSSV}_PreparationTime`];
  }

  get isAvailable() {
    return this[`${MSSV}_IsAvailable`];
  }

  get description() {
    return this[`${MSSV}_Description`];
  }

  get categoryId() {
    return this[`${MSSV}_DishCategoryId`];
  }

  get images() {
    return this[`${MSSV}_DishImage`] || [];
  }

  /**
   * Lấy URL ảnh đại diện (Thumbnail)
   * Tìm ảnh có BIT240060_IsThumbnail = true; nếu không có trả về ảnh đầu tiên hoặc ảnh mặc định
   */
  get thumbnailUrl() {
    const thumb = this.images.find((img) => img[`${MSSV}_IsThumbnail`]);
    if (thumb && thumb[`${MSSV}_ImageUrl`]) {
      return thumb[`${MSSV}_ImageUrl`];
    }
    if (this.images.length > 0 && this.images[0][`${MSSV}_ImageUrl`]) {
      return this.images[0][`${MSSV}_ImageUrl`];
    }
    // Placeholder an toàn khi danh sách ảnh rỗng
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
  }

  /**
   * Kiểm tra điều kiện món ăn nhanh (Quick vs Regular)
   * PreparationTime <= 15 phút -> Quick (Nhanh), ngược lại là Regular (Thông thường)
   */
  get isQuick() {
    return this.preparationTime <= QUICK_PREP_TIME_THRESHOLD;
  }

  /**
   * Chuyển đổi thành plain object để lưu trữ hoặc gửi lên API
   */
  toJSON() {
    return {
      [`${MSSV}_Id`]: this[`${MSSV}_Id`],
      [`${MSSV}_Name`]: this[`${MSSV}_Name`],
      [`${MSSV}_Price`]: this[`${MSSV}_Price`],
      [`${MSSV}_PreparationTime`]: this[`${MSSV}_PreparationTime`],
      [`${MSSV}_IsAvailable`]: this[`${MSSV}_IsAvailable`],
      [`${MSSV}_Description`]: this[`${MSSV}_Description`],
      [`${MSSV}_DishCategoryId`]: this[`${MSSV}_DishCategoryId`],
      [`${MSSV}_DishImage`]: this[`${MSSV}_DishImage`],
    };
  }

  static fromJSON(json) {
    if (!json) return null;
    return new DishModel({
      BIT240060_Id: json[`${MSSV}_Id`] || json.id || json.BIT240060_Id,
      BIT240060_Name: json[`${MSSV}_Name`] || json.name || json.BIT240060_Name,
      BIT240060_Price: json[`${MSSV}_Price`] ?? json.price ?? json.BIT240060_Price,
      BIT240060_PreparationTime: json[`${MSSV}_PreparationTime`] ?? json.preparationTime ?? json.BIT240060_PreparationTime,
      BIT240060_IsAvailable: json[`${MSSV}_IsAvailable`] ?? json.isAvailable ?? json.BIT240060_IsAvailable ?? true,
      BIT240060_Description: json[`${MSSV}_Description`] || json.description || json.BIT240060_Description,
      BIT240060_DishCategoryId: json[`${MSSV}_DishCategoryId`] || json.dishCategoryId || json.BIT240060_DishCategoryId,
      BIT240060_DishImage: json[`${MSSV}_DishImage`] || json.dishImage || json.BIT240060_DishImage || [],
    });
  }
}
