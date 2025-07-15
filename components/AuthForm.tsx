import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

type ColorConfig = {
  border: string;
  text: string;
  placeholder: string;
};

interface AuthInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secure?: boolean;
  colorConfig: ColorConfig;
}

export const AuthInput = ({ value, onChangeText, placeholder, secure = false, colorConfig }: AuthInputProps) => (
  <TextInput
    style={[styles.input, { borderColor: colorConfig.border, color: colorConfig.text }]}
    placeholder={placeholder}
    placeholderTextColor={colorConfig.placeholder}
    value={value}
    onChangeText={onChangeText}
    autoCapitalize="none"
    keyboardType={secure ? 'default' : 'email-address'}
    secureTextEntry={secure}
  />
);

const styles = StyleSheet.create({
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
});
