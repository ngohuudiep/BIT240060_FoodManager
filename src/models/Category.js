/**
 * MODEL: BIT240060_DishCategory
 * Định nghĩa cấu trúc dữ liệu cho Loại món ăn theo yêu cầu đề thi
 */
import { MSSV } from '../constants/config';

export class DishCategoryModel {
  constructor({
    BIT240060_Id = '',
    BIT240060_Name = '',
    BIT240060_Description = '',
  } = {}) {
    this[`${MSSV}_Id`] = String(BIT240060_Id || '');
    this[`${MSSV}_Name`] = String(BIT240060_Name || '').trim();
    this[`${MSSV}_Description`] = String(BIT240060_Description || '').trim();
  }

  get id() {
    return this[`${MSSV}_Id`];
  }

  get name() {
    return this[`${MSSV}_Name`];
  }

  get description() {
    return this[`${MSSV}_Description`];
  }

  /**
   * Chuyển đổi đối tượng sang Plain JSON Object để lưu trữ hoặc gửi API
   */
  toJSON() {
    return {
      [`${MSSV}_Id`]: this[`${MSSV}_Id`],
      [`${MSSV}_Name`]: this[`${MSSV}_Name`],
      [`${MSSV}_Description`]: this[`${MSSV}_Description`],
    };
  }

  /**
   * Tạo instance từ đối tượng dữ liệu API hoặc local
   */
  static fromJSON(json) {
    if (!json) return null;
    return new DishCategoryModel({
      BIT240060_Id: json[`${MSSV}_Id`] || json.id || json.BIT240060_Id,
      BIT240060_Name: json[`${MSSV}_Name`] || json.name || json.BIT240060_Name,
      BIT240060_Description: json[`${MSSV}_Description`] || json.description || json.BIT240060_Description,
    });
  }
}
