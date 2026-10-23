/**
 * DỊCH VỤ GỌI REST API (MOCKAPI SERVICE)
 * Bắt buộc: Tên bảng (resource) và TẤT CẢ các trường dữ liệu đều có tiền tố BIT240060_
 */
import { TABLE_NAMES, DEFAULT_MOCKAPI_BASE_URL, MSSV } from '../constants/config';
import { storageService } from './storageService';

// Thời gian chờ tối đa cho mỗi request (timeout 8000ms)
const REQUEST_TIMEOUT = 8000;

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Hết thời gian chờ kết nối MockAPI (>8s). Dữ liệu được lưu ngoại tuyến an toàn.');
    }
    throw new Error(`Không thể kết nối MockAPI (${error.message || 'Lỗi mạng'}). Đang hoạt động ở chế độ Ngoại tuyến.`);
  }
};

export const apiService = {
  async getBaseUrl() {
    return await storageService.getMockApiUrl(DEFAULT_MOCKAPI_BASE_URL);
  },

  /**
   * Chuẩn hóa URL cho endpoint BIT240060_Dish
   * Xử lý trường hợp URL truyền vào là:
   * - https://6ad73db595e98f36aef21ac0.mockapi.io
   * - https://6ad73db595e98f36aef21ac0.mockapi.io/
   * - https://6ad73db595e98f36aef21ac0.mockapi.io/BIT240060_Dish
   */
  async getDishEndpointUrl() {
    let base = (await this.getBaseUrl()).trim();
    // Bỏ dấu gạch chéo cuối nếu có
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    // Nếu URL đã chứa sẵn /BIT240060_Dish thì dùng luôn
    if (base.endsWith(TABLE_NAMES.DISH)) {
      return base;
    }
    return `${base}/${TABLE_NAMES.DISH}`;
  },

  // ==========================================
  // DISH API (Endpoint: /BIT240060_Dish)
  // ==========================================

  formatHttpError(status, actionName) {
    if (status === 404) {
      return `[MockAPI HTTP 404] Endpoint "${actionName}" hoặc bản ghi không tồn tại trên máy chủ.`;
    }
    if (status === 429) {
      return `[MockAPI HTTP 429] Quá số lượt yêu cầu cho phép (Rate Limited). Vui lòng thử lại sau giây lát.`;
    }
    if (status >= 500) {
      return `[MockAPI HTTP ${status}] Máy chủ MockAPI đang gặp sự cố nội bộ.`;
    }
    return `[MockAPI HTTP ${status}] Thao tác ${actionName} không thành công.`;
  },

  /**
   * Lấy toàn bộ danh sách món ăn từ MockAPI
   */
  async getDishes() {
    const url = await this.getDishEndpointUrl();
    const res = await fetchWithTimeout(url, { method: 'GET' });
    if (!res.ok) {
      throw new Error(this.formatHttpError(res.status, 'Lấy danh sách món ăn'));
    }
    return await res.json();
  },

  /**
   * Tạo mới món ăn trên MockAPI
   * Đồng bộ tương thích cả schema có tiền tố BIT240060_ lẫn schema chuẩn
   */
  async createDish(dishData) {
    const url = await this.getDishEndpointUrl();

    // Loại bỏ Id tạm nếu có để MockAPI tự sinh ID mới duy nhất
    const raw = { ...dishData };
    delete raw.id;
    delete raw._id;
    delete raw[`${MSSV}_Id`];
    delete raw[`${MSSV}_id`];
    delete raw.BIT240060_Id;
    delete raw.BIT240060_id;
    delete raw.isQuick;
    delete raw.thumbnailUrl;

    const rawImages = raw[`${MSSV}_DishImage`] || raw.dishImage || raw.images || [];
    const normalizedImages = Array.isArray(rawImages)
      ? rawImages.map((img, idx) => {
          const imgUrl = img[`${MSSV}_ImageUrl`] || img.imageUrl || img.url || '';
          const isThumb = Boolean(img[`${MSSV}_IsThumbnail`] ?? img.isThumbnail ?? (idx === 0));
          return {
            [`${MSSV}_ImageUrl`]: imgUrl,
            imageUrl: imgUrl,
            [`${MSSV}_IsThumbnail`]: isThumb,
            isThumbnail: isThumb,
          };
        })
      : [];

    const payload = {
      ...raw,
      [`${MSSV}_Name`]: raw[`${MSSV}_Name`] || raw.name,
      name: raw[`${MSSV}_Name`] || raw.name,
      [`${MSSV}_Price`]: raw[`${MSSV}_Price`] ?? raw.price,
      price: raw[`${MSSV}_Price`] ?? raw.price,
      [`${MSSV}_PreparationTime`]: raw[`${MSSV}_PreparationTime`] ?? raw.preparationTime,
      preparationTime: raw[`${MSSV}_PreparationTime`] ?? raw.preparationTime,
      [`${MSSV}_IsAvailable`]: raw[`${MSSV}_IsAvailable`] ?? raw.isAvailable,
      isAvailable: raw[`${MSSV}_IsAvailable`] ?? raw.isAvailable,
      [`${MSSV}_Description`]: raw[`${MSSV}_Description`] || raw.description || '',
      description: raw[`${MSSV}_Description`] || raw.description || '',
      [`${MSSV}_DishCategoryId`]: raw[`${MSSV}_DishCategoryId`] || raw.dishCategoryId || raw.categoryId,
      dishCategoryId: raw[`${MSSV}_DishCategoryId`] || raw.dishCategoryId || raw.categoryId,
      categoryId: raw[`${MSSV}_DishCategoryId`] || raw.dishCategoryId || raw.categoryId,
      [`${MSSV}_DishImage`]: normalizedImages,
      dishImage: normalizedImages,
      images: normalizedImages,
    };

    const res = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(this.formatHttpError(res.status, 'Tạo món ăn'));
    }
    return await res.json();
  },

  /**
   * Cập nhật món ăn trên MockAPI
   */
  async updateDish(dishId, dishData) {
    const baseEndpoint = await this.getDishEndpointUrl();
    const cleanId = String(dishId).replace(/^dish_/, '');
    const url = `${baseEndpoint}/${cleanId}`;

    const raw = { ...dishData };
    delete raw.isQuick;
    delete raw.thumbnailUrl;

    const rawImages = raw[`${MSSV}_DishImage`] || raw.dishImage || raw.images || [];
    const normalizedImages = Array.isArray(rawImages)
      ? rawImages.map((img, idx) => {
          const imgUrl = img[`${MSSV}_ImageUrl`] || img.imageUrl || img.url || '';
          const isThumb = Boolean(img[`${MSSV}_IsThumbnail`] ?? img.isThumbnail ?? (idx === 0));
          return {
            [`${MSSV}_ImageUrl`]: imgUrl,
            imageUrl: imgUrl,
            [`${MSSV}_IsThumbnail`]: isThumb,
            isThumbnail: isThumb,
          };
        })
      : [];

    // Đảm bảo tương thích cả schema có tiền tố BIT240060_ lẫn schema chuẩn của MockAPI
    const payload = {
      ...raw,
      id: cleanId,
      [`${MSSV}_Id`]: cleanId,
      [`BIT240060_Id`]: cleanId,
      [`${MSSV}_Name`]: raw[`${MSSV}_Name`] || raw.name,
      name: raw[`${MSSV}_Name`] || raw.name,
      [`${MSSV}_Price`]: raw[`${MSSV}_Price`] ?? raw.price,
      price: raw[`${MSSV}_Price`] ?? raw.price,
      [`${MSSV}_PreparationTime`]: raw[`${MSSV}_PreparationTime`] ?? raw.preparationTime,
      preparationTime: raw[`${MSSV}_PreparationTime`] ?? raw.preparationTime,
      [`${MSSV}_IsAvailable`]: raw[`${MSSV}_IsAvailable`] ?? raw.isAvailable,
      isAvailable: raw[`${MSSV}_IsAvailable`] ?? raw.isAvailable,
      [`${MSSV}_Description`]: raw[`${MSSV}_Description`] || raw.description || '',
      description: raw[`${MSSV}_Description`] || raw.description || '',
      [`${MSSV}_DishCategoryId`]: raw[`${MSSV}_DishCategoryId`] || raw.dishCategoryId || raw.categoryId,
      dishCategoryId: raw[`${MSSV}_DishCategoryId`] || raw.dishCategoryId || raw.categoryId,
      categoryId: raw[`${MSSV}_DishCategoryId`] || raw.dishCategoryId || raw.categoryId,
      [`${MSSV}_DishImage`]: normalizedImages,
      dishImage: normalizedImages,
      images: normalizedImages,
    };

    const res = await fetchWithTimeout(url, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(this.formatHttpError(res.status, `Cập nhật món ID ${dishId}`));
    }
    return await res.json();
  },

  /**
   * Xóa món ăn trên MockAPI
   */
  async deleteDish(dishId) {
    const baseEndpoint = await this.getDishEndpointUrl();
    const cleanId = String(dishId).replace(/^dish_/, '');
    const url = `${baseEndpoint}/${cleanId}`;
    const res = await fetchWithTimeout(url, { method: 'DELETE' });

    // Nếu MockAPI trả về 404, bản ghi vốn dĩ không còn trên máy chủ -> Coi như đã xóa thành công
    if (res.status === 404) {
      return { id: cleanId, deleted: true, notFound: true };
    }

    if (!res.ok) {
      throw new Error(this.formatHttpError(res.status, `Xóa món ID ${dishId}`));
    }
    try {
      return await res.json();
    } catch (_) {
      return { id: cleanId, deleted: true };
    }
  },

  // ==========================================
  // CATEGORY API (Endpoint: /BIT240060_DishCategory)
  // Hỗ trợ cả trường hợp MockAPI miễn phí chỉ có 1 bảng Dish
  // ==========================================
  async getCategories() {
    try {
      const baseUrl = await this.getBaseUrl();
      const url = `${baseUrl}/${TABLE_NAMES.CATEGORY}`;
      const res = await fetchWithTimeout(url, { method: 'GET' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // MockAPI có thể chỉ tạo 1 endpoint Dish; fallback về local categories
      console.warn('[MockAPI] Category endpoint not available, using local cache:', e.message);
    }
    return null;
  },

  async createCategory(categoryData) {
    try {
      const baseUrl = await this.getBaseUrl();
      const url = `${baseUrl}/${TABLE_NAMES.CATEGORY}`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[MockAPI] Cannot post category to MockAPI:', e.message);
    }
    return categoryData;
  },
};
