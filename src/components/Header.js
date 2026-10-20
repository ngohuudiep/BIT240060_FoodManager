import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { MSSV } from '../constants/config';

export const Header = ({ title, showBack, onBack, rightAction }) => {
  const { language, toggleLanguage, t } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← {t('back')}</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title} numberOfLines={1}>
            {title || t('appName')}
          </Text>
          <Text style={styles.subtitle}>
            {MSSV} | Food Manager
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Nút chuyển đổi ngôn ngữ EN <-> VI */}
        <TouchableOpacity
          style={styles.langButton}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <Text style={styles.langText}>
            {language === 'en' ? '🇻🇳 VI' : '🇺🇸 EN'}
          </Text>
        </TouchableOpacity>

        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  backButtonText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  langText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
});
