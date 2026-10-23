import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { DishCard } from '../components/DishCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { validatePriceRange, isSameCategoryId } from '../utils/validation';
import { MSSV } from '../constants/config';

export const DishListScreen = ({ onNavigate }) => {
  const {
    dishes,
    filteredDishes,
    categories,
    filters,
    updateFilters,
    resetFilters,
    deleteDish,
    restoreDefaultDishes,
    t,
  } = useApp();

  const [dishToDelete, setDishToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRangeError, setPriceRangeError] = useState(false);

  // Xử lý thay đổi khoảng giá với validation Min <= Max
  const handlePriceChange = (min, max) => {
    const isValid = validatePriceRange(min, max);
    setPriceRangeError(!isValid);
    updateFilters({ minPrice: min, maxPrice: max });
  };

  const handleConfirmDelete = async () => {
    if (dishToDelete) {
      const id = dishToDelete.id || dishToDelete[`${MSSV}_Id`] || dishToDelete.BIT240060_Id;
      setDishToDelete(null);
      if (id) {
        await deleteDish(id);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. THANH TÌM KIẾM THEO MỘT PHẦN TÊN MÓN */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor="#94A3B8"
            value={filters.searchQuery}
            onChangeText={(text) => updateFilters({ searchQuery: text })}
          />
          {filters.searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => updateFilters({ searchQuery: '' })}>
              <Text style={styles.clearSearchIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterToggleBtn, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            ⚙️ {t('filterTitle')} {showFilters ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. KHU VỰC BỘ LỌC ĐA ĐIỀU KIỆN (CATEGORY, ISAVAILABLE, KHOẢNG GIÁ, SẮP XẾP) */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {/* Lọc theo Loại món ăn */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>{t('categoryFilter')}</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    filters.selectedCategory === 'ALL' && styles.chipActive,
                  ]}
                  onPress={() => updateFilters({ selectedCategory: 'ALL' })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.selectedCategory === 'ALL' && styles.chipTextActive,
                    ]}
                  >
                    {t('allCategories')}
                  </Text>
                </TouchableOpacity>

                {categories.map((cat) => {
                  const catId = String(cat.id || cat[`${MSSV}_Id`] || cat.BIT240060_Id || '');
                  const isSelected = isSameCategoryId(filters.selectedCategory, catId);
                  const catName = cat.name || cat[`${MSSV}_Name`] || cat.BIT240060_Name || 'Loại món';
                  return (
                    <TouchableOpacity
                      key={catId}
                      style={[
                        styles.chip,
                        isSelected && styles.chipActive,
                      ]}
                      onPress={() => updateFilters({ selectedCategory: catId })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {catName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Lọc theo Trạng thái kinh doanh */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{t('statusFilter')}</Text>
            <View style={styles.chipRow}>
              {[
                { key: 'ALL', label: t('allStatus') },
                { key: 'AVAILABLE', label: t('onlyAvailable') },
                { key: 'UNAVAILABLE', label: t('onlyUnavailable') },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.chip,
                    filters.availabilityStatus === item.key && styles.chipActive,
                  ]}
                  onPress={() => updateFilters({ availabilityStatus: item.key })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.availabilityStatus === item.key && styles.chipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Lọc theo Khoảng giá (Min - Max) */}
          <View style={styles.priceRow}>
            <Text style={styles.filterLabel}>{t('priceRange')}</Text>
            <View style={styles.priceInputs}>
              <TextInput
                style={[styles.priceInput, priceRangeError && styles.priceInputError]}
                placeholder={t('minPrice')}
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={filters.minPrice}
                onChangeText={(text) => handlePriceChange(text, filters.maxPrice)}
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={[styles.priceInput, priceRangeError && styles.priceInputError]}
                placeholder={t('maxPrice')}
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={filters.maxPrice}
                onChangeText={(text) => handlePriceChange(filters.minPrice, text)}
              />
            </View>
          </View>
          {priceRangeError && (
            <Text style={styles.errorText}>⚠️ {t('valMinMaxPriceInvalid')} (Min ≤ Max)</Text>
          )}

          {/* Sắp xếp (Sort) */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>{t('sortBy')}</Text>
            <View style={styles.chipRow}>
              {[
                { key: 'DEFAULT', label: t('sortDefault') },
                { key: 'PRICE_ASC', label: t('sortPriceAsc') },
                { key: 'PRICE_DESC', label: t('sortPriceDesc') },
                { key: 'PREP_TIME_ASC', label: t('sortPrepTimeAsc') },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.chip,
                    filters.sortBy === item.key && styles.chipActive,
                  ]}
                  onPress={() => updateFilters({ sortBy: item.key })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.sortBy === item.key && styles.chipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nút reset bộ lọc */}
          <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
            <Text style={styles.resetBtnText}>↺ {t('clearFilter')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. THỐNG KÊ SỐ LƯỢNG MÓN VÀ NÚT THÊM MỚI */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          {t('totalDishes')}: <Text style={styles.countBold}>{filteredDishes.length}</Text>
        </Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onNavigate('DISH_CREATE')}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ {t('add')}</Text>
        </TouchableOpacity>
      </View>

      {/* 4. DANH SÁCH MÓN ĂN (FLATLIST) */}
      <FlatList
        data={filteredDishes}
        extraData={dishes}
        keyExtractor={(item) => String(item.id || item[`${MSSV}_Id`] || item[`${MSSV}_id`] || item.BIT240060_Id || item.BIT240060_id || item._id)}
        renderItem={({ item }) => {
          const itemId = item.id || item[`${MSSV}_Id`] || item[`${MSSV}_id`] || item.BIT240060_Id || item.BIT240060_id || item._id;
          return (
            <DishCard
              dish={item}
              onPress={() => onNavigate('DISH_DETAIL', { dishId: itemId })}
              onEdit={() => onNavigate('DISH_EDIT', { dishId: itemId })}
              onDelete={(dish) => setDishToDelete(dish)}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>
              {dishes.length === 0 ? 'Thực đơn chưa có món ăn nào' : t('emptyList')}
            </Text>
            <Text style={styles.emptyText}>
              {dishes.length === 0
                ? 'Hãy thêm món ăn đầu tiên để bắt đầu quản lý thực đơn.'
                : 'Không có món nào thỏa mãn các điều kiện tìm kiếm hoặc khoảng giá đã chọn.'}
            </Text>
            {dishes.length > 0 ? (
              <TouchableOpacity style={styles.emptyActionBtn} onPress={resetFilters}>
                <Text style={styles.emptyActionText}>↺ {t('clearFilter')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyActionsRow}>
                <TouchableOpacity
                  style={[styles.emptyActionBtn, styles.restoreDishesBtn]}
                  onPress={restoreDefaultDishes}
                >
                  <Text style={styles.emptyActionText}>↺ Khôi phục 8 món thực đơn</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => onNavigate('DISH_CREATE')}
                >
                  <Text style={styles.emptyActionText}>+ {t('add')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />

      {/* POPUP XÁC NHẬN XÓA MÓN ĂN */}
      <ConfirmModal
        visible={Boolean(dishToDelete)}
        title={t('deleteConfirmTitle')}
        message={
          dishToDelete
            ? t('deleteConfirmMessage', { name: dishToDelete.name })
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDishToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#1E293B',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  clearSearchIcon: {
    color: '#94A3B8',
    fontSize: 16,
    paddingHorizontal: 4,
  },
  filterToggleBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  filterToggleActive: {
    backgroundColor: '#0284C7',
  },
  filterToggleText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPanel: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterGroup: {
    marginBottom: 4,
  },
  filterRow: {
    marginVertical: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  chipText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  chipTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  priceRow: {
    marginVertical: 6,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 13,
  },
  priceSeparator: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  errorText: {
    color: '#F87171',
    fontSize: 11,
    marginTop: 4,
  },
  resetBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resetBtnText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  countBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  countBold: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  addBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  restoreDishesBtn: {
    backgroundColor: '#059669',
  },
  priceInputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
});
