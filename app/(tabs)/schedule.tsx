import DSBLoginModal from '@/components/DSBLoginModal';
import {FontAwesome} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@/contexts/ThemeContext';
import {Colors} from '@/constants/Colors';
import React, {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import ScheduleBox from '@/components/ScheduleBox';
import {DSBClient} from '@/service/DSB/DSBClient';
import {ScheduleItem, TimeTable} from "@/service/DSB/TimeTable";
import DateTimePicker from '@react-native-community/datetimepicker';
import {getDateString} from "@/service/dateUtils";
import {useFocusEffect, useNavigation} from '@react-navigation/native';

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
    const [storedClass, setStoredClass] = useState<string | null>(null);
    let currentTimetable: TimeTable = new TimeTable('', [], new Date());
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            const creds = await AsyncStorage.getItem('dsb_credentials');
            if (creds) {
                const {username, password} = JSON.parse(creds);
                await handleLogin(username, password);
            }
        })();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            (async () => {
                const classValue = await AsyncStorage.getItem('selectedClass');
                setStoredClass(classValue);
            })();
        }, [])
    );

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
            currentTimetable = await dsbClient!.getTimetable(selectedDate.toISOString().split('T')[0]);
            let schedule = currentTimetable.items;
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
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start'}}>
                            <Text style={styles.selectedDateText}>
                                {getDateString(selectedDate)}
                            </Text>
                            <Text style={styles.uploadedText}>
                                {currentTimetable && currentTimetable.planCreated ?
                                    (() => {
                                        const planDate = selectedDate;
                                        const created = currentTimetable.planCreated;
                                        const planDay = new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate());
                                        const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
                                        const diffDays = Math.round((planDay.getTime() - createdDay.getTime()) / (1000 * 60 * 60 * 24));
                                        const now = new Date();
                                        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                        const createdDiff = Math.round((createdDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                        const time = created.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                        if (createdDiff === 0) return `Uploaded today, ${time}`;
                                        if (createdDiff === -1) return `Uploaded yesterday, ${time}`;
                                        if (diffDays === 0) return `Uploaded the same day, ${time}`;
                                        if (diffDays === 1) return `Uploaded the day before, ${time}`;
                                        if (diffDays > 1) return `Uploaded ${diffDays} days before, ${time}`;
                                        return `Uploaded ${Math.abs(diffDays)} days after, ${time}`;
                                    })()
                                    : ''}
                            </Text>
                        </View>
                        <View style={{justifyContent: 'flex-start', alignItems: 'flex-end', marginLeft: 8}}>
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
                                    style={{position: 'absolute', top: 30, right: 0, zIndex: 1000}}
                                />
                            )}
                        </View>
                    </View>
                    <View
                        style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4}}>
                        <View style={styles.classPickerWrapper2}>
                            <Picker
                                selectedValue={selectedClass}
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
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
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
        marginBottom: 8, // reduce space between header and content
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLeft2: {
        flex: 1,
    },
    headerRight2: {
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
    classPickerWrapper2: {
        marginLeft: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        flex: 1,
    },
    selectedDateText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    uploadedText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
