import {Colors} from '@/constants/Colors';
import {useAuth} from '@/contexts/AuthContext';
import {useTheme} from '@/contexts/ThemeContext';
import {logout} from '@/service/auth/logout';
import {testPersistentAuth} from '@/service/auth/testPersistentAuth';
import {useRouter} from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Pressable, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import {useEffect, useState} from 'react';

export default function SettingsScreen() {
    const {theme, toggleTheme} = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;
    const router = useRouter();
    const {user} = useAuth();
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [loadingClass, setLoadingClass] = useState(true);

    useEffect(() => {
        (async () => {
            const storedClass = await AsyncStorage.getItem('selectedClass');
            if (storedClass) setSelectedClass(storedClass);
            setLoadingClass(false);
        })();
    }, []);

    const handleLogout = async () => {
        try {
            const {error} = await logout();
            if (error) {
                Alert.alert('Error', 'Failed to logout: ' + error.message);
            } else {
                router.replace('/login'); // Navigate to login after logout
            }
        } catch (err) {
            Alert.alert('Error', 'An unexpected error occurred during logout');
            console.error('Logout error:', err);
        }
    };

    const handleTestAuth = async () => {
        try {
            await testPersistentAuth();
            Alert.alert('Test Complete', 'Check console for detailed results');
        } catch (error) {
            Alert.alert('Test Failed', 'Check console for error details');
        }
    };

    const handleClassChange = async (value: string) => {
        setSelectedClass(value);
        await AsyncStorage.setItem('selectedClass', value);
    };

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <Text style={[styles.title, {color: colors.text}]}>Settings</Text>

            {user && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, {color: colors.text}]}>User Info</Text>
                    <Text style={[styles.rowText, {color: colors.text}]}>Email: {user.email}</Text>
                    <Text style={[styles.rowText, {color: colors.text}]}>ID: {user.id}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Appearance</Text>
                <View style={styles.row}>
                    <Text style={[styles.rowText, {color: colors.text}]}>Dark Mode</Text>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{false: '#767577', true: colors.primary}}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Class Selection</Text>
                <TextInput
                    style={{
                        borderColor: colors.text,
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 8,
                        color: colors.text,
                        backgroundColor: colors.primary,
                        marginBottom: 10,
                    }}
                    placeholder="Enter your class (e.g. 10A, 5B)"
                    placeholderTextColor={colors.text + '99'}
                    value={selectedClass}
                    onChangeText={handleClassChange}
                    editable={!loadingClass}
                />
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, {color: colors.text}]}>Account</Text>

                <Pressable style={({pressed}) => [
                    styles.testButton,
                    {backgroundColor: pressed ? colors.tint : '#4CAF50'},
                ]} onPress={handleTestAuth}>
                    <Text style={styles.buttonText}>Test Auth Status</Text>
                </Pressable>

                <Pressable style={({pressed}) => [
                    styles.logoutButton,
                    {backgroundColor: pressed ? colors.tint : colors.primary},
                ]} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    rowText: {
        fontSize: 16,
    },
    testButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});