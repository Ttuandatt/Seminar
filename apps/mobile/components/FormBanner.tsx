import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface FormBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

const COLORS = {
  error: { bg: '#FEF2F2', text: '#B91C1C' }, // Tailwind red-50/red-700
  warning: { bg: '#FFFBEB', text: '#B45309' }, // yellow-50/yellow-700
  info: { bg: '#EFF6FF', text: '#1D4ED8' }, // blue-50/blue-700
};

export const FormBanner: React.FC<FormBannerProps> = ({ message, type = 'error', onDismiss }) => {
  const color = COLORS[type] || COLORS.error;
  return (
    <View style={[styles.container, { backgroundColor: color.bg }]}> 
      <Text style={[styles.text, { color: color.text }]} accessibilityRole="alert">
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} accessibilityRole="button">
          <Text style={[styles.text, styles.dismissText]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 4,
    minHeight: 40,
  },
  text: {
    fontSize: 14,
    flex: 1,
  },
  dismissBtn: {
    marginLeft: 12,
    padding: 4,
  },
  dismissText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FormBanner;
