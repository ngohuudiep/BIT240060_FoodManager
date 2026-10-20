import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { validateDish } from '../utils/validation';
import { MSSV } from '../constants/config';

export const DishFormScreen = ({ dishId, onNavigate }) => {
  const { dishes, categories, addDish, updateDish, t } = useApp();
  const isEditing = Boolean(dishId);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Tìm món cũ nếu là màn hình chỉnh sửa
  const existingDish = isEditing ? dishes.find((d) => String(d.id) === String(dishId)) : null;

  // Nạp dữ liệu cũ nếu là chỉnh sửa
  useEffect(() => {
    if (isEditing) {
      if (existingDish) {
        setName(existingDish.name);
        setPrice(String(existingDish.price));
        setPrepTime(String(existingDish.preparationTime));
        setCategoryId(String(existingDish.categoryId));
        setIsAvailable(existingDish.isAvailable);
        setDescription(existingDish.description || '');
        setImages(existingDish.images ? [...existingDish.images] : []);
      }
    } else {
      // Mặc định chọn category đầu tiên nếu có
      if (categories.length > 0) {
        setCategoryId(String(categories[0].id));
      }
    }
  }, [dishId, isEditing, existingDish, categories]);

  // Xử lý khi ID không tồn tại trong chế độ chỉnh sửa
  if (isEditing && !existingDish) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundEmoji}>⚠️</Text>
        <Text style={styles.notFoundTitle}>Món ăn không tồn tại</Text>
        <Text style={styles.notFoundMessage}>
          Không tìm thấy món ăn với mã ID "{dishId || 'N/A'}" để chỉnh sửa.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => onNavigate('DISH_LIST')}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>← Quay lại danh sách thực đơn</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Thêm ảnh mới từ URL với validation
  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) {
      setImageError('Vui lòng nhập đường dẫn URL ảnh.');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setImageError('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    setImageError('');

    // Nếu là ảnh đầu tiên thì tự động đặt làm Thumbnail
    const isFirstImage = images.length === 0;

    const newImageItem = {
      [`${MSSV}_ImageUrl`]: url,
      [`${MSSV}_IsThumbnail`]: isFirstImage,
    };

    setImages([...images, newImageItem]);
    setNewImageUrl('');
  };

  // Chọn ảnh làm Thumbnail (Đảm bảo tối đa 01 ảnh có IsThumbnail = true)
  const handleSetThumbnail = (indexToSet) => {
    const updated = images.map((img, idx) => ({
      ...img,
      [`${MSSV}_IsThumbnail`]: idx === indexToSet,
    }));
    setImages(updated);
  };

  // Xóa ảnh khỏi mảng
  const handleRemoveImage = (indexToRemove) => {
    const wasThumb = images[indexToRemove]?.[`${MSSV}_IsThumbnail`];
    const filtered = images.filter((_, idx) => idx !== indexToRemove);

    // Nếu ảnh vừa xóa là Thumbnail và vẫn còn ảnh khác, đặt ảnh đầu tiên làm thumbnail
    if (wasThumb && filtered.length > 0) {
      filtered[0][`${MSSV}_IsThumbnail`] = true;
    }

    setImages(filtered);
  };

  // Xử lý gửi Form & Ràng buộc dữ liệu (Validation)
  const handleSubmit = async () => {
    const payload = {
      [`${MSSV}_Name`]: name,
      [`${MSSV}_Price`]: Number(price),
      [`${MSSV}_PreparationTime`]: parseInt(prepTime, 10),
      [`${MSSV}_IsAvailable`]: isAvailable,
      [`${MSSV}_Description`]: description,
      [`${MSSV}_DishCategoryId`]: categoryId,
      [`${MSSV}_DishImage`]: images,
    };

    // Kiểm tra các ràng buộc: Name, Price, PrepTime, Category, Unique name in category
    const validation = validateDish(payload, dishes, isEditing ? dishId : null);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      if (isEditing) {
        await updateDish(dishId, payload);
      } else {
        await addDish(payload);
      }

      onNavigate('DISH_LIST');
    } catch (e) {
      console.error('Error saving dish:', e);
      Alert.alert(t('error'), e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.formHeaderTitle}>
          {isEditing ? t('editDishTitle') : t('createDishTitle')}
        </Text>

        {/* 1. TÊN MÓN ĂN */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('dishNameLabel')} <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder={t('dishNamePlaceholder')}
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: null });
            }}
          />
          {errors.name && <Text style={styles.errorText}>{t(errors.name)}</Text>}
        </View>

        {/* 2. CHỌN LOẠI MÓN ĂN (CATEGORY DROPDOWN/CHIPS) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {t('categoryLabel')} <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.categoryChips}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  categoryId === String(cat.id) && styles.categoryChipSelected,
                ]}
                onPress={() => {
                  setCategoryId(String(cat.id));
                  if (errors.categoryId) setErrors({ ...errors, categoryId: null });
                }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    categoryId === String(cat.id) && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.categoryId && (
            <Text style={styles.errorText}>{t(errors.categoryId)}</Text>
          )}
        </View>

        {/* 3. GIÁ BÁN & THỜI GIAN CHẾ BIẾN (ROW) */}
        <View style={styles.row}>
          {/* Giá tiền */}
          <View style={[styles.inputGroup, styles.halfCol]}>
            <Text style={styles.label}>
              {t('priceLabel')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder={t('pricePlaceholder')}
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) setErrors({ ...errors, price: null });
              }}
            />
            {errors.price && (
              <Text style={styles.errorText}>{t(errors.price)}</Text>
            )}
          </View>

          {/* Thời gian chế biến */}
          <View style={[styles.inputGroup, styles.halfCol]}>
            <Text style={styles.label}>
              {t('prepTimeLabel')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.preparationTime && styles.inputError]}
              placeholder={t('prepTimePlaceholder')}
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={prepTime}
              onChangeText={(text) => {
                setPrepTime(text);
                if (errors.preparationTime)
                  setErrors({ ...errors, preparationTime: null });
              }}
            />
            {errors.preparationTime && (
              <Text style={styles.errorText}>{t(errors.preparationTime)}</Text>
            )}
          </View>
        </View>

        {/* 4. TRẠNG THÁI KINH DOANH (ISAVAILABLE TOGGLE) */}
        <View style={styles.switchGroup}>
          <View>
            <Text style={styles.label}>{t('statusLabel')}</Text>
            <Text style={styles.switchSubtitle}>
              {isAvailable ? t('available') : t('unavailable')}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#334155', true: '#0284C7' }}
            thumbColor={isAvailable ? '#38BDF8' : '#94A3B8'}
          />
        </View>

        {/* 5. MÔ TẢ CHI TIẾT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('descriptionLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('descriptionPlaceholder')}
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* 6. QUẢN LÝ DANH SÁCH ẢNH (IMAGEURL & THUMBNAIL) */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>{t('imagesSection')}</Text>

          {/* Ô nhập liên kết ảnh */}
          <View style={styles.addImageRow}>
            <TextInput
              style={[styles.input, styles.imageInput]}
              placeholder={t('imageUrlPlaceholder')}
              placeholderTextColor="#64748B"
              value={newImageUrl}
              onChangeText={setNewImageUrl}
            />
            <TouchableOpacity
              style={styles.addImageBtn}
              onPress={handleAddImage}
              activeOpacity={0.8}
            >
              <Text style={styles.addImageBtnText}>{t('addImageBtn')}</Text>
            </TouchableOpacity>
          </View>
          {imageError ? <Text style={styles.errorText}>{imageError}</Text> : null}

          {/* Danh sách ảnh đã thêm */}
          {images.map((img, idx) => {
            const isThumb = Boolean(img[`${MSSV}_IsThumbnail`]);
            return (
              <View key={idx} style={styles.imageItemRow}>
                <Image
                  source={{ uri: img[`${MSSV}_ImageUrl`] }}
                  style={styles.imagePreview}
                />
                <View style={styles.imageItemInfo}>
                  <Text
                    style={styles.imageUrlText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {img[`${MSSV}_ImageUrl`]}
                  </Text>
                  <View style={styles.thumbRadioRow}>
                    <TouchableOpacity
                      style={[
                        styles.thumbRadioBtn,
                        isThumb && styles.thumbRadioBtnActive,
                      ]}
                      onPress={() => handleSetThumbnail(idx)}
                    >
                      <Text
                        style={[
                          styles.thumbRadioText,
                          isThumb && styles.thumbRadioTextActive,
                        ]}
                      >
                        {isThumb ? '★ ' + t('thumbnailBadge') : t('setThumbnail')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => handleRemoveImage(idx)}
                    >
                      <Text style={styles.removeImageText}>{t('removeImage')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* 7. NÚT SUBMIT / CANCEL */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => onNavigate('DISH_LIST')}
            disabled={submitting}
          >
            <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? '...' : t('save')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 4,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  categoryChipText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imageSection: {
    marginTop: 6,
    marginBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  addImageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  imageInput: {
    flex: 1,
  },
  addImageBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
  },
  addImageBtnText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
  imageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#0F172A',
  },
  imageItemInfo: {
    flex: 1,
  },
  imageUrlText: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 6,
  },
  thumbRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbRadioBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  thumbRadioBtnActive: {
    backgroundColor: '#EAB308',
  },
  thumbRadioText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  thumbRadioTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  removeImageBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeImageText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 15,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0F172A',
  },
  notFoundEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  notFoundMessage: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#38BDF8',
    fontWeight: '600',
  },
});
