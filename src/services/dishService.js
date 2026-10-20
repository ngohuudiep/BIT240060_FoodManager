/**
 * DỊCH VỤ QUẢN LÝ MÓN ĂN (DISH SERVICE)
 * Xử lý toàn bộ logic CRUD món ăn, điều phối giữa Online (MockAPI) và Offline (AsyncStorage + Queue)
 */
import { apiService } from './api';
import { storageService } from './storageService';
import { syncService } from './syncService';
import { historyService } from './historyService';
import { DishModel } from '../models/Dish';
import { MSSV } from '../constants/config';

export const dishService = {
  /**
   * Lấy danh sách món ăn:
   * - Nếu Online: Kéo từ MockAPI về và cập nhật cache Local
   * - Nếu Offline hoặc MockAPI lỗi: Đọc trực tiếp từ Local Storage
   */
  async getAllDishes(isOnline = true) {
    if (isOnline) {
      try {
        const remoteData = await apiService.getDishes();
        if (Array.isArray(remoteData)) {
          // Lưu vào local cache
          await storageService.saveLocalDishes(remoteData);
          return remoteData.map((d) => DishModel.fromJSON(d));
        }
      } catch (err) {
        console.warn('[DishService] Không thể kết nối MockAPI, sử dụng dữ liệu cục bộ:', err.message);
      }
    }

    // Đọc từ Local Storage
    const localData = await storageService.getLocalDishes();
    return localData.map((d) => DishModel.fromJSON(d));
  },

  /**
   * Lấy chi tiết món ăn theo ID
   */
  async getDishById(id, isOnline = true) {
    const all = await this.getAllDishes(isOnline);
    return all.find((d) => String(d.id) === String(id)) || null;
  },

  /**
   * Tạo món ăn mới
   * - Nếu Online: Gửi POST lên MockAPI, lưu vào Local
   * - Nếu Offline: Tạo id tạm thời `temp_...`, lưu Local và đưa vào Hàng đợi đồng bộ
   */
  async createDish(dishData, isOnline = true) {
    const rawData = dishData instanceof DishModel ? dishData.toJSON() : dishData;
    const localDishes = await storageService.getLocalDishes();
    const dishName = rawData[`${MSSV}_Name`] || rawData.name || 'Món mới';

    let savedModel = null;
    let isSynced = false;

    if (isOnline) {
      try {
        const createdOnApi = await apiService.createDish(rawData);
        const newDishModel = DishModel.fromJSON(createdOnApi);

        // Lưu vào local storage
        localDishes.unshift(newDishModel.toJSON());
        await storageService.saveLocalDishes(localDishes);

        savedModel = newDishModel;
        isSynced = true;
      } catch (e) {
        console.warn('[DishService] Lỗi tạo trên MockAPI, chuyển sang chế độ Offline lưu tạm:', e.message);
      }
    }

    if (!savedModel) {
      // Chế độ Ngoại tuyến (Offline Mode)
      const tempId = `temp_${Date.now()}`;
      const offlineDish = {
        ...rawData,
        [`${MSSV}_Id`]: tempId,
      };

      localDishes.unshift(offlineDish);
      await storageService.saveLocalDishes(localDishes);

      // Ghi nhận vào hàng đợi để tự động đồng bộ khi có mạng lại
      await syncService.enqueueAction({
        action: 'CREATE',
        tempId: tempId,
        data: offlineDish,
      });

      savedModel = DishModel.fromJSON(offlineDish);
    }

    // GHI NHẬN LỊCH SỬ THAY ĐỔI
    await historyService.addEntry({
      action: 'CREATE',
      targetType: 'DISH',
      targetId: savedModel.id,
      targetName: dishName,
      details: `Thêm mới món "${dishName}" với giá ${Number(savedModel.price).toLocaleString()}đ`,
      status: isSynced ? 'SYNCED' : 'PENDING',
    });

    return savedModel;
  },

  /**
   * Cập nhật món ăn
   * - Nếu Online: Gọi PUT MockAPI, cập nhật Local
   * - Nếu Offline: Cập nhật Local ngay lập tức, đưa vào hàng đợi
   */
  async updateDish(dishId, dishData, isOnline = true) {
    const rawData = dishData instanceof DishModel ? dishData.toJSON() : dishData;
    let localDishes = await storageService.getLocalDishes();

    // Tìm món cũ để so sánh thay đổi
    const oldDishRaw = localDishes.find((item) => {
      const cId = item[`${MSSV}_Id`] || item.id;
      return String(cId) === String(dishId);
    });

    const dishName = rawData[`${MSSV}_Name`] || rawData.name || oldDishRaw?.[`${MSSV}_Name`] || 'Món ăn';
    const changesDiff = historyService.compareDishChanges(oldDishRaw, rawData);
    const changeSummary = changesDiff.length > 0
      ? changesDiff.map((c) => `${c.label}: ${c.oldVal} → ${c.newVal}`).join('; ')
      : 'Cập nhật thông tin món';

    // Cập nhật mảng local trước để UI phản hồi tức thì
    localDishes = localDishes.map((item) => {
      const currentId = item[`${MSSV}_Id`] || item.id;
      if (String(currentId) === String(dishId)) {
        return {
          ...item,
          ...rawData,
          [`${MSSV}_Id`]: String(dishId),
        };
      }
      return item;
    });
    await storageService.saveLocalDishes(localDishes);

    let isSynced = false;
    let resultModel = null;

    if (isOnline && !String(dishId).startsWith('temp_')) {
      try {
        const updatedOnApi = await apiService.updateDish(dishId, rawData);
        resultModel = DishModel.fromJSON(updatedOnApi);
        isSynced = true;
      } catch (e) {
        console.warn('[DishService] Lỗi cập nhật lên MockAPI, ghi nhận vào hàng đợi offline:', e.message);
      }
    }

    if (!resultModel) {
      // Đưa vào hàng đợi nếu đang offline hoặc gọi API thất bại
      await syncService.enqueueAction({
        action: 'UPDATE',
        dishId: dishId,
        data: rawData,
      });

      resultModel = DishModel.fromJSON({
        ...rawData,
        [`${MSSV}_Id`]: String(dishId),
      });
    }

    // GHI NHẬN LỊCH SỬ THAY ĐỔI
    await historyService.addEntry({
      action: 'UPDATE',
      targetType: 'DISH',
      targetId: String(dishId),
      targetName: dishName,
      details: changeSummary,
      changes: changesDiff,
      status: isSynced ? 'SYNCED' : 'PENDING',
    });

    return resultModel;
  },

  /**
   * Xóa món ăn
   * - Có popup xác nhận ở màn hình
   * - Cập nhật Local ngay và đưa vào hàng đợi nếu Offline
   */
  async deleteDish(dishId, isOnline = true) {
    let localDishes = await storageService.getLocalDishes();
    const dishToDelete = localDishes.find((item) => {
      const cId = item[`${MSSV}_Id`] || item.id;
      return String(cId) === String(dishId);
    });
    const dishName = dishToDelete?.[`${MSSV}_Name`] || dishToDelete?.name || 'Món ăn';

    localDishes = localDishes.filter((item) => {
      const currentId = item[`${MSSV}_Id`] || item.id;
      return String(currentId) !== String(dishId);
    });
    await storageService.saveLocalDishes(localDishes);

    let isSynced = false;

    if (isOnline && !String(dishId).startsWith('temp_')) {
      try {
        await apiService.deleteDish(dishId);
        isSynced = true;
      } catch (e) {
        console.warn('[DishService] Lỗi xóa trên MockAPI, ghi nhận vào hàng đợi offline:', e.message);
      }
    }

    if (!isSynced) {
      // Đưa vào hàng đợi nếu đang offline hoặc gọi API thất bại
      await syncService.enqueueAction({
        action: 'DELETE',
        dishId: dishId,
      });
    }

    // GHI NHẬN LỊCH SỬ THAY ĐỔI
    await historyService.addEntry({
      action: 'DELETE',
      targetType: 'DISH',
      targetId: String(dishId),
      targetName: dishName,
      details: `Đã xóa món "${dishName}" khỏi thực đơn`,
      status: isSynced ? 'SYNCED' : 'PENDING',
    });

    return true;
  },
};
