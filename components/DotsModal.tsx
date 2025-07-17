import React from 'react';
import { Modal, Pressable, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

type DotsModalProps = {
    visible: boolean;
    onClose: () => void;
};

export const DotsModal = ({ visible, onClose }: DotsModalProps) => {

    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;

    if (!visible) {
        return null;
    }
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Pressable style={[styles.modalContent, {backgroundColor: colors.background}]}>                     
                        <View>
                            <Pressable  style={{ backgroundColor: colors.background }} >
                                <Text style={styles.modalText}>Delete Homework</Text>
                            </Pressable>
                        </View>
                        <View>
                            <Pressable>
                                <Text style={styles.modalText}>Edit Homework </Text>
                            </Pressable>
                        </View>                   
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        
    },
    modalContent: {
        padding: 22,
        borderRadius: 10,
        width: 'auto',
        height:'auto',
        alignItems: 'center',
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 15,
        color: 'black',
    },
    buttons: {
        backgroundColor: 'blue'
    }
});
