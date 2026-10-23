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
import { INITIAL_DISHES } from '../utils/mockData';
import { isSameDishId, mergeRemoteAndLocal } from './dataMerger';

export const dishService = {
  /**
   * So khớp ID linh hoạt giữa các định dạng (ví dụ "1" và "dish_1")
   */
  isSameId(idA, idB) {
    return isSameDishId(idA, idB);
  },

  /**
   * Hòa trộn thông minh dữ liệu giữa MockAPI, Local cache và Hàng đợi đồng bộ
   * Đảm bảo các thay đổi mới sửa ở local hoặc chờ đồng bộ không bị remote đè mất,
   * đồng thời ngăn chặn các món đã xóa tái xuất hiện từ MockAPI.
   */
  mergeRemoteAndLocal(remoteDishes, localDishes = [], syncQueue = [], deletedIds = [], deletedNameCats = []) {
    return mergeRemoteAndLocal(remoteDishes, localDishes, syncQueue, deletedIds, deletedNameCats);
  },

  /**
   * Lấy danh sách món ăn:
   * - Nếu Online: Kéo từ MockAPI về, hòa trộn an toàn với Local cache
   * - Nếu Offline hoặc MockAPI lỗi: Đọc trực tiếp từ Local Storage
   * - Tự động nạp lại 8 món nếu danh sách bị rỗng
   */
  async getAllDishes(isOnline = true) {
    const localData = await storageService.getLocalDishes();
    const syncQueue = await storageService.getSyncQueue();
    const deletedIds = await storageService.getDeletedDishIds();
    const deletedNameCats = await storageService.getDeletedDishNameCats();
    const normalizedDeletedIds = (deletedIds || []).map((id) => String(id).replace(/^dish_/, ''));

    if (isOnline) {
      try {
        const remoteData = await apiService.getDishes();
        if (Array.isArray(remoteData) && remoteData.length > 0) {
          // Lọc bỏ các món đã xóa khỏi remote trước khi merge
          const filteredRemote = remoteData.filter((r) => {
            const rId = String(r[`${MSSV}_Id`] || r.id || '').replace(/^dish_/, '');
            if (normalizedDeletedIds.includes(rId)) return false;
            const rName = String(r[`${MSSV}_Name`] || r.name || '').trim().toLowerCase();
            const rCat = String(r[`${MSSV}_DishCategoryId`] || r.categoryId || '');
            const rKey = rName && rCat ? `${rName}__${rCat}` : null;
            if (rKey && deletedNameCats.includes(rKey)) return false;
            return true;
          });
          // Lưu vào local cache với merge thông minh và chống trùng lặp
          const merged = this.mergeRemoteAndLocal(filteredRemote, localData, syncQueue, deletedIds, deletedNameCats);
          if (merged.length > 0) {
            await storageService.saveLocalDishes(merged);
            return merged.map((d) => DishModel.fromJSON(d));
          }
        }
      } catch (err) {
        console.warn('[DishService] Không thể kết nối MockAPI, sử dụng dữ liệu cục bộ:', err.message);
      }
    }

    // Đọc từ Local Storage nhưng lọc bỏ các món đã xóa và khử trùng lặp
    const filteredLocal = localData.filter((d) => {
      const dId = String(d[`${MSSV}_Id`] || d.id || '').replace(/^dish_/, '');
      if (normalizedDeletedIds.includes(dId)) return false;
      const dName = String(d[`${MSSV}_Name`] || d.name || '').trim().toLowerCase();
      const dCat = String(d[`${MSSV}_DishCategoryId`] || d.categoryId || '');
      const dKey = dName && dCat ? `${dName}__${dCat}` : null;
      if (dKey && deletedNameCats.includes(dKey)) return false;
      return true;
    });
    const cleanLocal = this.mergeRemoteAndLocal(filteredLocal, [], syncQueue, deletedIds, deletedNameCats);
    if (cleanLocal.length > 0) {
      return cleanLocal.map((d) => DishModel.fromJSON(d));
    }

    // Nếu cả remote và local đều rỗng, tự động khôi phục toàn bộ 8 món ban đầu
    console.log('[DishService] Danh sách món rỗng, tự động khôi phục 8 món ban đầu.');
    return await this.restoreDefaultDishes(isOnline);
  },

  /**
   * Khôi phục đầy đủ 8 món ăn ban đầu (Local + MockAPI)
   */
  async restoreDefaultDishes(isOnline = true) {
    await storageService.restoreDefaultDishes();
    if (isOnline) {
      // Đẩy lên MockAPI ngầm (background) để không làm đơ giao diện
      (async () => {
        try {
          const remote = await apiService.getDishes();
          if (Array.isArray(remote) && remote.length < INITIAL_DISHES.length) {
            console.log('[DishService] Đang đẩy bổ sung các món mẫu lên MockAPI...');
            for (const dish of INITIAL_DISHES) {
              const existsOnRemote = remote.some((r) => {
                const rName = String(r[`${MSSV}_Name`] || r.name || '').trim().toLowerCase();
                return rName === String(dish.BIT240060_Name).trim().toLowerCase();
              });
              if (!existsOnRemote) {
                try {
                  await apiService.createDish(dish);
                } catch (_) {}
              }
            }
          }
        } catch (e) {
          console.warn('[DishService] Bỏ qua lỗi kết nối MockAPI khi khôi phục:', e.message);
        }
      })();
    }
    return INITIAL_DISHES.map((d) => DishModel.fromJSON(d));
  },

  /**
   * Lấy chi tiết món ăn theo ID
   */
  async getDishById(id, isOnline = true) {
    const all = await this.getAllDishes(isOnline);
    return all.find((d) => this.isSameId(d.id, id)) || null;
  },

  /**
   * Tạo món ăn mới
   * - Nếu Online: Gửi POST lên MockAPI, lưu vào Local
   * - Nếu Offline: Tạo id tạm thời `temp_...`, lưu Local và đưa vào Hàng đợi đồng bộ
   */
  async createDish(dishData, isOnline = true) {
    const rawData = dishData instanceof DishModel ? dishData.toJSON() : dishData;
    let localDishes = await storageService.getLocalDishes();
    const dishName = rawData[`${MSSV}_Name`] || rawData.name || 'Món mới';
    const dishCat = String(rawData[`${MSSV}_DishCategoryId`] || rawData.categoryId || '');
    const dishNameLower = String(dishName).trim().toLowerCase();

    let savedModel = null;
    let isSynced = false;

    if (isOnline) {
      try {
        const createdOnApi = await apiService.createDish(rawData);
        const newDishModel = DishModel.fromJSON(createdOnApi);

        // Lưu vào local storage: Lọc bỏ mọi bản ghi cũ trùng ID hoặc trùng Tên + Loại món
        localDishes = localDishes.filter((d) => {
          const dId = d[`${MSSV}_Id`] || d.id;
          if (this.isSameId(dId, newDishModel.id)) return false;
          const dName = String(d[`${MSSV}_Name`] || d.name || '').trim().toLowerCase();
          const dCat = String(d[`${MSSV}_DishCategoryId`] || d.categoryId || '');
          if (dishNameLower && dName === dishNameLower && dishCat && dCat === dishCat) return false;
          return true;
        });

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

      // Loại bỏ bản ghi cũ trùng Tên + Loại món nếu có
      localDishes = localDishes.filter((d) => {
        const dName = String(d[`${MSSV}_Name`] || d.name || '').trim().toLowerCase();
        const dCat = String(d[`${MSSV}_DishCategoryId`] || d.categoryId || '');
        return !(dishNameLower && dName === dishNameLower && dishCat && dCat === dishCat);
      });

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
      return this.isSameId(cId, dishId);
    });

    const dishName = rawData[`${MSSV}_Name`] || rawData.name || oldDishRaw?.[`${MSSV}_Name`] || 'Món ăn';
    const changesDiff = historyService.compareDishChanges(oldDishRaw, rawData);
    const changeSummary = changesDiff.length > 0
      ? changesDiff.map((c) => `${c.label}: ${c.oldVal} → ${c.newVal}`).join('; ')
      : 'Cập nhật thông tin món';

    // Cập nhật mảng local trước để UI phản hồi tức thì
    localDishes = localDishes.map((item) => {
      const currentId = item[`${MSSV}_Id`] || item.id;
      if (this.isSameId(currentId, dishId)) {
        return {
          ...item,
          ...rawData,
          [`${MSSV}_Id`]: String(dishId),
          id: String(dishId),
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
        const mergedData = {
          ...(typeof updatedOnApi === 'object' && updatedOnApi !== null ? updatedOnApi : {}),
          ...rawData,
          [`${MSSV}_Id`]: String(dishId),
          id: String(dishId),
          [`${MSSV}_Name`]: rawData[`${MSSV}_Name`] || rawData.name,
          name: rawData[`${MSSV}_Name`] || rawData.name,
          [`${MSSV}_Price`]: rawData[`${MSSV}_Price`] ?? rawData.price,
          price: rawData[`${MSSV}_Price`] ?? rawData.price,
          [`${MSSV}_PreparationTime`]: rawData[`${MSSV}_PreparationTime`] ?? rawData.preparationTime,
          preparationTime: rawData[`${MSSV}_PreparationTime`] ?? rawData.preparationTime,
          [`${MSSV}_IsAvailable`]: rawData[`${MSSV}_IsAvailable`] ?? rawData.isAvailable,
          isAvailable: rawData[`${MSSV}_IsAvailable`] ?? rawData.isAvailable,
          [`${MSSV}_Description`]: rawData[`${MSSV}_Description`] || rawData.description,
          description: rawData[`${MSSV}_Description`] || rawData.description,
          [`${MSSV}_DishCategoryId`]: rawData[`${MSSV}_DishCategoryId`] || rawData.dishCategoryId || rawData.categoryId,
          dishCategoryId: rawData[`${MSSV}_DishCategoryId`] || rawData.dishCategoryId || rawData.categoryId,
          categoryId: rawData[`${MSSV}_DishCategoryId`] || rawData.dishCategoryId || rawData.categoryId,
          [`${MSSV}_DishImage`]: rawData[`${MSSV}_DishImage`] || rawData.dishImage || rawData.images,
          dishImage: rawData[`${MSSV}_DishImage`] || rawData.dishImage || rawData.images,
          images: rawData[`${MSSV}_DishImage`] || rawData.dishImage || rawData.images,
        };
        resultModel = DishModel.fromJSON(mergedData);
        isSynced = true;

        // Lưu lại bản hoàn chỉnh vào local cache
        localDishes = localDishes.map((item) => {
          const currentId = item[`${MSSV}_Id`] || item[`${MSSV}_id`] || item.id || item._id;
          if (this.isSameId(currentId, dishId)) {
            return resultModel.toJSON();
          }
          return item;
        });
        await storageService.saveLocalDishes(localDishes);
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
   * - Xóa theo ID và xóa luôn TẤT CẢ bản trùng tên+loại món (chống phantom duplicate từ MockAPI)
   * - Có popup xác nhận ở màn hình
   * - Cập nhật Local ngay và đưa vào hàng đợi nếu Offline
   */
  async deleteDish(dishId, isOnline = true) {
    let localDishes = await storageService.getLocalDishes();
    const dishToDelete = localDishes.find((item) => {
      const cId = item[`${MSSV}_Id`] || item.id;
      return this.isSameId(cId, dishId);
    });
    const dishName = dishToDelete?.[`${MSSV}_Name`] || dishToDelete?.name || '';
    const dishCat = String(dishToDelete?.[`${MSSV}_DishCategoryId`] || dishToDelete?.categoryId || '');
    const dishNameLower = String(dishName).trim().toLowerCase();

    // 1. Xóa ngay khỏi cache local - xóa theo ID VÀ theo Tên+Loại món (diệt trùng hoàn toàn)
    const idsToBlacklist = [];
    localDishes = localDishes.filter((item) => {
      const currentId = item[`${MSSV}_Id`] || item.id;
      const byId = this.isSameId(currentId, dishId);
      const itemName = String(item[`${MSSV}_Name`] || item.name || '').trim().toLowerCase();
      const itemCat = String(item[`${MSSV}_DishCategoryId`] || item.categoryId || '');
      const byNameCat = dishNameLower && itemName === dishNameLower && dishCat && itemCat === dishCat;
      if (byId || byNameCat) {
        idsToBlacklist.push(String(currentId));
        return false;
      }
      return true;
    });
    await storageService.saveLocalDishes(localDishes);

    // 2. Blacklist TẤT CẢ các ID của bản trùng để không bao giờ bị merge kéo lại từ MockAPI
    for (const bId of idsToBlacklist) {
      await storageService.addDeletedDishId(bId);
    }
    // Đảm bảo ID gốc cũng được blacklist
    await storageService.addDeletedDishId(dishId);

    // 3. Blacklist theo Tên+Loại món để ngăn bản trùng trên remote tái xuất hiện
    if (dishNameLower && dishCat) {
      await storageService.addDeletedDishNameCat(dishNameLower, dishCat);
    }

    // 4. Xóa ngay mọi tác vụ CREATE / UPDATE / DELETE đang chờ trong syncQueue
    for (const bId of idsToBlacklist) {
      await storageService.removeDishFromSyncQueue(bId);
    }
    await storageService.removeDishFromSyncQueue(dishId);

    const isTemp = String(dishId).startsWith('temp_');
    let isSynced = false;

    if (isTemp) {
      isSynced = true;
    } else if (isOnline) {
      // Xóa tất cả các ID liên quan trên MockAPI (diệt toàn bộ bản trùng)
      const allIdsToDelete = [...new Set([dishId, ...idsToBlacklist])].filter(
        (id) => !String(id).startsWith('temp_')
      );
      for (const delId of allIdsToDelete) {
        try {
          await apiService.deleteDish(delId);
          isSynced = true;
        } catch (e) {
          console.warn(`[DishService] Lỗi xóa ID ${delId} trên MockAPI:`, e.message);
        }
      }

      // Lấy danh sách từ MockAPI và xóa thêm các bản trùng tên+loại còn sót lại
      if (dishNameLower) {
        try {
          const remoteAll = await apiService.getDishes();
          if (Array.isArray(remoteAll)) {
            for (const rd of remoteAll) {
              const rId = String(rd[`${MSSV}_Id`] || rd.id || '');
              const rName = String(rd[`${MSSV}_Name`] || rd.name || '').trim().toLowerCase();
              const rCat = String(rd[`${MSSV}_DishCategoryId`] || rd.categoryId || '');
              if (rName === dishNameLower && (!dishCat || rCat === dishCat)) {
                try {
                  await apiService.deleteDish(rId);
                  await storageService.addDeletedDishId(rId);
                  console.log(`[DishService] Đã xóa bản trùng trên MockAPI: ID=${rId}, Tên="${dishName}"`);
                } catch (_) {}
              }
            }
          }
        } catch (e) {
          console.warn('[DishService] Không thể quét bản trùng trên MockAPI:', e.message);
        }
      }
    }

    if (!isSynced && !isTemp) {
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
      targetName: dishName || 'Món ăn',
      details: `Đã xóa món "${dishName || 'Món ăn'}" khỏi thực đơn`,
      status: isSynced ? 'SYNCED' : 'PENDING',
    });

    return true;
  },
};


