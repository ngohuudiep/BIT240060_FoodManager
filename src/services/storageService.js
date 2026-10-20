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
        return JSON.parse(json);
      }
      // Khởi tạo dữ liệu mẫu lần đầu nếu chưa có
      await this.saveLocalDishes(INITIAL_DISHES);
      return INITIAL_DISHES;
    } catch (e) {
      console.error('[Storage] Error reading local dishes:', e);
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

  // --- LOẠI MÓN ĂN (CATEGORIES) ---
  async getLocalCategories() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (json) {
        return JSON.parse(json);
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
    } catch (e) {
      console.error('[Storage] Reset failed:', e);
    }
  },
};
