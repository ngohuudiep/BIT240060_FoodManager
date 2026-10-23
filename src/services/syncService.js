/**
 * DỊCH VỤ ĐỒNG BỘ TỰ ĐỘNG OFFLINE <-> MOCKAPI (SYNC SERVICE)
 *
 * ĐÁP ỨNG TIÊU CHÍ NÂNG CAO (1.5 ĐIỂM):
 * 1. Khi Offline: Lưu thao tác vào Hàng đợi (Sync Queue) và cập nhật bộ nhớ Local (AsyncStorage).
 * 2. Khi Online trở lại: Tự động chạy ngầm đồng bộ lên MockAPI (không cần bấm nút).
 * 3. Đảm bảo tính nhất quán dữ liệu, chống trùng lặp bản ghi (Id deduplication).
 */
import { apiService } from './api';
import { storageService } from './storageService';
import { historyService } from './historyService';
import { MSSV } from '../constants/config';
import { mergeRemoteAndLocal, isSameDishId } from './dataMerger';

let isSyncing = false;

export const syncService = {
  /**
   * Thêm một hành động vào hàng đợi đồng bộ
   * @param {Object} item { action: 'CREATE' | 'UPDATE' | 'DELETE', dishId, tempId, data }
   */
  async enqueueAction(item) {
    const queueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: item.action, // 'CREATE' | 'UPDATE' | 'DELETE'
      dishId: item.dishId || null,
      tempId: item.tempId || null,
      data: item.data || null,
      timestamp: Date.now(),
    };

    console.log('[SyncService] Enqueuing offline action:', queueItem);
    await storageService.addToSyncQueue(queueItem);
  },

  /**
   * Lấy số lượng hành động đang chờ đồng bộ
   */
  async getPendingCount() {
    const queue = await storageService.getSyncQueue();
    return queue.length;
  },

  /**
   * TIẾN TRÌNH ĐỒNG BỘ CHÍNH (Xử lý tuần tự hàng đợi)
   * Tự động kích hoạt khi có mạng kết nối trở lại
   */
  async processSyncQueue() {
    if (isSyncing) {
      console.log('[SyncService] Đồng bộ đang chạy, bỏ qua gọi trùng lặp.');
      return { success: false, reason: 'ALREADY_SYNCING' };
    }

    isSyncing = true;
    console.log('[SyncService] === BẮT ĐẦU TIẾN TRÌNH TỰ ĐỘNG ĐỒNG BỘ VỚI MOCKAPI ===');

    try {
      const queue = await storageService.getSyncQueue();
      if (!queue || queue.length === 0) {
        console.log('[SyncService] Hàng đợi trống. Đồng bộ dữ liệu mới nhất từ MockAPI.');
        await this.syncLatestFromMockAPI();
        isSyncing = false;
        return { success: true, processedCount: 0 };
      }

      console.log(`[SyncService] Tìm thấy ${queue.length} tác vụ cần đẩy lên MockAPI...`);

      let localDishes = await storageService.getLocalDishes();
      const updatedQueue = [...queue];

      // Bản đồ chuyển đổi ID tạm (offline) sang ID thực tế của MockAPI
      // Tránh việc món tạo offline rồi sửa offline bị sai ID khi sync
      const idMapping = {};

      let syncInterrupted = false;

      while (updatedQueue.length > 0) {
        const currentTask = updatedQueue[0];
        console.log(`[SyncService] Đang xử lý: [${currentTask.action}] ID: ${currentTask.dishId || currentTask.tempId}`);

        try {
          if (currentTask.action === 'CREATE') {
            // Trường hợp 1: Tạo món ăn mới khi offline -> Gọi POST lên MockAPI
            const payload = { ...currentTask.data };
            const createdItem = await apiService.createDish(payload);
            const realId = String(createdItem[`${MSSV}_Id`] || createdItem.id || createdItem.BIT240060_Id || Date.now());

            console.log(`[SyncService] POST thành công! Đã cấp ID mới: ${realId} cho ID tạm: ${currentTask.tempId}`);

            if (currentTask.tempId && realId) {
              idMapping[currentTask.tempId] = realId;

              // Cập nhật lại ID thực tế trong mảng local dishes trên TẤT CẢ các trường ID
              localDishes = localDishes.map((dish) => {
                const dId = dish[`${MSSV}_Id`] || dish[`${MSSV}_id`] || dish.BIT240060_Id || dish.id;
                if (String(dId) === String(currentTask.tempId) || isSameDishId(dId, currentTask.tempId)) {
                  return {
                    ...dish,
                    ...(typeof createdItem === 'object' && createdItem !== null ? createdItem : {}),
                    [`${MSSV}_Id`]: realId,
                    [`${MSSV}_id`]: realId,
                    BIT240060_Id: realId,
                    BIT240060_id: realId,
                    id: realId,
                  };
                }
                return dish;
              });

              // Cập nhật lại các tác vụ kế tiếp trong hàng đợi nếu có tham chiếu đến ID tạm này
              for (let i = 1; i < updatedQueue.length; i++) {
                if (String(updatedQueue[i].dishId) === String(currentTask.tempId)) {
                  updatedQueue[i].dishId = realId;
                }
              }
            }
          } else if (currentTask.action === 'UPDATE') {
            // Trường hợp 2: Sửa món ăn khi offline -> Gọi PUT lên MockAPI
            const targetId = idMapping[currentTask.dishId] || currentTask.dishId;
            const payload = { ...currentTask.data };
            if (!String(targetId).startsWith('temp_')) {
              const updatedItem = await apiService.updateDish(targetId, payload);
              console.log(`[SyncService] PUT thành công cho món ID: ${targetId}`);

              // Cập nhật localDishes với dữ liệu mới nhất
              localDishes = localDishes.map((dish) => {
                const dId = dish[`${MSSV}_Id`] || dish.id;
                if (isSameDishId(dId, targetId)) {
                  return {
                    ...dish,
                    ...(typeof updatedItem === 'object' && updatedItem !== null ? updatedItem : {}),
                    ...payload,
                    [`${MSSV}_Id`]: String(targetId),
                    id: String(targetId),
                  };
                }
                return dish;
              });
            }
          } else if (currentTask.action === 'DELETE') {
            // Trường hợp 3: Xóa món ăn khi offline -> Gọi DELETE lên MockAPI
            const targetId = idMapping[currentTask.dishId] || currentTask.dishId;
            if (targetId) {
              await storageService.addDeletedDishId(targetId);
            }
            if (currentTask.dishId) {
              await storageService.addDeletedDishId(currentTask.dishId);
            }
            if (!String(targetId).startsWith('temp_')) {
              try {
                await apiService.deleteDish(targetId);
                console.log(`[SyncService] DELETE thành công cho món ID: ${targetId}`);
              } catch (delError) {
                console.warn(`[SyncService] Bỏ qua lỗi xóa món:`, delError.message);
              }
            }

            // Loại bỏ món này khỏi mảng localDishes
            localDishes = localDishes.filter((dish) => {
              const dId = dish[`${MSSV}_Id`] || dish.id;
              const sId = String(dId);
              return sId !== String(targetId) && sId !== String(currentTask.dishId);
            });
          }

          // Xóa tác vụ đã hoàn thành khỏi hàng đợi
          updatedQueue.shift();
          await storageService.saveSyncQueue(updatedQueue);
          await storageService.saveLocalDishes(localDishes);
        } catch (itemError) {
          console.error(`[SyncService] Lỗi khi xử lý tác vụ ${currentTask.id}:`, itemError.message);
          syncInterrupted = true;
          break;
        }
      }

      // Sau khi đẩy hết hàng đợi thành công, kéo và hòa trộn an toàn với MockAPI
      if (!syncInterrupted) {
        await this.syncLatestFromMockAPI();
        await historyService.markAllPendingAsSynced();
      }

      isSyncing = false;
      return { success: !syncInterrupted, processedCount: queue.length - updatedQueue.length };
    } catch (e) {
      console.error('[SyncService] Quá trình tự động đồng bộ gặp lỗi:', e);
      isSyncing = false;
      return { success: false, error: e.message };
    }
  },

  /**
   * Kéo dữ liệu mới nhất từ MockAPI về và HÒA TRỘN BẢO TOÀN DỮ LIỆU CỤC BỘ
   */
  async syncLatestFromMockAPI() {
    try {
      const localDishes = await storageService.getLocalDishes();
      const queue = await storageService.getSyncQueue();
      const deletedIds = await storageService.getDeletedDishIds();
      const deletedNameCats = await storageService.getDeletedDishNameCats();

      const remoteDishes = await apiService.getDishes();
      if (Array.isArray(remoteDishes) && remoteDishes.length > 0) {
        // HÒA TRỘN THÔNG MINH BẢO TOÀN TOÀN BỘ MÓN CỤC BỘ (Không bao giờ xóa mất món local)
        const merged = mergeRemoteAndLocal(
          remoteDishes,
          localDishes,
          queue,
          deletedIds,
          deletedNameCats
        );
        await storageService.saveLocalDishes(merged);
        console.log(`[SyncService] Đã cập nhật và bảo toàn ${merged.length} món (Local + Remote).`);
      }

      const remoteCategories = await apiService.getCategories();
      if (Array.isArray(remoteCategories) && remoteCategories.length > 0) {
        await storageService.saveLocalCategories(remoteCategories);
      }
    } catch (e) {
      console.warn('[SyncService] Không thể kéo dữ liệu từ MockAPI (vẫn dùng cache local):', e.message);
    }
  },
};

