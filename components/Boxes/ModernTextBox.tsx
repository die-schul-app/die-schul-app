import React, { forwardRef } from 'react';
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

type TextBoxProps = {
  HolderPlace: string;
} & TextInputProps;

const ModernTextBox = forwardRef<TextInput, TextBoxProps>((props, ref) => {
  const { theme } = useTheme();
  const colors = theme === 'light' ? Colors.light : Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.tint }]}>
      <TextInput
        ref={ref}
        placeholder={props.HolderPlace}
        placeholderTextColor={'gray'}
        style={[styles.input, { color: colors.text }]}
        value={props.value}
        onChangeText={props.onChangeText}
      />
    </View>
  );
});

ModernTextBox.displayName = 'ModernTextBox';

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderWidth: 2,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
  },
  input: {
    fontSize: 16,
    width: '100%',
  },
});

export default ModernTextBox;
