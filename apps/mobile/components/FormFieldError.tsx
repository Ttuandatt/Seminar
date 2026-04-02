import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';

interface FormFieldErrorProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ message, actionLabel, onAction }) => (
  <View style={styles.container}>
    <Text style={styles.errorText} accessibilityRole="alert">
      {message}
      {actionLabel && onAction ? (
        <Text style={styles.actionText} onPress={onAction} accessibilityRole="button"> {actionLabel}</Text>
      ) : null}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 2,
  },
  errorText: {
    color: '#EF4444', // Tailwind red-500
    fontSize: 13,
  },
  actionText: {
    color: '#0C4A6E', // Ocean theme blue
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default FormFieldError;
