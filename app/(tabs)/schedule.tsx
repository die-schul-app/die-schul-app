import DSBLoginModal from '@/components/DSBLoginModal';
import {ScheduleItem as DSBScheduleItem} from '@/service/DSB/TimeTable';
import {useDSB} from '@/service/useDSB';
import {FontAwesome} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@/contexts/ThemeContext';
import {Colors} from '@/constants/Colors';
import {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import ScheduleBox from '@/components/ScheduleBox';

// Mock data for schedule - fallback if DSB is not configured
const mockSchedule = [
    {id: '1', subject: 'Mathematics', time: '08:00 - 09:30', room: 'Room 101', period: 1, day: 'Monday'},
    {id: '2', subject: 'English', time: '09:45 - 11:15', room: 'Room 203', period: 2, day: 'Monday'},
    {id: '3', subject: 'Physics', time: '11:30 - 13:00', room: 'Lab 1', period: 3, day: 'Monday'},
    {id: '4', subject: 'History', time: '14:00 - 15:30', room: 'Room 105', period: 4, day: 'Monday'},
];

type LocalScheduleItem = {
    id: string;
    subject: string;
    time: string;
    room: string;
    teacher?: string;
    period: number;
    day: string;
    class?: string; // added class property
};

const ScheduleItemCard = ({item}: { item: LocalScheduleItem }) => (
    <ScheduleBox
        subject={item.subject}
        time={item.time}
        room={item.room}
        teacher={item.teacher}
        period={item.period}
        className={item.class}
    />
);

const LoginPrompt = ({onLoginPress}: { onLoginPress: () => void }) => (
    <View style={styles.loginPrompt}>
        <FontAwesome name="lock" size={48} color="#9CA3AF"/>
        <Text style={styles.loginTitle}>DSB Login Required</Text>
        <Text style={styles.loginText}>
            Please login with your DSB credentials to view your real schedule
        </Text>
        <Pressable style={styles.loginButton} onPress={onLoginPress}>
            <Text style={styles.loginButtonText}>Login to DSB</Text>
        </Pressable>
    </View>
);

export default function ScheduleScreen() {
    const [schedule, setSchedule] = useState<LocalScheduleItem[]>([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [loadingClass, setLoadingClass] = useState(true);
    const dsb = useDSB();
    const {theme} = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;

    useEffect(() => {
        (async () => {
            const storedClass = await AsyncStorage.getItem('selectedClass');
            setSelectedClass(storedClass || '');
            setLoadingClass(false);
        })();
    }, []);

    useEffect(() => {
        if (dsb.isAuthenticated && dsb.timetable) {
            // Convert DSB schedule items to local format
            let todaysSchedule = dsb.getTodaysSchedule().map((item: DSBScheduleItem): LocalScheduleItem => ({
                id: item.id,
                subject: item.subject,
                time: item.time,
                room: item.room,
                teacher: item.teacher,
                period: item.period,
                day: item.day,
                class: item.class, // assuming class property exists
            }));
            if (selectedClass) {
                todaysSchedule = todaysSchedule.filter(item => (item.class || '').toLowerCase().includes(selectedClass.toLowerCase()));
            }
            setSchedule(todaysSchedule);
        } else if (!dsb.isAuthenticated) {
            // Use mock data if not authenticated
            setSchedule(mockSchedule);
        }
    }, [selectedClass, dsb.isAuthenticated, dsb.timetable]);

    const handleRefresh = async () => {
        if (dsb.isAuthenticated) {
            await dsb.refreshTimetable();
        }
    };

    const handleLoginPress = () => {
        setShowLoginModal(true);
    };

    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        return await dsb.authenticate(username, password);
    };

    return (
        <>
            <View style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>Today's Schedule</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
                        {dsb.lastUpdated && (
                            <Text style={styles.lastUpdated}>
                                Last updated: {dsb.lastUpdated.toLocaleTimeString()}
                            </Text>
                        )}
                    </View>

                    <View style={styles.headerRight}>
                        {dsb.isAuthenticated ? (
                            <Pressable style={styles.refreshButton} onPress={handleRefresh} disabled={dsb.isLoading}>
                                {dsb.isLoading ? (
                                    <ActivityIndicator size="small" color="#3B82F6"/>
                                ) : (
                                    <FontAwesome name="refresh" size={20} color="#3B82F6"/>
                                )}
                            </Pressable>
                        ) : (
                            <Pressable style={styles.loginIconButton} onPress={handleLoginPress}>
                                <FontAwesome name="sign-in" size={20} color="#F59E0B"/>
                            </Pressable>
                        )}
                    </View>
                </View>

                {dsb.error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{dsb.error}</Text>
                    </View>
                )}
                {!dsb.isAuthenticated ? (
                    <LoginPrompt onLoginPress={handleLoginPress}/>
                ) : (
                    <FlatList
                        data={schedule}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => <ScheduleItemCard item={item}/>}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={dsb.isLoading}
                        onRefresh={handleRefresh}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <FontAwesome name="calendar-o" size={48} color="#9CA3AF"/>
                                <Text style={styles.emptyText}>No classes scheduled for today</Text>
                            </View>
                        }
                    />
                )}
            </View>
            <DSBLoginModal
                visible={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#1F2937',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        marginLeft: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#F9FAFB',
        marginBottom: 4,
    },
    date: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    lastUpdated: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    refreshButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#374151',
    },
    loginIconButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#374151',
    },
    errorContainer: {
        backgroundColor: '#DC2626',
        padding: 12,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 6,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
    },
    listContent: {
        padding: 20,
    },
    loginPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F9FAFB',
        marginTop: 16,
        marginBottom: 8,
    },
    loginText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    loginButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        marginTop: 16,
        textAlign: 'center',
    },
});
