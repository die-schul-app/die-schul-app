import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import getCurrentDate from '@/service/Date/getCurrentDate';
import insertHomework from '@/service/insertHomework';
import { FontAwesome6 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { HomeworkModal } from '../Modals/HomeworkModal';

const AddButton = () => {
    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [subject, setSubject] = useState('');
    const [assignment, setAssignment] = useState('');
    const [date, setDate] = useState(getCurrentDate());

    const handleSubmit = () => {
        if (subject && assignment) {
            insertHomework(user!.id, subject, date, assignment);
            setModalVisible(false);
        } else {
            Alert.alert("Incomplete Form", "Please fill out all fields.");
        }
    };

    const openModal = () => {
        if (user) {
            setSubject('');
            setAssignment('');
            setDate(getCurrentDate());
            setModalVisible(true);
        } else {
            Alert.alert("Login Required", "You must be logged in to add homework.");
        }
    };

    return (
        <View style={styles.container}> 
            <HomeworkModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                subject={subject}
                onSubjectChange={setSubject}
                assignment={assignment}
                onAssignmentChange={setAssignment}
                date={date}
                onDateChange={setDate}
                onSubmit={handleSubmit}/>

            <Pressable
                style={({ pressed }) => [styles.addButton, { backgroundColor: pressed ? colors.tint : colors.primary }]} onPress={openModal}>
                <FontAwesome6 name="plus" size={24} color={colors.background} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        margin: 20,
        elevation: 8,
    },
});

export default AddButton;