/**
 * MODEL: BIT240060_Dish
 * Định nghĩa cấu trúc dữ liệu cho Món ăn theo yêu cầu đề thi
 */
import { MSSV, QUICK_PREP_TIME_THRESHOLD } from '../constants/config';
import { INITIAL_DISHES } from '../utils/mockData';

// Helper xử lý chuỗi an toàn

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
    const cleanId = String(BIT240060_Id || '');
    this[`${MSSV}_Id`] = cleanId;
    this[`${MSSV}_id`] = cleanId;
    this.BIT240060_Id = cleanId;
    this.BIT240060_id = cleanId;
    this.id = cleanId;

    const cleanName = String(BIT240060_Name || '').trim();
    this[`${MSSV}_Name`] = cleanName;
    this[`${MSSV}_name`] = cleanName;
    this.BIT240060_Name = cleanName;
    this.name = cleanName;

    const cleanPrice = Number(BIT240060_Price) || 0;
    this[`${MSSV}_Price`] = cleanPrice;
    this[`${MSSV}_price`] = cleanPrice;
    this.BIT240060_Price = cleanPrice;
    this.price = cleanPrice;

    const cleanPrep = parseInt(BIT240060_PreparationTime, 10) || 0;
    this[`${MSSV}_PreparationTime`] = cleanPrep;
    this[`${MSSV}_preparationTime`] = cleanPrep;
    this.BIT240060_PreparationTime = cleanPrep;
    this.preparationTime = cleanPrep;

    // Xử lý an toàn boolean: tránh lỗi Boolean("false") === true trong JS
    let isAvail = true;
    if (
      BIT240060_IsAvailable === false ||
      BIT240060_IsAvailable === 'false' ||
      BIT240060_IsAvailable === 0 ||
      BIT240060_IsAvailable === '0'
    ) {
      isAvail = false;
    }
    this[`${MSSV}_IsAvailable`] = isAvail;
    this[`${MSSV}_isAvailable`] = isAvail;
    this.BIT240060_IsAvailable = isAvail;
    this.isAvailable = isAvail;

    const cleanDesc = String(BIT240060_Description || '').trim();
    this[`${MSSV}_Description`] = cleanDesc;
    this[`${MSSV}_description`] = cleanDesc;
    this.BIT240060_Description = cleanDesc;
    this.description = cleanDesc;

    const cleanCat = String(BIT240060_DishCategoryId || '');
    this[`${MSSV}_DishCategoryId`] = cleanCat;
    this[`${MSSV}_dishCategoryId`] = cleanCat;
    this.BIT240060_DishCategoryId = cleanCat;
    this.dishCategoryId = cleanCat;
    this.categoryId = cleanCat;

    // Chuẩn hóa mảng DishImage: Mỗi phần tử gồm BIT240060_ImageUrl và BIT240060_IsThumbnail
    // Tối đa chỉ có 1 ảnh có IsThumbnail = true
    let hasThumbnail = false;
    const normalizedImages = Array.isArray(BIT240060_DishImage)
      ? BIT240060_DishImage.filter((img) => img && (img[`${MSSV}_ImageUrl`] || img.imageUrl || img.url || img.uri || img.BIT240060_ImageUrl)).map((img) => {
          const isThumb = Boolean(img[`${MSSV}_IsThumbnail`] || img.isThumbnail || img.BIT240060_IsThumbnail);
          const shouldBeThumb = isThumb && !hasThumbnail;
          if (shouldBeThumb) hasThumbnail = true;
          const urlStr = String(img[`${MSSV}_ImageUrl`] || img.imageUrl || img.url || img.uri || img.BIT240060_ImageUrl || '').trim();
          return {
            [`${MSSV}_ImageUrl`]: urlStr,
            [`${MSSV}_IsThumbnail`]: shouldBeThumb,
            BIT240060_ImageUrl: urlStr,
            BIT240060_IsThumbnail: shouldBeThumb,
            imageUrl: urlStr,
            isThumbnail: shouldBeThumb,
          };
        })
      : [];

    // Nếu có ít nhất 1 ảnh nhưng chưa có ảnh nào được set thumbnail, gán ảnh đầu tiên làm thumbnail
    if (!hasThumbnail && normalizedImages.length > 0) {
      normalizedImages[0][`${MSSV}_IsThumbnail`] = true;
      normalizedImages[0].isThumbnail = true;
      normalizedImages[0].BIT240060_IsThumbnail = true;
    }

    this[`${MSSV}_DishImage`] = normalizedImages;
    this[`${MSSV}_dishImage`] = normalizedImages;
    this.BIT240060_DishImage = normalizedImages;
    this.dishImage = normalizedImages;
    this.images = normalizedImages;

    // Computed
    this.isQuick = cleanPrep <= QUICK_PREP_TIME_THRESHOLD;

    // Thumbnail url
    const thumb = normalizedImages.find((img) => img[`${MSSV}_IsThumbnail`] || img.isThumbnail || img.BIT240060_IsThumbnail);
    if (thumb && (thumb[`${MSSV}_ImageUrl`] || thumb.imageUrl || thumb.BIT240060_ImageUrl)) {
      this.thumbnailUrl = thumb[`${MSSV}_ImageUrl`] || thumb.imageUrl || thumb.BIT240060_ImageUrl;
    } else if (normalizedImages.length > 0 && (normalizedImages[0][`${MSSV}_ImageUrl`] || normalizedImages[0].imageUrl || normalizedImages[0].BIT240060_ImageUrl)) {
      this.thumbnailUrl = normalizedImages[0][`${MSSV}_ImageUrl`] || normalizedImages[0].imageUrl || normalizedImages[0].BIT240060_ImageUrl;
    } else {
      this.thumbnailUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
    }
  }

  /**
   * Chuyển đổi thành plain object hoàn chỉnh để lưu trữ hoặc gửi lên API
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      preparationTime: this.preparationTime,
      isAvailable: this.isAvailable,
      description: this.description,
      dishCategoryId: this.categoryId,
      categoryId: this.categoryId,
      isQuick: this.isQuick,
      thumbnailUrl: this.thumbnailUrl,
      images: this.images,
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
    const rawId =
      json[`${MSSV}_Id`] ||
      json[`${MSSV}_id`] ||
      json.BIT240060_Id ||
      json.BIT240060_id ||
      json.id ||
      json._id ||
      '';
    const idVal = String(rawId);
    const cleanIdNumber = idVal.replace(/^dish_/, '');

    // Tìm template chuẩn tương ứng nếu có trong INITIAL_DISHES (để tự phục hồi lỗi phông/thiếu trường)
    const initialTemplate = Array.isArray(INITIAL_DISHES)
      ? INITIAL_DISHES.find((it) => {
          const itId = String(it.BIT240060_Id).replace(/^dish_/, '');
          return itId === cleanIdNumber;
        })
      : null;

    let nameVal =
      json[`${MSSV}_Name`] ||
      json[`${MSSV}_name`] ||
      json.BIT240060_Name ||
      json.BIT240060_name ||
      json.name ||
      '';

    // Chỉ tự động khôi phục nếu trường bị rỗng
    if (!nameVal.trim() && initialTemplate) {
      nameVal = initialTemplate.BIT240060_Name;
    }

    const priceVal =
      json[`${MSSV}_Price`] ??
      json[`${MSSV}_price`] ??
      json.BIT240060_Price ??
      json.price ??
      (initialTemplate ? initialTemplate.BIT240060_Price : 0);

    const prepVal =
      json[`${MSSV}_PreparationTime`] ??
      json[`${MSSV}_preparationTime`] ??
      json.BIT240060_PreparationTime ??
      json.preparationTime ??
      (initialTemplate ? initialTemplate.BIT240060_PreparationTime : 10);

    const availVal =
      json[`${MSSV}_IsAvailable`] ??
      json[`${MSSV}_isAvailable`] ??
      json.BIT240060_IsAvailable ??
      json.isAvailable ??
      (initialTemplate ? initialTemplate.BIT240060_IsAvailable : true);

    let descVal =
      json[`${MSSV}_Description`] ||
      json[`${MSSV}_description`] ||
      json.BIT240060_Description ||
      json.BIT240060_description ||
      json.description ||
      '';

    // Chỉ tự động khôi phục nếu mô tả bị rỗng
    if (!descVal.trim() && initialTemplate) {
      descVal = initialTemplate.BIT240060_Description;
    }

    let catVal =
      json[`${MSSV}_DishCategoryId`] ||
      json[`${MSSV}_dishCategoryId`] ||
      json.BIT240060_DishCategoryId ||
      json.BIT240060_dishCategoryId ||
      json.dishCategoryId ||
      json.categoryId ||
      '';

    if (!catVal && initialTemplate) {
      catVal = initialTemplate.BIT240060_DishCategoryId;
    }

    let imagesVal =
      json[`${MSSV}_DishImage`] ||
      json[`${MSSV}_dishImage`] ||
      json.BIT240060_DishImage ||
      json.dishImage ||
      json.images ||
      json.DishImage ||
      [];

    if ((!Array.isArray(imagesVal) || imagesVal.length === 0) && initialTemplate) {
      imagesVal = initialTemplate.BIT240060_DishImage;
    }

    return new DishModel({
      BIT240060_Id: idVal,
      BIT240060_Name: nameVal,
      BIT240060_Price: priceVal,
      BIT240060_PreparationTime: prepVal,
      BIT240060_IsAvailable: availVal,
      BIT240060_Description: descVal,
      BIT240060_DishCategoryId: catVal,
      BIT240060_DishImage: imagesVal,
    });
  }
}
