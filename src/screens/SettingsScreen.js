import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';
import { DEFAULT_MOCKAPI_BASE_URL, MSSV, PROJECT_NAME, TABLE_NAMES } from '../constants/config';
import { ConfirmModal } from '../components/ConfirmModal';

export const SettingsScreen = () => {
  const {
    isOnline,
    toggleOnlineMode,
    isSyncing,
    pendingSyncCount,
    triggerAutoSync,
    resetToDefaults,
    t,
  } = useApp();

  const [apiUrl, setApiUrl] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    storageService.getMockApiUrl(DEFAULT_MOCKAPI_BASE_URL).then((url) => {
      setApiUrl(url);
    });
  }, []);

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim()) return;
    await storageService.saveMockApiUrl(apiUrl.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetConfirm = async () => {
    await resetToDefaults();
    setShowResetModal(false);
    Alert.alert(t('success'), 'Đã khôi phục dữ liệu mẫu ban đầu thành công!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. THÔNG TIN BÀI THI & MSSV */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎓 {t('aboutTitle')}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('studentNameLabel')}:</Text>
          <Text style={styles.infoValueHighlight}>{MSSV}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tên Project:</Text>
          <Text style={styles.infoValue}>{PROJECT_NAME}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Endpoint Table:</Text>
          <Text style={styles.infoValue}>{TABLE_NAMES.DISH}</Text>
        </View>
      </View>

      {/* 2. CẤU HÌNH MOCKAPI BASE URL */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 {t('apiEndpointTitle')}</Text>
        <Text style={styles.cardDesc}>{t('apiEndpointDesc')}</Text>

        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="https://...mockapi.io/api/v1"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={styles.saveUrlBtn}
          onPress={handleSaveApiUrl}
          activeOpacity={0.8}
        >
          <Text style={styles.saveUrlBtnText}>{t('apiEndpointSave')}</Text>
        </TouchableOpacity>

        {savedSuccess && (
          <Text style={styles.successText}>✓ {t('apiEndpointUpdated')}</Text>
        )}
      </View>

      {/* 3. TRẠNG THÁI ĐỒNG BỘ OFFLINE -> MOCKAPI */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔄 {t('syncSection')}</Text>
        <Text style={styles.cardDesc}>{t('offlineExplanation')}</Text>

        <View style={styles.syncStatusRow}>
          <Text style={styles.infoLabel}>Trạng thái mạng:</Text>
          <TouchableOpacity
            style={[styles.simToggleBtn, !isOnline && styles.simToggleOffline]}
            onPress={toggleOnlineMode}
            activeOpacity={0.8}
          >
            <Text style={styles.simToggleBtnText}>
              {isOnline ? '🌐 Trực tuyến (Online)' : '📴 Ngoại tuyến (Offline)'} [Chuyển]
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.syncStatusRow}>
          <Text style={styles.infoLabel}>Hàng đợi chờ đồng bộ:</Text>
          <Text style={styles.infoValueBold}>
            {pendingSyncCount} tác vụ
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
          onPress={triggerAutoSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.syncBtnText}>⟳ {t('forceSyncNow')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 4. KHÔI PHỤC DỮ LIỆU BAN ĐẦU */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚠️ Quản trị Dữ liệu</Text>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => setShowResetModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.resetBtnText}>↺ {t('clearLocalData')}</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL XÁC NHẬN RESET */}
      <ConfirmModal
        visible={showResetModal}
        title={t('confirm')}
        message={t('clearLocalConfirm')}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 13,
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  infoValueHighlight: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 13,
    marginBottom: 10,
  },
  saveUrlBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  successText: {
    color: '#34D399',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  onlineText: {
    color: '#34D399',
  },
  offlineText: {
    color: '#F87171',
  },
  simToggleBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  simToggleOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderColor: '#EF4444',
  },
  simToggleBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoValueBold: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 14,
  },
  syncBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  syncBtnDisabled: {
    opacity: 0.6,
  },
  syncBtnText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
  resetBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resetBtnText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 13,
  },
});
