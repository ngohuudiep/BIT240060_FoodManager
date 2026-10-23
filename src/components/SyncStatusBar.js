import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';
import { ChangeHistoryModal } from './ChangeHistoryModal';

export const SyncStatusBar = () => {
  const { isOnline, toggleOnlineMode, isSyncing, pendingSyncCount, triggerAutoSync, t } = useApp();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  return (
    <>
      <View
        style={[
          styles.container,
          isOnline ? (pendingSyncCount > 0 ? styles.pendingBg : styles.onlineBg) : styles.offlineBg,
        ]}
      >
        {/* Bấm vào vùng trạng thái thay đổi để mở popup xem toàn bộ lịch sử */}
        <TouchableOpacity
          style={styles.statusInfo}
          onPress={() => setShowHistoryModal(true)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.dot,
              isOnline
                ? pendingSyncCount > 0
                  ? styles.dotYellow
                  : styles.dotGreen
                : styles.dotRed,
            ]}
          />
          <Text style={styles.statusText}>
            {isSyncing
              ? t('syncing')
              : isOnline
              ? pendingSyncCount > 0
                ? `${pendingSyncCount} ${t('pendingSync')}`
                : t('synced')
              : t('offline')}
          </Text>

          {/* Nút gợi ý xem lịch sử thay đổi */}
          <View style={styles.historyPill}>
            <Text style={styles.historyPillText}>📋 Lịch sử</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          {/* Nút chuyển đổi Mô phỏng Mạng (Offline / Online) - Dành cho kiểm tra & Chấm thi */}
          <TouchableOpacity
            style={[styles.modeToggleBtn, !isOnline && styles.modeToggleOffline]}
            onPress={toggleOnlineMode}
            activeOpacity={0.7}
            title="Chuyển đổi trạng thái mạng Offline/Online để kiểm tra tính năng tự động đồng bộ"
          >
            <Text style={styles.modeToggleBtnText}>
              {isOnline ? '🌐 Online' : '📴 Offline'}
            </Text>
          </TouchableOpacity>

          {/* Nút đồng bộ thủ công */}
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={() => triggerAutoSync(true)}
            disabled={isSyncing}
            activeOpacity={0.7}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.syncBtnText}>↻</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL LỊCH SỬ THAY ĐỔI */}
      <ChangeHistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  onlineBg: {
    backgroundColor: '#064E3B', // Dark emerald
  },
  pendingBg: {
    backgroundColor: '#78350F', // Dark amber
  },
  offlineBg: {
    backgroundColor: '#7F1D1D', // Dark red
  },
  statusInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotYellow: {
    backgroundColor: '#F59E0B',
  },
  dotRed: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
    marginRight: 8,
  },
  historyPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  historyPillText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6,
  },
  modeToggleOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  modeToggleBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  syncBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginLeft: 6,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
