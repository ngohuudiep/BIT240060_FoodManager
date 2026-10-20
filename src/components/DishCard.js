import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useApp } from '../context/AppContext';

export const DishCard = ({ dish, onPress, onEdit, onDelete }) => {
  const { categories, t } = useApp();
  const [imageError, setImageError] = useState(false);

  // Tìm tên danh mục tương ứng
  const category = categories.find(
    (c) => String(c.id) === String(dish.categoryId)
  );

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

  return (
    <TouchableOpacity
      style={[styles.card, !dish.isAvailable && styles.cardUnavailable]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageError ? fallbackImage : dish.thumbnailUrl }}
          style={styles.thumbnail}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
        {/* Nhãn thời gian chế biến: Quick <= 15m hoặc Regular > 15m */}
        <View
          style={[
            styles.timeBadge,
            dish.isQuick ? styles.quickBadge : styles.regularBadge,
          ]}
        >
          <Text style={styles.timeBadgeText}>
            ⏱ {dish.isQuick ? t('quick') : t('regular')} ({dish.preparationTime}{t('minutes')})
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.dishName} numberOfLines={1}>
            {dish.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              dish.isAvailable ? styles.availableBadge : styles.unavailableBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                dish.isAvailable ? styles.availableText : styles.unavailableText,
              ]}
            >
              {dish.isAvailable ? t('available') : t('unavailable')}
            </Text>
          </View>
        </View>

        {category && (
          <Text style={styles.categoryName} numberOfLines={1}>
            📂 {category.name}
          </Text>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.price}>
            {Number(dish.price).toLocaleString()} đ
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={(e) => {
                e.stopPropagation();
                onEdit(dish);
              }}
            >
              <Text style={styles.actionBtnText}>{t('edit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={(e) => {
                e.stopPropagation();
                onDelete(dish);
              }}
            >
              <Text style={styles.deleteBtnText}>{t('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    marginTop: 4,
    paddingTop: 8,
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
