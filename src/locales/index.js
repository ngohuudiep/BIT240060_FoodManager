import en from './en';
import vi from './vi';

export const translations = { en, vi };

/**
 * Hàm dịch chuỗi có hỗ trợ biến thay thế (parameter replacement)
 * Ví dụ: t('deleteConfirmMessage', { name: 'Phở bò' })
 */
export const translate = (lang, key, params = {}) => {
  const dict = translations[lang] || translations.en;
  let text = dict[key] || translations.en[key] || key;

  if (params && typeof params === 'object') {
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`%\\{${paramKey}\\}`, 'g'), params[paramKey]);
    });
  }

  return text;
};
