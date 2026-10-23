import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useApp } from '../context/AppContext';
import { MSSV } from '../constants/config';
import { isSameCategoryId } from '../utils/validation';

export const DishCard = ({ dish, onPress, onEdit, onDelete }) => {
  const { categories, t } = useApp();
  const [imageError, setImageError] = useState(false);
  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

  // Lấy các trường an toàn tương thích cả Plain Object lẫn DishModel Instance
  const dishId = dish.id || dish[`${MSSV}_Id`] || dish[`${MSSV}_id`] || dish.BIT240060_Id || dish.BIT240060_id || dish._id;
  const dishName = dish.name || dish[`${MSSV}_Name`] || dish[`${MSSV}_name`] || dish.BIT240060_Name || dish.BIT240060_name || 'Món ăn';
  const dishPrice = dish.price ?? dish[`${MSSV}_Price`] ?? dish[`${MSSV}_price`] ?? dish.BIT240060_Price ?? 0;
  const dishPrepTime = dish.preparationTime ?? dish[`${MSSV}_PreparationTime`] ?? dish[`${MSSV}_preparationTime`] ?? dish.BIT240060_PreparationTime ?? 0;
  const dishIsAvailable = dish.isAvailable ?? dish[`${MSSV}_IsAvailable`] ?? dish[`${MSSV}_isAvailable`] ?? dish.BIT240060_IsAvailable ?? true;
  const dishCategoryId = dish.categoryId || dish.dishCategoryId || dish[`${MSSV}_DishCategoryId`] || dish[`${MSSV}_dishCategoryId`] || dish.BIT240060_DishCategoryId;
  const dishIsQuick = dish.isQuick ?? (dishPrepTime <= 15);

  const rawImages = dish.images || dish.dishImage || dish[`${MSSV}_DishImage`] || dish[`${MSSV}_dishImage`] || dish.BIT240060_DishImage || [];
  const foundThumb = Array.isArray(rawImages) ? rawImages.find((img) => img && (img[`${MSSV}_IsThumbnail`] || img.isThumbnail || img.BIT240060_IsThumbnail)) : null;
  const firstImg = Array.isArray(rawImages) && rawImages[0] ? rawImages[0] : null;
  const dishThumbUrl =
    (foundThumb && (foundThumb[`${MSSV}_ImageUrl`] || foundThumb.imageUrl || foundThumb.url || foundThumb.BIT240060_ImageUrl)) ||
    dish.thumbnailUrl ||
    (firstImg && (firstImg[`${MSSV}_ImageUrl`] || firstImg.imageUrl || firstImg.url || firstImg.BIT240060_ImageUrl)) ||
    fallbackImage;

  useEffect(() => {
    setImageError(false);
  }, [dishThumbUrl]);

  // Tìm tên danh mục tương ứng
  const category = categories.find(
    (c) => isSameCategoryId(c.id || c[`${MSSV}_Id`] || c[`${MSSV}_id`] || c.BIT240060_Id, dishCategoryId)
  );
  const categoryDisplayName = category
    ? (category.name || category[`${MSSV}_Name`] || category.BIT240060_Name || 'Loại món')
    : (dishCategoryId ? `Loại ${dishCategoryId}` : 'Món chính');

  return (
    <View style={[styles.card, !dishIsAvailable && styles.cardUnavailable]}>
      {/* 1. Vùng bấm xem chi tiết món ăn (Ảnh, Tên món, Danh mục, Trạng thái) */}
      <TouchableOpacity
        style={styles.clickableArea}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageError ? fallbackImage : dishThumbUrl }}
            style={styles.thumbnail}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
          {/* Nhãn thời gian chế biến: Quick <= 15m hoặc Regular > 15m */}
          <View
            style={[
              styles.timeBadge,
              dishIsQuick ? styles.quickBadge : styles.regularBadge,
            ]}
          >
            <Text style={styles.timeBadgeText}>
              ⏱ {dishIsQuick ? t('quick') : t('regular')} ({dishPrepTime}{t('minutes')})
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.dishName} numberOfLines={1}>
              {dishName}
            </Text>
            <View
              style={[
                styles.statusBadge,
                dishIsAvailable ? styles.availableBadge : styles.unavailableBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  dishIsAvailable ? styles.availableText : styles.unavailableText,
                ]}
              >
                {dishIsAvailable ? t('available') : t('unavailable')}
              </Text>
            </View>
          </View>

          <Text style={styles.categoryName} numberOfLines={1}>
            📂 {categoryDisplayName}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 2. Thanh hiển thị Giá và Nút chức năng (Tách rời, không lồng trong TouchableOpacity) */}
      <View style={styles.footerRow}>
        <Text style={styles.price}>
          {Number(dishPrice).toLocaleString()} đ
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEdit && onEdit(dish)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnText}>{t('edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDelete && onDelete(dish)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteBtnText}>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardUnavailable: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  timeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)', // Emerald
  },
  regularBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)', // Blue
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dishName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  availableBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  unavailableBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  availableText: {
    color: '#34D399',
  },
  unavailableText: {
    color: '#F87171',
  },
  categoryName: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#38BDF8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#334155',
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteBtnText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
});
