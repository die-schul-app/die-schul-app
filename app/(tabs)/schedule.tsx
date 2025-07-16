import DSBLoginModal from '@/components/DSBLoginModal';
import {FontAwesome} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@/contexts/ThemeContext';
import {Colors} from '@/constants/Colors';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import ScheduleBox from '@/components/ScheduleBox';
import {DSBClient} from '@/service/DSB/DSBClient';
import {ScheduleItem} from "@/service/DSB/TimeTable";
import DateTimePicker from '@react-native-community/datetimepicker';

const ScheduleItemCard = ({item}: { item: ScheduleItem }) => (
    <ScheduleBox
        periodStart={item.periodStart}
        periodEnd={item.periodEnd}
        teacher={item.teacher}
        subject={item.subject}
        room={item.room}
        message={item.message}
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
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [dsbClient, setDsbClient] = useState<DSBClient | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);
    const {theme} = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;
    let storedClass: string | null;

    useEffect(() => {
        (async () => {
            storedClass = await AsyncStorage.getItem('selectedClass');
            const creds = await AsyncStorage.getItem('dsb_credentials');
            if (creds) {
                const {username, password} = JSON.parse(creds);
                await handleLogin(username, password);
            }
        })();
    }, []);

    // Load all plans on login
    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const client = new DSBClient(username, password);
            await client.fetchTimetables();
            setDsbClient(client);
            setIsAuthenticated(true);
            await AsyncStorage.setItem('dsb_credentials', JSON.stringify({username, password}));
            setShowLoginModal(false);
            setIsLoading(false);
            return true;
        } catch (e) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return false;
        }
    };

    // When selectedDate changes, load the plan for that date from storage (or DSBClient if needed)
    useEffect(() => {
        loadSchedule();
    }, [selectedDate, selectedClass, isAuthenticated, dsbClient]);

    const loadSchedule = async () => {
        if (!dsbClient || !isAuthenticated) {
            setSchedule([]);
            return;
        }
        setIsLoading(true);
        try {
            let timetable = await dsbClient!.getTimetable(selectedDate.toISOString().split('T')[0]);
            let schedule = timetable.items;
            const classes = Array.from(new Set(schedule.map((item: ScheduleItem) => item.class).filter(Boolean)));
            if (storedClass) classes.splice(0, 0, storedClass);
            classes.push('All Classes');
            setAvailableClasses(classes);
            if (!classes.includes(selectedClass)) setSelectedClass(classes[0]);
            if (selectedClass !== 'All Classes') {
                schedule = schedule.filter(item =>
                    (item.class || '').replace(/\s+/g, '').toLowerCase().includes(selectedClass.replace(/\s+/g, '').toLowerCase())
                );
            }
            setSchedule(schedule);
            setLastUpdated(new Date());
        } catch (e) {
            console.error('Failed to load schedule:', e);
            setSchedule([]);
        }
        setIsLoading(false);
    };

    const handleRefresh = async () => {
        if (dsbClient) {
            setIsLoading(true);
            await dsbClient.fetchTimetables();
            await loadSchedule();
            setIsLoading(false);
        }
    };

    const handleLoginPress = () => {
        setShowLoginModal(true);
    };

    return (
        <>
            <View style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>Schedule</Text>
                        <Text style={styles.date}>{selectedDate.toLocaleDateString()}</Text>
                        {lastUpdated && (
                            <Text style={styles.lastUpdated}>
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                    <View style={styles.headerRight}>
                        <Pressable style={styles.refreshButton} onPress={handleRefresh} disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#3B82F6"/>
                            ) : (
                                <FontAwesome name="refresh" size={20} color="#3B82F6"/>
                            )}
                        </Pressable>
                        <Pressable style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                            <FontAwesome name="calendar" size={20} color="#3B82F6"/>
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) setSelectedDate(date);
                                }}
                            />
                        )}
                        <View style={styles.classPickerWrapper}>
                            <Picker
                                selectedValue={selectedClass}
                                style={{height: 40, width: 120}}
                                onValueChange={(itemValue) => setSelectedClass(itemValue)}
                            >
                                <Picker.Item label="Select Class" value=""/>
                                {availableClasses.map(cls => (
                                    <Picker.Item key={cls} label={cls} value={cls}/>
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>
                {isAuthenticated ? (
                    <FlatList
                        data={schedule}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({item}) => <ScheduleItemCard item={item}/>}
                        contentContainerStyle={{paddingBottom: 20}}
                        ListEmptyComponent={<Text style={{color: colors.text, textAlign: 'center', marginTop: 40}}>No
                            lessons for today.</Text>}
                    />
                ) : (
                    <LoginPrompt onLoginPress={handleLoginPress}/>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    date: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 2,
    },
    lastUpdated: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    loginPrompt: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    loginTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#3B82F6',
    },
    loginText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    loginButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    refreshButton: {
        marginLeft: 10,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
    },
    pickerButton: {
        marginLeft: 10,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
    },
    classPickerWrapper: {
        marginLeft: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
    },
});
