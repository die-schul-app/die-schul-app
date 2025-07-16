import DSBLoginModal from '@/components/DSBLoginModal';
import {FontAwesome} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@/contexts/ThemeContext';
import {Colors} from '@/constants/Colors';
import {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import ScheduleBox from '@/components/ScheduleBox';
import {DSBClient} from '@/service/DSB/DSBClient';
import {ScheduleItem} from "@/service/DSB/TimeTable";

const ScheduleItemCard = ({item}: { item: ScheduleItem }) => (
    <ScheduleBox
        subject={item.subject}
        room={item.room}
        teacher={item.teacher}
        periodStart={item.periodStart}
        periodEnd={item.periodEnd}
        className={item.class}
        message={item.message}
        time={item.time}
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
    const {theme} = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;

    useEffect(() => {
        (async () => {
            const storedClass = await AsyncStorage.getItem('selectedClass');
            setSelectedClass(storedClass || '');
            // Try to load credentials and auto-login
            const creds = await AsyncStorage.getItem('dsb_credentials');
            if (creds) {
                const {username, password} = JSON.parse(creds);
                await handleLogin(username, password);
            }
        })();
    }, []);

    useEffect(() => {
        if (dsbClient) {
            loadTodaysSchedule();
        }
    }, [selectedClass, dsbClient]);

    const loadTodaysSchedule = async () => {
        setIsLoading(true);
        try {
            const plans = await dsbClient!.getTimetables();
            let todaysSchedule = dsbClient!.getTodaysSchedule();
            if (selectedClass) {
                todaysSchedule = todaysSchedule.filter(item =>
                    (item.class || '').replace(/\s+/g, '').toLowerCase().includes(selectedClass.replace(/\s+/g, '').toLowerCase())
                );
            }
            setSchedule(todaysSchedule);
            setLastUpdated(new Date());
        } catch (e) {
            setSchedule([]);
        }
        setIsLoading(false);
    };

    const handleRefresh = async () => {
        if (dsbClient) {
            setIsLoading(true);
            await dsbClient.fetchTimetables();
            await loadTodaysSchedule();
            setIsLoading(false);
        }
    };

    const handleLoginPress = () => {
        setShowLoginModal(true);
    };

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

    return (
        <>
            <View style={[styles.container, {backgroundColor: colors.background}]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>Today's Schedule</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
                        {lastUpdated && (
                            <Text style={styles.lastUpdated}>
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </Text>
                        )}
                    </View>
                    <View style={styles.headerRight}>
                        {isAuthenticated ? (
                            <Pressable style={styles.refreshButton} onPress={handleRefresh} disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#3B82F6"/>
                                ) : (
                                    <FontAwesome name="refresh" size={20} color="#3B82F6"/>
                                )}
                            </Pressable>
                        ) : null}
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
});
