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
    const cleanId = String(BIT240060_Id || '');
    this[`${MSSV}_Id`] = cleanId;
    this[`${MSSV}_id`] = cleanId;
    this.BIT240060_Id = cleanId;
    this.BIT240060_id = cleanId;
    this.id = cleanId;

    const cleanName = String(BIT240060_Name || '').trim();
    this[`${MSSV}_Name`] = cleanName;
    this[`${MSSV}_name`] = cleanName;
    this.BIT240060_Name = cleanName;
    this.BIT240060_name = cleanName;
    this.name = cleanName;

    const cleanDesc = String(BIT240060_Description || '').trim();
    this[`${MSSV}_Description`] = cleanDesc;
    this[`${MSSV}_description`] = cleanDesc;
    this.BIT240060_Description = cleanDesc;
    this.BIT240060_description = cleanDesc;
    this.description = cleanDesc;
  }



  /**
   * Chuyển đổi đối tượng sang Plain JSON Object để lưu trữ hoặc gửi API
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      [`${MSSV}_Id`]: this[`${MSSV}_Id`],
      [`${MSSV}_id`]: this[`${MSSV}_Id`],
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
      BIT240060_Id:
        json[`${MSSV}_Id`] ||
        json[`${MSSV}_id`] ||
        json.BIT240060_Id ||
        json.BIT240060_id ||
        json.id ||
        json._id ||
        '',
      BIT240060_Name:
        json[`${MSSV}_Name`] ||
        json[`${MSSV}_name`] ||
        json.BIT240060_Name ||
        json.BIT240060_name ||
        json.name ||
        '',
      BIT240060_Description:
        json[`${MSSV}_Description`] ||
        json[`${MSSV}_description`] ||
        json.BIT240060_Description ||
        json.BIT240060_description ||
        json.description ||
        '',
    });
  }
}
