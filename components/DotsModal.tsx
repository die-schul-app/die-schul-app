import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { deleteHomework } from '@/service/deleteHomework';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type DotsModalProps = {
    visible: boolean;
    onClose: () => void;
};

export const DotsModal = ({ visible, onClose }: DotsModalProps) => {

    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;


    const editHomework = () =>{

    }
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
                            <Pressable  style={{ borderColor: colors.border }} >
                                <Text style={[styles.modalText, {color: colors.text}]} onPress={deleteHomework}>Delete Homework</Text>
                            </Pressable>
                        </View>
                        <View>
                            <Pressable style={{borderColor: colors.border}}>
                                <Text style={[styles.modalText, {color: colors.text}]} onPress={editHomework}>Edit Homework </Text>
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
        fontWeight: 400,
    },
});
