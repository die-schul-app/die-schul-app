import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import React, {useState} from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { deleteHomework } from '@/service/deleteHomework';
import { getHomework } from '@/service/getHomework';
import { useAuth } from '@/contexts/AuthContext';
import { HomeworkModal } from './HomeworkModal';

type DotsModalProps = {
    visible: boolean;
    homework_id: number;
    onClose: () => void;
};

export const DotsModal = ({ visible, homework_id, onClose }: DotsModalProps) => {
    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [subject, setSubject] = useState('');
    const [assignment, setAssignment] = useState('');
    const [date, setDate] = useState('');
    const [editingHomeworkId, setEditingHomeworkId] = useState<number | null>(null);

    const handleDeletePress = () => {
        Alert.alert(
            "Delete Homework",
            "Are you sure you want to delete this homework? This action cannot be undone.",
            [
                {
                    text: "Delete",
                    onPress: async () => {
                        await deleteHomework(homework_id);
                    },
                    style: "destructive",
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
        onClose();
    };
    
    const handleEditPress = async() => {
        onClose();
        const {error, Homework} = await getHomework(user! ,homework_id);
        <HomeworkModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        subject={Homework.subject}
        onSubjectChange={setSubject}
        assignment={Homework.assignment}
        onAssignmentChange={setAssignment}
        date={Homework.date}
        onDateChange={setDate}
        onSubmit={handleSubmit}/>
    };

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
                <View style={[styles.modalView, { backgroundColor: colors.background }]}>
                    <Pressable
                        style={({ pressed }) => [styles.button, pressed && { backgroundColor: colors.tint }]}
                        onPress={handleEditPress}>
                        <Feather name="edit-3" size={20} color={colors.text} />
                        <Text style={[styles.buttonText, { color: colors.text }]}>
                            Edit Homework
                        </Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.button, pressed && { backgroundColor: colors.tint }]}
                        onPress={handleDeletePress}>
                        <Feather name="trash-2" size={20} color={styles.destructiveText.color} />
                        <Text style={[styles.buttonText, styles.destructiveText]}>
                            Delete Homework
                        </Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: 250,
        borderRadius: 12,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    buttonText: {
        marginLeft: 15,
        fontSize: 16,
        fontWeight: '500',
    },
    destructiveText: {
        color: '#e53e3e',
    },
});