import React, { forwardRef } from 'react';
import { View, StyleSheet, TextInput, TextInputProps } from 'react-native';

type TextBoxProps = {
  HolderPlace: string;
} & TextInputProps;

const ModernTextBox = forwardRef<TextInput, TextBoxProps>((props, ref) => {
  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        placeholder={props.HolderPlace}
        placeholderTextColor={'gray'}
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 8,
    borderWidth: 2,
    borderColor: '#4B5563',
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    width: '100%',  
  },
});

export default ModernTextBox;
