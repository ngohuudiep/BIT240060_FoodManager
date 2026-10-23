import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleResetData = async () => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('[ErrorBoundary] Error clearing storage:', e);
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>Đã xảy ra sự cố</Text>
            <Text style={styles.subtitle}>
              Ứng dụng đã tự động ngăn chặn màn hình trắng. Bạn có thể tải lại hoặc khôi phục dữ liệu bên dưới:
            </Text>

            {this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.btn, styles.retryBtn]}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>↺ Tải lại ứng dụng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.resetBtn]}
                onPress={this.handleResetData}
                activeOpacity={0.8}
              >
                <Text style={styles.resetBtnText}>⚙️ Khôi phục dữ liệu ban đầu</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  icon: {
    fontSize: 54,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 24,
    width: '100%',
    maxWidth: 500,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonGroup: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryBtn: {
    backgroundColor: '#0284C7',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  resetBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resetBtnText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 14,
  },
});
