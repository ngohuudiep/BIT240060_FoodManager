/**
 * DỊCH VỤ QUẢN LÝ LOẠI MÓN ĂN (CATEGORY SERVICE)
 * Xử lý danh mục loại món ăn và các ràng buộc nghiệp vụ (Business Rules)
 */
import { storageService } from './storageService';
import { apiService } from './api';
import { historyService } from './historyService';
import { DishCategoryModel } from '../models/Category';
import { isCategoryInUse } from '../utils/validation';
import { MSSV } from '../constants/config';

export const categoryService = {
  /**
   * Lấy danh sách toàn bộ loại món
   */
  async getAllCategories() {
    // Thử lấy từ MockAPI nếu có
    const remote = await apiService.getCategories();
    if (Array.isArray(remote) && remote.length > 0) {
      await storageService.saveLocalCategories(remote);
      return remote.map((c) => DishCategoryModel.fromJSON(c));
    }

    const local = await storageService.getLocalCategories();
    return local.map((c) => DishCategoryModel.fromJSON(c));
  },

  /**
   * Thêm loại món mới
   */
  async createCategory(catData) {
    const raw = catData instanceof DishCategoryModel ? catData.toJSON() : catData;
    const local = await storageService.getLocalCategories();
    const catName = raw[`${MSSV}_Name`] || raw.name || 'Loại món mới';

    const catId = raw[`${MSSV}_Id`] || raw.id || `cat_${Date.now()}`;
    const newCat = {
      ...raw,
      [`${MSSV}_Id`]: catId,
      [`${MSSV}_id`]: catId,
      id: catId,
      [`${MSSV}_Name`]: catName,
      [`${MSSV}_name`]: catName,
      name: catName,
    };

    local.push(newCat);
    await storageService.saveLocalCategories(local);

    // Cố gắng đồng bộ lên MockAPI nếu endpoint tồn tại
    await apiService.createCategory(newCat);

    // Ghi lịch sử
    await historyService.addEntry({
      action: 'CREATE',
      targetType: 'CATEGORY',
      targetId: newCat[`${MSSV}_Id`],
      targetName: catName,
      details: `Thêm mới loại món "${catName}"`,
      status: 'SYNCED',
    });

    return DishCategoryModel.fromJSON(newCat);
  },

  /**
   * Xóa loại món ăn
   * RÀNG BUỘC NGHIỆP VỤ BẮT BUỘC: Không cho phép xóa loại món đang được sử dụng!
   */
  async deleteCategory(categoryId, allDishes = []) {
    // 1. Kiểm tra ràng buộc
    if (isCategoryInUse(categoryId, allDishes)) {
      throw new Error('categoryDeleteErrorInUse');
    }

    // 2. Tiến hành xóa khỏi local
    let local = await storageService.getLocalCategories();
    const catToDelete = local.find((c) => {
      const cId = c[`${MSSV}_Id`] || c.id;
      return String(cId) === String(categoryId);
    });
    const catName = catToDelete?.[`${MSSV}_Name`] || catToDelete?.name || 'Loại món';

    local = local.filter((c) => {
      const cId = c[`${MSSV}_Id`] || c.id;
      return String(cId) !== String(categoryId);
    });

    await storageService.saveLocalCategories(local);

    // Ghi lịch sử
    await historyService.addEntry({
      action: 'DELETE',
      targetType: 'CATEGORY',
      targetId: String(categoryId),
      targetName: catName,
      details: `Đã xóa loại món "${catName}"`,
      status: 'SYNCED',
    });

    return true;
  },
};
