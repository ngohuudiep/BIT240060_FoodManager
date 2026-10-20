/**
 * DỊCH VỤ THEO DÕI LỊCH SỬ THAY ĐỔI (CHANGE HISTORY SERVICE)
 * Lưu vết (Audit Trail) các thao tác: Thêm mới, Chỉnh sửa, Xóa món ăn và loại món.
 * Tích hợp chặt chẽ với Hàng đợi đồng bộ (Sync Queue):
 * - Đảm bảo bất kỳ tác vụ nào đang chờ đồng bộ đều xuất hiện trong danh sách lịch sử
 * - Số lượng mục chờ đồng bộ luôn khớp 100% với thông báo trên thanh trạng thái
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from './storageService';
import { MSSV } from '../constants/config';

const STORAGE_KEY_HISTORY = `@${MSSV}_change_history`;
const MAX_HISTORY_ITEMS = 100;

export const historyService = {
  /**
   * Lấy danh sách toàn bộ lịch sử thay đổi, tự động đồng bộ cùng Sync Queue
   */
  async getHistory() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      let history = json ? JSON.parse(json) : [];

      // Đọc hàng đợi đồng bộ hiện tại từ Local Storage
      const syncQueue = await storageService.getSyncQueue();
      const syncQueueIds = new Set(syncQueue.map((q) => String(q.id || q.tempId || q.dishId)));

      // 1. Kiểm tra các mục trong syncQueue mà chưa có trong history
      const queueEntries = syncQueue.map((item) => {
        const d = item.data || {};
        const name = d[`${MSSV}_Name`] || d.name || 'Món ăn';
        let actionLabel = 'Chỉnh sửa';
        if (item.action === 'CREATE') actionLabel = 'Thêm mới';
        if (item.action === 'DELETE') actionLabel = 'Xóa';

        const itemTime = item.timestamp ? new Date(item.timestamp) : new Date();
        const timeStr = `${itemTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} - ${itemTime.toLocaleDateString('vi-VN')}`;

        return {
          id: item.id || `sync_${item.tempId || item.dishId}`,
          syncId: item.id,
          action: item.action || 'UPDATE',
          targetType: 'DISH',
          targetId: String(item.dishId || item.tempId || ''),
          targetName: name,
          details: `${actionLabel} món "${name}" (Lưu tạm trên máy - Chờ đồng bộ lên MockAPI)`,
          changes: [],
          status: 'PENDING',
          timestamp: item.timestamp || Date.now(),
          timeFormatted: timeStr,
        };
      });

      // 2. Cập nhật trạng thái các mục trong history:
      // Nếu mục có status là PENDING nhưng không còn trong syncQueue thì chuyển thành SYNCED
      history = history.map((h) => {
        const matchesInQueue = syncQueue.some(
          (q) =>
            String(q.id) === String(h.id) ||
            String(q.id) === String(h.syncId) ||
            (String(q.dishId || q.tempId) === String(h.targetId) && q.action === h.action)
        );
        if (h.status === 'PENDING' && !matchesInQueue) {
          return { ...h, status: 'SYNCED' };
        }
        return h;
      });

      // 3. Hợp nhất: đưa các mục trong syncQueue chưa tồn tại vào đầu danh sách
      for (const qEntry of queueEntries) {
        const exists = history.some(
          (h) =>
            String(h.id) === String(qEntry.id) ||
            String(h.syncId) === String(qEntry.syncId) ||
            (String(h.targetId) === String(qEntry.targetId) && h.action === qEntry.action && h.status === 'PENDING')
        );
        if (!exists) {
          history.unshift(qEntry);
        }
      }

      // Sắp xếp mới nhất lên đầu
      history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      return history;
    } catch (e) {
      console.error('[HistoryService] Error reading history:', e);
      return [];
    }
  },

  /**
   * Lưu mảng lịch sử vào storage
   */
  async saveHistory(list) {
    try {
      const capped = list.slice(0, MAX_HISTORY_ITEMS);
      await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(capped));
    } catch (e) {
      console.error('[HistoryService] Error saving history:', e);
    }
  },

  /**
   * Ghi nhận một sự kiện thay đổi mới
   */
  async addEntry(entry) {
    try {
      const history = await this.getHistory();
      const now = new Date();
      const timeStr = `${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} - ${now.toLocaleDateString('vi-VN')}`;

      const newRecord = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        action: entry.action || 'UPDATE',
        targetType: entry.targetType || 'DISH',
        targetId: String(entry.targetId || ''),
        targetName: entry.targetName || 'Món ăn',
        details: entry.details || '',
        changes: entry.changes || [],
        status: entry.status || 'PENDING',
        timestamp: Date.now(),
        timeFormatted: timeStr,
      };

      history.unshift(newRecord);
      await this.saveHistory(history);
      return newRecord;
    } catch (e) {
      console.error('[HistoryService] Error adding history entry:', e);
    }
  },

  /**
   * Cập nhật trạng thái của các mục từ PENDING sang SYNCED khi đồng bộ thành công
   */
  async markAllPendingAsSynced() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      const history = json ? JSON.parse(json) : [];

      const updated = history.map((item) => ({
        ...item,
        status: 'SYNCED',
      }));

      await this.saveHistory(updated);
    } catch (e) {
      console.error('[HistoryService] Error marking history as synced:', e);
    }
  },

  /**
   * Lấy lịch sử thay đổi của một món ăn cụ thể
   */
  async getHistoryByDishId(dishId) {
    const all = await this.getHistory();
    return all.filter((item) => String(item.targetId) === String(dishId));
  },

  /**
   * Xóa toàn bộ lịch sử thay đổi (đồng thời dọn sạch queue nếu muốn)
   */
  async clearHistory() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      console.error('[HistoryService] Error clearing history:', e);
    }
  },

  /**
   * Hàm trợ giúp so sánh các trường dữ liệu món ăn trước và sau khi sửa
   */
  compareDishChanges(oldDish, newDishData, categoryMap = {}) {
    if (!oldDish) return [];
    const changes = [];

    // 1. Tên món
    const oldName = oldDish.name || oldDish[`${MSSV}_Name`];
    const newName = newDishData[`${MSSV}_Name`] || newDishData.name;
    if (newName && oldName && oldName.trim() !== newName.trim()) {
      changes.push({
        field: 'name',
        label: 'Tên món',
        oldVal: oldName,
        newVal: newName,
      });
    }

    // 2. Giá bán
    const oldPrice = Number(oldDish.price ?? oldDish[`${MSSV}_Price`]);
    const newPrice = Number(newDishData[`${MSSV}_Price`] ?? newDishData.price);
    if (!isNaN(oldPrice) && !isNaN(newPrice) && oldPrice !== newPrice) {
      changes.push({
        field: 'price',
        label: 'Giá bán',
        oldVal: `${oldPrice.toLocaleString()} đ`,
        newVal: `${newPrice.toLocaleString()} đ`,
      });
    }

    // 3. Thời gian chế biến
    const oldPrep = Number(oldDish.preparationTime ?? oldDish[`${MSSV}_PreparationTime`]);
    const newPrep = Number(newDishData[`${MSSV}_PreparationTime`] ?? newDishData.preparationTime);
    if (!isNaN(oldPrep) && !isNaN(newPrep) && oldPrep !== newPrep) {
      changes.push({
        field: 'preparationTime',
        label: 'Thời gian chế biến',
        oldVal: `${oldPrep} phút`,
        newVal: `${newPrep} phút`,
      });
    }

    // 4. Trạng thái kinh doanh
    const oldAvail = Boolean(oldDish.isAvailable ?? oldDish[`${MSSV}_IsAvailable`]);
    const newAvail = Boolean(newDishData[`${MSSV}_IsAvailable`] ?? newDishData.isAvailable);
    if (oldAvail !== newAvail) {
      changes.push({
        field: 'isAvailable',
        label: 'Trạng thái kinh doanh',
        oldVal: oldAvail ? 'Đang bán' : 'Ngừng bán',
        newVal: newAvail ? 'Đang bán' : 'Ngừng bán',
      });
    }

    // 5. Loại món ăn
    const oldCatId = String(oldDish.categoryId || oldDish[`${MSSV}_DishCategoryId`] || '');
    const newCatId = String(newDishData[`${MSSV}_DishCategoryId`] || newDishData.categoryId || '');
    if (oldCatId && newCatId && oldCatId !== newCatId) {
      const oldCatName = categoryMap[oldCatId] || oldCatId;
      const newCatName = categoryMap[newCatId] || newCatId;
      changes.push({
        field: 'categoryId',
        label: 'Loại món',
        oldVal: oldCatName,
        newVal: newCatName,
      });
    }

    // 6. Mô tả
    const oldDesc = (oldDish.description || oldDish[`${MSSV}_Description`] || '').trim();
    const newDesc = (newDishData[`${MSSV}_Description`] || newDishData.description || '').trim();
    if (oldDesc !== newDesc) {
      changes.push({
        field: 'description',
        label: 'Mô tả',
        oldVal: oldDesc ? (oldDesc.length > 25 ? oldDesc.slice(0, 25) + '...' : oldDesc) : '(Trống)',
        newVal: newDesc ? (newDesc.length > 25 ? newDesc.slice(0, 25) + '...' : newDesc) : '(Trống)',
      });
    }

    // 7. Số lượng ảnh
    const oldImgs = oldDish.images || oldDish[`${MSSV}_DishImage`] || [];
    const newImgs = newDishData[`${MSSV}_DishImage`] || newDishData.images || [];
    if (oldImgs.length !== newImgs.length) {
      changes.push({
        field: 'images',
        label: 'Số lượng ảnh',
        oldVal: `${oldImgs.length} ảnh`,
        newVal: `${newImgs.length} ảnh`,
      });
    }

    return changes;
  },
};
