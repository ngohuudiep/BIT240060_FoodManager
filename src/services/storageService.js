/**
 * DỊCH VỤ LƯU TRỮ CỤC BỘ (LOCAL STORAGE SERVICE)
 * Sử dụng AsyncStorage để lưu trữ tạm thời khi Offline và lưu State của ứng dụng.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { INITIAL_CATEGORIES, INITIAL_DISHES } from '../utils/mockData';

export const storageService = {
  // --- MÓN ĂN (DISHES) ---
  async getLocalDishes() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.DISHES);
      if (json) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Khởi tạo dữ liệu mẫu 8 món ban đầu nếu chưa có hoặc danh sách rỗng
      await this.saveLocalDishes(INITIAL_DISHES);
      return INITIAL_DISHES;
    } catch (e) {
      console.error('[Storage] Error reading local dishes:', e);
      return INITIAL_DISHES;
    }
  },

  async restoreDefaultDishes() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(INITIAL_DISHES));
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_DISHES, JSON.stringify([]));
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_NAME_CATS, JSON.stringify([]));
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
      await AsyncStorage.setItem(STORAGE_KEYS.FILTER_STATE, JSON.stringify(null));
      return INITIAL_DISHES;
    } catch (e) {
      console.error('[Storage] Error restoring default dishes:', e);
      return INITIAL_DISHES;
    }
  },

  async saveLocalDishes(dishes) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishes));
    } catch (e) {
      console.error('[Storage] Error saving local dishes:', e);
    }
  },

  /**
   * Dọn sạch dữ liệu cục bộ: xóa trùng lặp theo ID và theo Tên + Loại món
   */
  async cleanupLocalDishes() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.DISHES);
      if (!json) return;
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return;

      const seenIds = new Set();
      const seenNameCat = new Set();
      const cleaned = [];

      for (const item of parsed) {
        const idStr = String(item['BIT240060_Id'] || item['BIT240060_id'] || item.id || item._id || '').replace(/^dish_/, '');
        const rawName = String(item['BIT240060_Name'] || item['BIT240060_name'] || item.name || '').trim().toLowerCase();
        const rawCat = String(item['BIT240060_DishCategoryId'] || item['BIT240060_dishCategoryId'] || item.dishCategoryId || item.categoryId || '');
        const nameCatKey = rawName && rawCat ? `${rawName}__${rawCat}` : null;

        if (idStr && seenIds.has(idStr)) continue;
        if (nameCatKey && seenNameCat.has(nameCatKey)) continue;

        if (idStr) seenIds.add(idStr);
        if (nameCatKey) seenNameCat.add(nameCatKey);
        cleaned.push(item);
      }

      if (cleaned.length !== parsed.length) {
        console.log(`[Storage] Dọn xóa ${parsed.length - cleaned.length} món trùng lặp trong local cache.`);
        await AsyncStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(cleaned));
      }
    } catch (e) {
      console.error('[Storage] Error cleaning up local dishes:', e);
    }
  },


  // --- LOẠI MÓN ĂN (CATEGORIES) ---
  async getLocalCategories() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (json) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      await this.saveLocalCategories(INITIAL_CATEGORIES);
      return INITIAL_CATEGORIES;
    } catch (e) {
      console.error('[Storage] Error reading local categories:', e);
      return INITIAL_CATEGORIES;
    }
  },

  async saveLocalCategories(categories) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('[Storage] Error saving local categories:', e);
    }
  },

  // --- HÀNG ĐỢI ĐỒNG BỘ OFFLINE (SYNC QUEUE) ---
  async getSyncQueue() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error('[Storage] Error reading sync queue:', e);
      return [];
    }
  },

  async saveSyncQueue(queue) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('[Storage] Error saving sync queue:', e);
    }
  },

  async addToSyncQueue(actionItem) {
    try {
      const queue = await this.getSyncQueue();
      queue.push(actionItem);
      await this.saveSyncQueue(queue);
    } catch (e) {
      console.error('[Storage] Error adding to sync queue:', e);
    }
  },

  // --- DANH SÁCH MÓN ĐÃ XÓA (DELETED DISHES TRACKING) ---
  // Tránh việc khi kéo từ MockAPI về lại vô tình phục hồi món đã xóa
  // BLACKLIST_IDS: Các ID bị chặn vĩnh viễn (ví dụ: món rác 91đ do MockAPI auto-generate)
  _BLACKLISTED_IDS: ['7'],

  async getDeletedDishIds() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_DISHES);
      const savedList = json ? JSON.parse(json) : [];
      // Luôn bao gồm danh sách đen cố định để chặn các món rác từ MockAPI
      const combined = [...new Set([...this._BLACKLISTED_IDS, ...savedList])];
      return combined;
    } catch (e) {
      return [...this._BLACKLISTED_IDS];
    }
  },

  async addDeletedDishId(dishId) {
    if (!dishId) return;
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_DISHES);
      const list = json ? JSON.parse(json) : [];
      const sId = String(dishId);
      const cleanId = sId.replace(/^dish_/, '');
      let modified = false;

      if (!list.includes(sId)) {
        list.push(sId);
        modified = true;
      }
      if (cleanId && !list.includes(cleanId)) {
        list.push(cleanId);
        modified = true;
      }

      if (modified) {
        await AsyncStorage.setItem(STORAGE_KEYS.DELETED_DISHES, JSON.stringify(list));
      }
    } catch (e) {
      console.error('[Storage] Error adding deleted dish ID:', e);
    }
  },

  // Blacklist theo Tên+Loại món (để chặn bản trùng ID khác nhau từ MockAPI)
  async getDeletedDishNameCats() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.DELETED_NAME_CATS);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      return [];
    }
  },

  async addDeletedDishNameCat(nameLower, catId) {
    if (!nameLower || !catId) return;
    try {
      const list = await this.getDeletedDishNameCats();
      const key = `${nameLower}__${catId}`;
      if (!list.includes(key)) {
        list.push(key);
        await AsyncStorage.setItem(STORAGE_KEYS.DELETED_NAME_CATS, JSON.stringify(list));
      }
    } catch (e) {
      console.error('[Storage] Error adding deleted dish name+cat:', e);
    }
  },


  async removeDishFromSyncQueue(dishId) {
    if (!dishId) return;
    try {
      const queue = await this.getSyncQueue();
      const sId = String(dishId);
      const cleanId = sId.replace(/^dish_/, '');
      const filtered = queue.filter((item) => {
        const itemDishId = String(item.dishId || '');
        const itemTempId = String(item.tempId || '');
        if (itemDishId === sId || itemDishId.replace(/^dish_/, '') === cleanId) return false;
        if (itemTempId === sId || itemTempId.replace(/^dish_/, '') === cleanId) return false;
        return true;
      });
      await this.saveSyncQueue(filtered);
    } catch (e) {
      console.error('[Storage] Error removing dish from sync queue:', e);
    }
  },

  async clearDeletedDishIds() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_DISHES, JSON.stringify([]));
    } catch (e) {}
  },

  // --- LƯU TRẠNG THÁI BỘ LỌC (FILTER STATE) ---
  // Yêu cầu: Giữ các điều kiện đã chọn khi chuyển qua lại giữa các màn hình
  async getFilterState() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.FILTER_STATE);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      return null;
    }
  },

  async saveFilterState(filterState) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FILTER_STATE, JSON.stringify(filterState));
    } catch (e) {
      console.error('[Storage] Error saving filter state:', e);
    }
  },

  // --- CÀI ĐẶT NGÔN NGỮ (LANGUAGE) ---
  async getLanguage() {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return lang || 'en'; // Tiếng Anh là mặc định theo yêu cầu
    } catch (e) {
      return 'en';
    }
  },

  async saveLanguage(lang) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.error('[Storage] Error saving language:', e);
    }
  },

  // --- CẤU HÌNH MOCKAPI BASE URL ---
  async getMockApiUrl(defaultUrl) {
    try {
      const url = await AsyncStorage.getItem(STORAGE_KEYS.MOCKAPI_URL);
      return url || defaultUrl;
    } catch (e) {
      return defaultUrl;
    }
  },

  async saveMockApiUrl(url) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MOCKAPI_URL, url.trim());
    } catch (e) {
      console.error('[Storage] Error saving MockAPI URL:', e);
    }
  },

  // --- KHÔI PHỤC DỮ LIỆU BAN ĐẦU (RESET) ---
  async resetAllToDefault() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(INITIAL_DISHES));
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_DISHES, JSON.stringify([]));
      await AsyncStorage.setItem(STORAGE_KEYS.DELETED_NAME_CATS, JSON.stringify([]));
    } catch (e) {
      console.error('[Storage] Reset failed:', e);
    }
  },
};
