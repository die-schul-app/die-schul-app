import ModernTextBox from '@/components/ModernTextBox'
import { Colors } from '@/constants/Colors'
import { useTheme } from '@/contexts/ThemeContext'
import React from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

type HomeworkModalProps = {
    visible: boolean;
    onClose: () => void;
    subject: string;
    onSubjectChange: (text: string) => void;
    assignment: string;
    onAssignmentChange: (text: string) => void;
    date: string;
    onDateChange: (text: string) => void;
    onSubmit: () => void; 
};

export const HomeworkModal = ({
    visible,
    onClose,
    subject,
    onSubjectChange,
    assignment,
    onAssignmentChange,
    date,
    onDateChange,
    onSubmit
}: HomeworkModalProps) => {
    const { theme } = useTheme()
    const colors = theme === 'light' ? Colors.light : Colors.dark

    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}>
                <Pressable
                    style={styles.modalOverlay}
                    onPress={onClose}>
                    <Pressable
                        style={[styles.modalView, { backgroundColor: colors.background }]}
                        onPress={(e) => e.stopPropagation()}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.infoText, { color: colors.text }]}>Subject</Text>
                            <ModernTextBox
                                HolderPlace="Type your Subject"
                                value={subject}
                                onChangeText={onSubjectChange}/>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.infoText, { color: colors.text }]}>Homework</Text>
                            <ModernTextBox
                                HolderPlace="Type your Assignment"
                                value={assignment}
                                onChangeText={onAssignmentChange}/>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.infoText, { color: colors.text }]}>Date</Text>
                            <ModernTextBox
                                HolderPlace=""
                                value={date}
                                onChangeText={onDateChange}/>
                        </View>


                        <Pressable
                            style={[styles.button, styles.buttonClose, { backgroundColor: colors.tint }]}onPress={onSubmit} >
                            <Text style={[styles.textStyle, { color: colors.background }]}>Add Homework</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        elevation: 5,
        width: '70%',
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        position: 'absolute',
        bottom: 20,
        right: 20,
        elevation: 8,
    },
    button: {
        borderRadius: 20,
        padding: 10,
    },
    buttonClose: {
        marginTop: 3,
        width: 150,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 10,
    },
})