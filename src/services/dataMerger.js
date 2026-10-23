/**
 * HÒA TRỘN DỮ LIỆU THÔNG MINH (DATA MERGER SERVICE)
 * Đảm bảo dữ liệu nhất quán giữa MockAPI và Local Storage:
 * 1. Món sửa/tạo khi Offline được bảo toàn tuyệt đối, không bị remote đè mất.
 * 2. Món đã xóa (trong deletedIds/deletedNameCats) không bao giờ bị kéo lại từ MockAPI.
 * 3. Chống trùng lặp (deduplication) triệt để theo cả ID và theo [Tên món + Loại món].
 */
import { MSSV } from '../constants/config';

export const isSameDishId = (idA, idB) => {
  if (!idA || !idB) return false;
  const sA = String(idA).trim();
  const sB = String(idB).trim();
  if (sA === sB) return true;
  return sA.replace(/^dish_/, '') === sB.replace(/^dish_/, '');
};

export const mergeRemoteAndLocal = (
  remoteDishes = [],
  localDishes = [],
  syncQueue = [],
  deletedIds = [],
  deletedNameCats = []
) => {
  if (!Array.isArray(remoteDishes)) return localDishes || [];

  // Lọc các món đang có lệnh DELETE chưa đồng bộ trong hàng đợi syncQueue
  const pendingDeleteIds = (syncQueue || [])
    .filter((task) => task.action === 'DELETE')
    .map((task) => String(task.dishId));

  // Chuẩn hóa deletedIds để so sánh linh hoạt
  const normalizedDeletedIds = (deletedIds || []).map((id) => String(id).replace(/^dish_/, ''));
  // Set các key Tên+Loại món đã bị xóa (chặn bản trùng ID khác nhau)
  const deletedNameCatSet = new Set(deletedNameCats || []);

  const pendingUpdates = {};
  (syncQueue || [])
    .filter((task) => task.action === 'UPDATE')
    .forEach((task) => {
      if (task.dishId) {
        pendingUpdates[String(task.dishId)] = task.data;
      }
    });

  const mergedList = [];
  for (const remote of remoteDishes) {
    const rId = remote[`${MSSV}_Id`] || remote[`${MSSV}_id`] || remote.BIT240060_Id || remote.BIT240060_id || remote.id || remote._id;
    const rIdClean = String(rId).replace(/^dish_/, '');

    // Bỏ qua nếu ID nằm trong danh sách đã xóa
    if (normalizedDeletedIds.includes(rIdClean)) {
      continue;
    }
    // Bỏ qua nếu Tên+Loại nằm trong blacklist (chặn bản trùng ID khác)
    const rName = String(remote[`${MSSV}_Name`] || remote[`${MSSV}_name`] || remote.BIT240060_Name || remote.BIT240060_name || remote.name || '').trim().toLowerCase();
    const rCat = String(remote[`${MSSV}_DishCategoryId`] || remote[`${MSSV}_dishCategoryId`] || remote.BIT240060_DishCategoryId || remote.dishCategoryId || remote.categoryId || '');
    const rNameCatKey = rName && rCat ? `${rName}__${rCat}` : null;
    if (rNameCatKey && deletedNameCatSet.has(rNameCatKey)) {
      continue;
    }

    // Bỏ qua nếu đang có lệnh DELETE chưa đồng bộ cho món này
    if (pendingDeleteIds.some((dId) => isSameDishId(dId, rId))) {
      continue;
    }

    // Nếu có pending update trong queue, áp dụng update
    const pendingKey = Object.keys(pendingUpdates).find((uId) => isSameDishId(uId, rId));
    if (pendingKey) {
      mergedList.push({
        ...remote,
        ...pendingUpdates[pendingKey],
      });
      continue;
    }

    // Giữ lại phiên bản local nếu local có chỉnh sửa mới hơn
    const localMatch = (localDishes || []).find((loc) => {
      const lId = loc[`${MSSV}_Id`] || loc.id;
      return isSameDishId(lId, rId);
    });

    if (localMatch) {
      mergedList.push({
        ...remote,
        ...localMatch,
      });
    } else {
      mergedList.push(remote);
    }
  }

  // Thêm các món local chưa có trong remote (bao gồm cả temp_... và các món lưu cục bộ)
  for (const loc of (localDishes || [])) {
    const lId = loc[`${MSSV}_Id`] || loc.id;
    const cleanLocId = String(lId).replace(/^dish_/, '');
    if (normalizedDeletedIds.includes(cleanLocId)) continue;
    const isDeleted = pendingDeleteIds.some((dId) => isSameDishId(dId, lId));
    if (isDeleted) continue;

    const locName = String(loc[`${MSSV}_Name`] || loc.name || '').trim().toLowerCase();
    const locCat = String(loc[`${MSSV}_DishCategoryId`] || loc.categoryId || '');
    const locNameCatKey = locName && locCat ? `${locName}__${locCat}` : null;

    // Bỏ qua nếu đã nằm trong blacklist tên+loại
    if (locNameCatKey && deletedNameCatSet.has(locNameCatKey)) continue;

    // Tránh trùng lặp cả theo ID lẫn theo Tên món + Loại món
    const exists = mergedList.some((m) => {
      const mId = m[`${MSSV}_Id`] || m.id;
      if (isSameDishId(mId, lId)) return true;
      const mName = String(m[`${MSSV}_Name`] || m.name || '').trim().toLowerCase();
      const mCat = String(m[`${MSSV}_DishCategoryId`] || m.categoryId || '');
      return Boolean(locName && mName === locName && locCat && mCat === locCat);
    });

    if (!exists) {
      mergedList.push(loc);
    }
  }

  // Lọc trùng lặp tuyệt đối (Deduplication pass theo ID và theo Tên + Loại món)
  const seenIds = new Set();
  const seenNameCat = new Set();
  const uniqueList = [];

  for (const item of mergedList) {
    const idStr = String(item[`${MSSV}_Id`] || item[`${MSSV}_id`] || item.BIT240060_Id || item.BIT240060_id || item.id || item._id || '');
    const cleanId = idStr.replace(/^dish_/, '');
    const rawName = String(item[`${MSSV}_Name`] || item[`${MSSV}_name`] || item.BIT240060_Name || item.BIT240060_name || item.name || '').trim().toLowerCase();
    const rawCat = String(item[`${MSSV}_DishCategoryId`] || item[`${MSSV}_dishCategoryId`] || item.BIT240060_DishCategoryId || item.dishCategoryId || item.categoryId || '');
    const nameCatKey = rawName && rawCat ? `${rawName}__${rawCat}` : null;

    if (cleanId && seenIds.has(cleanId)) {
      continue;
    }
    if (nameCatKey && seenNameCat.has(nameCatKey)) {
      continue;
    }
    if (cleanId) seenIds.add(cleanId);
    if (nameCatKey) seenNameCat.add(nameCatKey);
    uniqueList.push(item);
  }

  return uniqueList;
};
