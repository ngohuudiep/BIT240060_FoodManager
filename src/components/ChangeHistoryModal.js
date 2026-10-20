/**
 * MODAL HIỂN THỊ LỊCH SỬ THAY ĐỔI & TIẾN TRÌNH ĐỒNG BỘ
 * Cho phép người dùng bấm vào thanh đồng bộ / trạng thái để xem toàn bộ lịch sử thay đổi:
 * - Món nào đã được thêm mới, sửa, xóa
 * - Chi tiết các trường thay đổi (Giá cũ -> mới, Trạng thái, v.v.)
 * - Thời gian thao tác cụ thể
 * - Trạng thái đã đồng bộ lên MockAPI hay đang chờ đồng bộ
 */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { historyService } from '../services/historyService';
import { useApp } from '../context/AppContext';

export const ChangeHistoryModal = ({
  visible,
  onClose,
  targetDishId = null,
  targetDishName = null,
}) => {
  const { isOnline, isSyncing, triggerAutoSync, t } = useApp();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'SYNCED'

  const loadData = async () => {
    setLoading(true);
    try {
      const data = targetDishId
        ? await historyService.getHistoryByDishId(targetDishId)
        : await historyService.getHistory();
      setHistoryList(data);
    } catch (e) {
      console.error('Error loading history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, targetDishId, isSyncing]);

  const handleSyncNow = async () => {
    await triggerAutoSync();
    await loadData();
  };

  const handleClearHistory = () => {
    const performClear = async () => {
      await historyService.clearHistory();
      setHistoryList([]);
    };

    Alert.alert(
      'Xóa lịch sử',
      'Bạn có chắc muốn xóa sạch toàn bộ nhật ký thay đổi này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa sạch', style: 'destructive', onPress: performClear },
      ]
    );
  };

  // Lọc theo tab
  const filteredList = historyList.filter((item) => {
    if (activeFilter === 'PENDING') return item.status === 'PENDING';
    if (activeFilter === 'SYNCED') return item.status === 'SYNCED';
    return true;
  });

  const pendingCount = historyList.filter((item) => item.status === 'PENDING').length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* 1. HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>📋 Lịch sử thay đổi</Text>
              <Text style={styles.headerSubtitle}>
                {targetDishName
                  ? `Món: ${targetDishName}`
                  : `Tổng cộng ${historyList.length} lượt thay đổi dữ liệu`}
              </Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 2. STATS & BỘ LỌC TABS */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeFilter === 'ALL' && styles.tabBtnActive]}
              onPress={() => setActiveFilter('ALL')}
            >
              <Text style={[styles.tabText, activeFilter === 'ALL' && styles.tabTextActive]}>
                Tất cả ({historyList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeFilter === 'PENDING' && styles.tabBtnActive]}
              onPress={() => setActiveFilter('PENDING')}
            >
              <Text style={[styles.tabText, activeFilter === 'PENDING' && styles.tabTextActive]}>
                ⏳ Chờ đồng bộ ({pendingCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeFilter === 'SYNCED' && styles.tabBtnActive]}
              onPress={() => setActiveFilter('SYNCED')}
            >
              <Text style={[styles.tabText, activeFilter === 'SYNCED' && styles.tabTextActive]}>
                ✅ Đã đồng bộ ({historyList.length - pendingCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3. DANH SÁCH LỊCH SỬ THAY ĐỔI */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#38BDF8" />
              <Text style={styles.loadingText}>Đang tải nhật ký...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => {
                const isCreate = item.action === 'CREATE';
                const isUpdate = item.action === 'UPDATE';
                const isDelete = item.action === 'DELETE';
                const isSynced = item.status === 'SYNCED';

                return (
                  <View style={styles.itemCard}>
                    {/* Header mục lịch sử */}
                    <View style={styles.itemHeader}>
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.actionBadge,
                            isCreate && styles.badgeCreate,
                            isUpdate && styles.badgeUpdate,
                            isDelete && styles.badgeDelete,
                          ]}
                        >
                          <Text style={styles.actionBadgeText}>
                            {isCreate && '+ Thêm mới'}
                            {isUpdate && '✎ Cập nhật'}
                            {isDelete && '🗑 Đã xóa'}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.syncStatusBadge,
                            isSynced ? styles.badgeSynced : styles.badgePending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.syncStatusText,
                              isSynced ? styles.textSynced : styles.textPending,
                            ]}
                          >
                            {isSynced ? '● Đã đồng bộ' : '● Chờ đồng bộ'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.timeText}>{item.timeFormatted}</Text>
                    </View>

                    {/* Tên đối tượng */}
                    <Text style={styles.targetName}>
                      {item.targetType === 'CATEGORY' ? '📂 [Loại món] ' : '🍲 '}
                      {item.targetName}
                    </Text>

                    {/* Mô tả tóm tắt */}
                    <Text style={styles.detailsText}>{item.details}</Text>

                    {/* Chi tiết từng trường thay đổi (nếu có diff) */}
                    {item.changes && item.changes.length > 0 && (
                      <View style={styles.diffBox}>
                        {item.changes.map((diff, idx) => (
                          <View key={idx} style={styles.diffRow}>
                            <Text style={styles.diffLabel}>{diff.label}:</Text>
                            <View style={styles.diffValues}>
                              <Text style={styles.diffOld}>{diff.oldVal}</Text>
                              <Text style={styles.diffArrow}>→</Text>
                              <Text style={styles.diffNew}>{diff.newVal}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.centerBox}>
                  <Text style={styles.emptyEmoji}>📜</Text>
                  <Text style={styles.emptyTitle}>Chưa có lịch sử thay đổi</Text>
                  <Text style={styles.emptySubtitle}>
                    Mọi thao tác thêm mới, chỉnh sửa, hoặc xóa món ăn sẽ được tự động ghi nhận tại đây.
                  </Text>
                </View>
              }
            />
          )}

          {/* 4. FOOTER THAO TÁC */}
          <View style={styles.footer}>
            {pendingCount > 0 && isOnline && (
              <TouchableOpacity
                style={styles.syncNowBtn}
                onPress={handleSyncNow}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.syncNowBtnText}>↻ Đồng bộ ngay ({pendingCount})</Text>
                )}
              </TouchableOpacity>
            )}

            {historyList.length > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearHistory}
              >
                <Text style={styles.clearBtnText}>Xóa nhật ký</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: '100%',
    maxWidth: 540,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  tabBtnActive: {
    backgroundColor: '#0284C7',
  },
  tabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    padding: 14,
  },
  centerBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#94A3B8',
    fontSize: 13,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  itemCard: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeCreate: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  badgeUpdate: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  badgeDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  syncStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSynced: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  badgePending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  syncStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  textSynced: {
    color: '#34D399',
  },
  textPending: {
    color: '#FBBF24',
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
  },
  targetName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  diffBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 4,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  diffLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  diffValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  diffOld: {
    fontSize: 11,
    color: '#EF4444',
    textDecorationLine: 'line-through',
  },
  diffArrow: {
    fontSize: 11,
    color: '#64748B',
  },
  diffNew: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1E293B',
    justifyContent: 'flex-end',
    gap: 8,
  },
  syncNowBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  syncNowBtnText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
  },
  clearBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  clearBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
  },
  doneBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
