import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { deleteHomework } from '@/service/deleteHomework';
import { getHomework } from '@/service/getHomework';
import { updateHomework } from '@/service/updateHomework';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { HomeworkModal } from './HomeworkModal';
import formatDate from '@/service/Date/formatDate';

type HomeworkType = {
    id: number;
    subject: string;
    to_do: string;
    due_date: string;
};

type DotsModalProps = {
    visible: boolean;
    homework_id: number;
    onClose: () => void;
};

export const DotsModal = ({ visible, homework_id, onClose }: DotsModalProps) => {
    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;
    const { user } = useAuth();
    
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [subject, setSubject] = useState('');
    const [assignment, setAssignment] = useState('');
    const [date, setDate] = useState('');

    const handleUpdateSubmit = async () => {
        if (subject  || assignment) {
            await updateHomework(homework_id, {
                subject: subject,
                to_do: assignment,
                due_date: date,
            });
            setIsEditModalVisible(false);
        } else {
            Alert.alert("Incomplete Form", "Please fill out all fields.");
        }
    };

    const handleDeletePress = () => {
        onClose();
        Alert.alert(
            "Delete Homework",
            "Are you sure you want to delete this homework?",
            [
                { text: "Delete", onPress: () => deleteHomework(homework_id), style: "destructive" },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };
    
    const handleEditPress = async () => {
        const { Homework, error } = await getHomework(user!);

        if (error || !Homework || !Homework[0]) {
            Alert.alert("Error", "Could not load homework data.");
            return;
        }

        const data: HomeworkType = Homework[0];

        setSubject(data.subject);
        setAssignment(data.to_do);
        setDate(data.due_date);

        onClose();
        setIsEditModalVisible(true);
    };

    return (
        <>
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <View style={[styles.modalView, { backgroundColor: colors.background }]}>
                        <Pressable style={styles.button} onPress={handleEditPress}>
                            <Feather name="edit-3" size={20} color={colors.text} />
                            <Text style={[styles.buttonText, { color: colors.text }]}>
                                Edit Homework
                            </Text>
                        </Pressable>
                        <Pressable style={styles.button} onPress={handleDeletePress}>
                            <Feather name="trash-2" size={20} color={styles.destructiveText.color} />
                            <Text style={[styles.buttonText, styles.destructiveText]}>
                                Delete Homework
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            <HomeworkModal 
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                subject={subject}
                onSubjectChange={setSubject}
                assignment={assignment}
                onAssignmentChange={setAssignment}
                date={date}
                onDateChange={setDate}
                onSubmit={handleUpdateSubmit}
            />
        </>
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
