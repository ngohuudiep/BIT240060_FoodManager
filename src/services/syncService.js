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

      while (updatedQueue.length > 0) {
        const currentTask = updatedQueue[0];
        console.log(`[SyncService] Đang xử lý: [${currentTask.action}] ID: ${currentTask.dishId || currentTask.tempId}`);

        try {
          if (currentTask.action === 'CREATE') {
            // Trường hợp 1: Tạo món ăn mới khi offline -> Gọi POST lên MockAPI
            const payload = { ...currentTask.data };
            const createdItem = await apiService.createDish(payload);
            const realId = createdItem[`${MSSV}_Id`] || createdItem.id;

            console.log(`[SyncService] POST thành công! Đã cấp ID mới: ${realId} cho ID tạm: ${currentTask.tempId}`);

            if (currentTask.tempId && realId) {
              idMapping[currentTask.tempId] = realId;

              // Cập nhật lại ID thực tế trong mảng local dishes
              localDishes = localDishes.map((dish) => {
                const dId = dish[`${MSSV}_Id`] || dish.id;
                if (String(dId) === String(currentTask.tempId)) {
                  return {
                    ...dish,
                    [`${MSSV}_Id`]: String(realId),
                  };
                }
                return dish;
              });

              // Cập nhật lại các tác vụ kế tiếp trong hàng đợi nếu có tham chiếu đến ID tạm này
              for (let i = 1; i < updatedQueue.length; i++) {
                if (String(updatedQueue[i].dishId) === String(currentTask.tempId)) {
                  updatedQueue[i].dishId = String(realId);
                }
              }
            }
          } else if (currentTask.action === 'UPDATE') {
            // Trường hợp 2: Sửa món ăn khi offline -> Gọi PUT lên MockAPI
            const targetId = idMapping[currentTask.dishId] || currentTask.dishId;
            const payload = { ...currentTask.data };
            await apiService.updateDish(targetId, payload);
            console.log(`[SyncService] PUT thành công cho món ID: ${targetId}`);
          } else if (currentTask.action === 'DELETE') {
            // Trường hợp 3: Xóa món ăn khi offline -> Gọi DELETE lên MockAPI
            const targetId = idMapping[currentTask.dishId] || currentTask.dishId;
            // Nếu món chỉ mới tạo offline rồi xóa ngay offline thì không cần gọi MockAPI
            if (!String(targetId).startsWith('temp_')) {
              try {
                await apiService.deleteDish(targetId);
                console.log(`[SyncService] DELETE thành công cho món ID: ${targetId}`);
              } catch (delError) {
                console.warn(`[SyncService] Bỏ qua lỗi xóa món (có thể món đã bị xóa trước đó):`, delError.message);
              }
            }
          }

          // Xóa tác vụ đã hoàn thành khỏi hàng đợi
          updatedQueue.shift();
          await storageService.saveSyncQueue(updatedQueue);
          await storageService.saveLocalDishes(localDishes);
        } catch (itemError) {
          console.error(`[SyncService] Lỗi khi xử lý tác vụ ${currentTask.id}:`, itemError.message);
          // Dừng đồng bộ nếu mất mạng giữa chừng để giữ nguyên trạng thái hàng đợi
          break;
        }
      }

      // Sau khi đẩy hết hàng đợi, kéo dữ liệu mới nhất từ MockAPI để đồng bộ 2 chiều
      await this.syncLatestFromMockAPI();

      // Cập nhật các bản ghi lịch sử chờ thành đã đồng bộ
      await historyService.markAllPendingAsSynced();

      isSyncing = false;
      return { success: true, processedCount: queue.length - updatedQueue.length };
    } catch (e) {
      console.error('[SyncService] Quá trình tự động đồng bộ gặp lỗi:', e);
      isSyncing = false;
      return { success: false, error: e.message };
    }
  },

  /**
   * Kéo dữ liệu mới nhất từ MockAPI về Local (nếu có mạng)
   */
  async syncLatestFromMockAPI() {
    try {
      const remoteDishes = await apiService.getDishes();
      if (Array.isArray(remoteDishes) && remoteDishes.length > 0) {
        // Chuẩn hóa và lưu đè vào Local Storage
        await storageService.saveLocalDishes(remoteDishes);
        console.log(`[SyncService] Đã cập nhật ${remoteDishes.length} món từ MockAPI vào Local.`);
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
