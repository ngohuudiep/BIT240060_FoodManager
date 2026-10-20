import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { isCategoryInUse } from '../utils/validation';
import { MSSV } from '../constants/config';

export const CategoryScreen = ({ onNavigate }) => {
  const { categories, dishes, addCategory, deleteCategory, t } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [catToDelete, setCatToDelete] = useState(null);
  const [inUseErrorMsg, setInUseErrorMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Đếm số món ăn đang thuộc từng loại
  const getDishCountForCategory = (catId) => {
    return dishes.filter((d) => {
      const dCatId = d.categoryId || d.BIT240060_DishCategoryId;
      return String(dCatId) === String(catId);
    }).length;
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên loại món');
      return;
    }

    // Kiểm tra tên trùng lặp
    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setError('Tên loại món này đã tồn tại trong danh mục!');
      return;
    }

    try {
      await addCategory({
        [`${MSSV}_Name`]: trimmed,
        [`${MSSV}_Description`]: description.trim(),
      });
      setName('');
      setDescription('');
      setError('');
      setShowAddForm(false);
    } catch (e) {
      Alert.alert(t('error'), e.message);
    }
  };

  const handleDeletePress = (cat) => {
    // RÀNG BUỘC NGHIỆP VỤ BẮT BUỘC:
    // Tuyệt đối không cho xóa loại món đang có món ăn sử dụng!
    const dishCount = getDishCountForCategory(cat.id);
    if (dishCount > 0 || isCategoryInUse(cat.id, dishes)) {
      setInUseErrorMsg(
        `Không thể xóa loại món "${cat.name}"!\n\nHiện đang có ${dishCount} món ăn thuộc loại món này. Bạn cần chuyển hoặc xóa các món ăn liên quan trước khi xóa loại món.`
      );
      return;
    }

    setCatToDelete(cat);
  };

  const handleConfirmDelete = async () => {
    if (catToDelete) {
      try {
        await deleteCategory(catToDelete.id);
        setCatToDelete(null);
      } catch (e) {
        setInUseErrorMsg(t(e.message) || e.message);
        setCatToDelete(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER & THÊM MỚI TOGGLE */}
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>{t('categoryManagement')}</Text>
        <TouchableOpacity
          style={styles.addToggleBtn}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addToggleBtnText}>
            {showAddForm ? '✕ ' + t('close') : '+ ' + t('addCategory')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FORM THÊM LOẠI MÓN MỚI */}
      {showAddForm && (
        <View style={styles.addFormBox}>
          <Text style={styles.formBoxTitle}>{t('addCategory')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('categoryName')}
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (error) setError('');
            }}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={[styles.input, styles.descInput]}
            placeholder={t('categoryDesc')}
            placeholderTextColor="#64748B"
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
            <Text style={styles.saveBtnText}>{t('save')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* DANH SÁCH LOẠI MÓN */}
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const dishCount = getDishCountForCategory(item.id);
          const inUse = dishCount > 0;

          return (
            <View style={styles.catCard}>
              <View style={styles.catInfo}>
                <Text style={styles.catName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.catDesc}>{item.description}</Text>
                ) : null}
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {dishCount} món ăn liên kết {inUse ? '🔒' : '🔓'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.deleteBtn, inUse && styles.deleteBtnDisabled]}
                onPress={() => handleDeletePress(item)}
              >
                <Text style={[styles.deleteBtnText, inUse && styles.deleteBtnTextDisabled]}>
                  {t('delete')}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('noCategories')}</Text>
          </View>
        }
      />

      {/* POPUP XÁC NHẬN XÓA LOẠI MÓN */}
      <ConfirmModal
        visible={Boolean(catToDelete)}
        title={t('deleteConfirmTitle')}
        message={t('categoryDeleteConfirm')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCatToDelete(null)}
      />

      {/* POPUP CẢNH BÁO: KHÔNG CHO PHÉP XÓA LOẠI MÓN ĐANG ĐƯỢC SỬ DỤNG */}
      <ConfirmModal
        visible={Boolean(inUseErrorMsg)}
        title="⚠️ Không thể xóa loại món"
        message={inUseErrorMsg}
        confirmText="Đã hiểu"
        isAlert={true}
        onConfirm={() => setInUseErrorMsg('')}
        onCancel={() => setInUseErrorMsg('')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  addToggleBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addToggleBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  addFormBox: {
    backgroundColor: '#1E293B',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
    fontSize: 13,
  },
  descInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  catInfo: {
    flex: 1,
    marginRight: 12,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  catDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteBtnDisabled: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: '#475569',
  },
  deleteBtnText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 12,
  },
  deleteBtnTextDisabled: {
    color: '#64748B',
  },
  emptyBox: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
