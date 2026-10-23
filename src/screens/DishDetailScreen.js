import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { ChangeHistoryModal } from '../components/ChangeHistoryModal';
import { MSSV } from '../constants/config';
import { dishService } from '../services/dishService';
import { isSameCategoryId } from '../utils/validation';

export const DishDetailScreen = ({ dishId, onNavigate }) => {
  const { dishes, categories, deleteDish, t } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMainImageError(false);
  }, [selectedImageIndex, dishId]);

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';

  // Tìm món ăn theo dishId linh hoạt
  const dish = dishes.find((d) => {
    const idA = d.id || d[`${MSSV}_Id`] || d[`${MSSV}_id`] || d.BIT240060_Id || d.BIT240060_id;
    return dishService.isSameId(idA, dishId);
  });

  // Khi đang trong quá trình xóa, không hiển thị màn hình lỗi tránh nhấp nháy UI
  if (isDeleting) {
    return null;
  }

  // Xử lý khi ID không tồn tại
  if (!dish) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Không tìm thấy món ăn</Text>
        <Text style={styles.errorMessage}>
          Món ăn với ID "{dishId || 'N/A'}" không tồn tại hoặc đã bị xóa khỏi hệ thống.
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

  const dishCatId = dish.categoryId || dish.dishCategoryId || dish[`${MSSV}_DishCategoryId`];
  const category = categories.find((c) => {
    const cId = c.id || c[`${MSSV}_Id`] || c[`${MSSV}_id`] || c.BIT240060_Id;
    return isSameCategoryId(cId, dishCatId);
  });
  const categoryDisplayName = category
    ? (category.name || category[`${MSSV}_Name`] || category.BIT240060_Name || 'Loại món')
    : (dishCatId ? `Loại ${dishCatId}` : 'Món chính');

  const images = dish.images && dish.images.length > 0 ? dish.images : [];
  const rawPreviewUrl =
    images[selectedImageIndex]?.[`${MSSV}_ImageUrl`] ||
    dish.thumbnailUrl;
  const currentPreviewUrl = (mainImageError || !rawPreviewUrl) ? fallbackImage : rawPreviewUrl;

  const handleDelete = async () => {
    const idToDelete = dish ? (dish.id || dish[`${MSSV}_Id`]) : dishId;
    setIsDeleting(true);
    setShowDeleteModal(false);
    onNavigate('DISH_LIST');
    if (idToDelete) {
      await deleteDish(idToDelete);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. KHU VỰC HIỂN THỊ ẢNH CHÍNH (PREVIEW) */}
        <View style={styles.mainImageWrapper}>
          <Image
            source={{ uri: currentPreviewUrl }}
            style={styles.mainImage}
            resizeMode="cover"
            onError={() => setMainImageError(true)}
          />

          {/* Gắn thẻ thời gian chế biến: Quick (<= 15p) hoặc Regular (> 15p) */}
          <View
            style={[
              styles.timeBadge,
              dish.isQuick ? styles.quickBadge : styles.regularBadge,
            ]}
          >
            <Text style={styles.timeBadgeText}>
              ⏱ {dish.isQuick ? t('quick') : t('regular')} ({dish.preparationTime} {t('minutes')})
            </Text>
          </View>

          {/* Huy hiệu ảnh đại diện (Thumbnail) */}
          {images[selectedImageIndex]?.[`${MSSV}_IsThumbnail`] && (
            <View style={styles.thumbIndicator}>
              <Text style={styles.thumbIndicatorText}>★ {t('thumbnailBadge')}</Text>
            </View>
          )}
        </View>

        {/* 2. BỘ SƯU TẬP NHIỀU ẢNH (IMAGE GALLERY CAROUSEL/STRIP) */}
        {images.length > 0 ? (
          <View style={styles.gallerySection}>
            <Text style={styles.sectionSubtitle}>{t('images')} ({images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
              {images.map((img, index) => {
                const isSelected = index === selectedImageIndex;
                const isThumb = Boolean(img[`${MSSV}_IsThumbnail`] || img.isThumbnail || img.BIT240060_IsThumbnail);
                const imgUri = img[`${MSSV}_ImageUrl`] || img.imageUrl || img.BIT240060_ImageUrl || img.url || '';
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.thumbBox,
                      isSelected && styles.thumbBoxSelected,
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      source={{ uri: imgUri }}
                      style={styles.thumbImg}
                    />
                    {isThumb && (
                      <View style={styles.thumbSmallBadge}>
                        <Text style={styles.thumbSmallText}>★</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.noImagesBox}>
            <Text style={styles.noImagesText}>{t('noImages')}</Text>
          </View>
        )}

        {/* 3. THÔNG TIN CHI TIẾT MÓN ĂN */}
        <View style={styles.detailsCard}>
          <View style={styles.headerInfo}>
            <Text style={styles.dishTitle}>{dish.name}</Text>
            <Text style={styles.priceTag}>
              {Number(dish.price).toLocaleString()} đ
            </Text>
          </View>

          <View style={styles.metaRow}>
            {/* Loại món */}
            <View style={styles.metaPill}>
              <Text style={styles.metaPillLabel}>{t('category')}:</Text>
              <Text style={styles.metaPillValue}>
                {categoryDisplayName}
              </Text>
            </View>

            {/* Trạng thái kinh doanh */}
            <View
              style={[
                styles.statusPill,
                dish.isAvailable ? styles.statusAvailable : styles.statusUnavailable,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  dish.isAvailable ? styles.textAvailable : styles.textUnavailable,
                ]}
              >
                ● {dish.isAvailable ? t('available') : t('unavailable')}
              </Text>
            </View>
          </View>

          {/* Mô tả chi tiết */}
          <View style={styles.descBlock}>
            <Text style={styles.descHeading}>{t('description')}</Text>
            <Text style={styles.descContent}>
              {dish.description || 'Không có mô tả chi tiết cho món ăn này.'}
            </Text>
          </View>

          {/* Dữ liệu ID và MSSV đối soát */}
          <View style={styles.idBox}>
            <Text style={styles.idLabel}>ID Hệ thống:</Text>
            <Text style={styles.idValue}>{dish.id}</Text>
          </View>

          {/* NÚT BẤM VÀO ĐỂ XEM LỊCH SỬ THAY ĐỔI CỦA MÓN NÀY */}
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => setShowHistoryModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.historyBtnText}>📋 Xem lịch sử thay đổi của món này</Text>
          </TouchableOpacity>
        </View>

        {/* 4. NÚT THAO TÁC (CHỈNH SỬA / XÓA) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onNavigate('DISH_EDIT', { dishId: dish.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>✎ {t('edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>🗑 {t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* POPUP XÁC NHẬN XÓA */}
      <ConfirmModal
        visible={showDeleteModal}
        title={t('deleteConfirmTitle')}
        message={t('deleteConfirmMessage', { name: dish.name })}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* MODAL XEM LỊCH SỬ THAY ĐỔI */}
      <ChangeHistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        targetDishId={dish.id}
        targetDishName={dish.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 260,
    backgroundColor: '#0F172A',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  regularBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  thumbIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  thumbIndicatorText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 11,
  },
  gallerySection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  thumbRow: {
    flexDirection: 'row',
  },
  thumbBox: {
    width: 65,
    height: 65,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
    position: 'relative',
  },
  thumbBoxSelected: {
    borderColor: '#38BDF8',
    borderWidth: 3,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbSmallBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#EAB308',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbSmallText: {
    color: '#000',
    fontSize: 9,
    fontWeight: 'bold',
  },
  noImagesBox: {
    padding: 16,
  },
  noImagesText: {
    color: '#64748B',
    fontStyle: 'italic',
    fontSize: 13,
  },
  detailsCard: {
    backgroundColor: '#1E293B',
    margin: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerInfo: {
    marginBottom: 12,
  },
  dishTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  priceTag: {
    fontSize: 22,
    fontWeight: '800',
    color: '#38BDF8',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metaPillLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginRight: 4,
  },
  metaPillValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusAvailable: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  statusUnavailable: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textAvailable: {
    color: '#34D399',
  },
  textUnavailable: {
    color: '#F87171',
  },
  descBlock: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  descHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  descContent: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
  },
  idBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  idLabel: {
    fontSize: 11,
    color: '#64748B',
    marginRight: 6,
  },
  idValue: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  historyBtn: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    alignItems: 'center',
  },
  historyBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0F172A',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
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
