import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { SyncStatusBar } from './src/components/SyncStatusBar';
import { DishListScreen } from './src/screens/DishListScreen';
import { DishDetailScreen } from './src/screens/DishDetailScreen';
import { DishFormScreen } from './src/screens/DishFormScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Thành phần chính điều hướng bên trong Provider
const MainApp = () => {
  const { loading, t } = useApp();

  // Tab đang kích hoạt: 'DISHES' | 'CATEGORIES' | 'SETTINGS'
  const [activeTab, setActiveTab] = useState('DISHES');

  // Màn hình chi tiết bên trong Tab Dishes:
  // 'LIST' | 'DETAIL' | 'CREATE' | 'EDIT'
  const [dishScreen, setDishScreen] = useState('LIST');
  const [selectedDishId, setSelectedDishId] = useState(null);

  // Bộ điều hướng (Navigation Handler)
  const navigate = (screenName, params = {}) => {
    if (screenName === 'DISH_LIST') {
      setDishScreen('LIST');
      setSelectedDishId(null);
    } else if (screenName === 'DISH_DETAIL') {
      setSelectedDishId(params.dishId);
      setDishScreen('DETAIL');
    } else if (screenName === 'DISH_CREATE') {
      setSelectedDishId(null);
      setDishScreen('CREATE');
    } else if (screenName === 'DISH_EDIT') {
      setSelectedDishId(params.dishId);
      setDishScreen('EDIT');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  // Tiêu đề Header
  let headerTitle = t('appName');
  let showBack = false;

  if (activeTab === 'DISHES') {
    if (dishScreen === 'DETAIL') {
      headerTitle = t('actions');
      showBack = true;
    } else if (dishScreen === 'CREATE') {
      headerTitle = t('createDishTitle');
      showBack = true;
    } else if (dishScreen === 'EDIT') {
      headerTitle = t('editDishTitle');
      showBack = true;
    }
  } else if (activeTab === 'CATEGORIES') {
    headerTitle = t('categoryManagement');
  } else if (activeTab === 'SETTINGS') {
    headerTitle = t('settings');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" />

      {/* 1. THANH HEADER TOÀN CỤC (CÓ NÚT CHUYỂN NGÔN NGỮ EN <-> VI) */}
      <Header
        title={headerTitle}
        showBack={showBack}
        onBack={() => navigate('DISH_LIST')}
      />

      {/* 2. THANH TRẠNG THÁI MẠNG VÀ TỰ ĐỘNG ĐỒNG BỘ MOCKAPI */}
      <SyncStatusBar />

      {/* 3. NỘI DUNG MÀN HÌNH THEO TAB VÀ NAVIGATION */}
      <View style={styles.contentArea}>
        {activeTab === 'DISHES' && (
          <>
            {dishScreen === 'LIST' && (
              <DishListScreen onNavigate={navigate} />
            )}
            {dishScreen === 'DETAIL' && (
              <DishDetailScreen dishId={selectedDishId} onNavigate={navigate} />
            )}
            {dishScreen === 'CREATE' && (
              <DishFormScreen onNavigate={navigate} />
            )}
            {dishScreen === 'EDIT' && (
              <DishFormScreen dishId={selectedDishId} onNavigate={navigate} />
            )}
          </>
        )}

        {activeTab === 'CATEGORIES' && (
          <CategoryScreen onNavigate={navigate} />
        )}

        {activeTab === 'SETTINGS' && (
          <SettingsScreen />
        )}
      </View>

      {/* 4. THANH ĐIỀU HƯỚNG DƯỚI CÙNG (BOTTOM TAB BAR) */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'DISHES' && styles.tabItemActive]}
          onPress={() => {
            setActiveTab('DISHES');
            setDishScreen('LIST');
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabIcon, activeTab === 'DISHES' && styles.tabIconActive]}>
            🍲
          </Text>
          <Text style={[styles.tabText, activeTab === 'DISHES' && styles.tabTextActive]}>
            {t('tabDishes')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'CATEGORIES' && styles.tabItemActive]}
          onPress={() => setActiveTab('CATEGORIES')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabIcon, activeTab === 'CATEGORIES' && styles.tabIconActive]}>
            📂
          </Text>
          <Text style={[styles.tabText, activeTab === 'CATEGORIES' && styles.tabTextActive]}>
            {t('tabCategories')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'SETTINGS' && styles.tabItemActive]}
          onPress={() => setActiveTab('SETTINGS')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabIcon, activeTab === 'SETTINGS' && styles.tabIconActive]}>
            ⚙️
          </Text>
          <Text style={[styles.tabText, activeTab === 'SETTINGS' && styles.tabTextActive]}>
            {t('tabSettings')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 14,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 8,
    paddingBottom: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#38BDF8',
    marginTop: -2,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.7,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
});
