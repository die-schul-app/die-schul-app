import { View, Text, TextInput, Alert, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useRouter } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';
import { useTheme } from '@/contexts/ThemeContext'; // Import useTheme
import { Colors } from '@/constants/Colors'; // Import Colors

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { theme } = useTheme(); // Get theme
    const colors = theme === 'light' ? Colors.light : Colors.dark; // Get colors

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Login Error', error.message); // Added title to Alert
        } else {
            router.replace('/(tabs)/homework');
        }
    };

    const handleGoogleLogin = async () => {
        const redirectUri = makeRedirectUri({
            scheme: 'your.app.scheme', // Replace with your app scheme
            path: '/(tabs)/homework'
        });

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUri,
            },
        });

        if (error) {
            Alert.alert('Google Login Error', error.message); // Added title to Alert
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>

            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: pressed ? colors.tint : colors.primary },
                ]}
                onPress={handleLogin}
            >
                <Text style={styles.buttonText}>Login</Text>
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.googleButton, // Specific style for Google button
                    { backgroundColor: pressed ? colors.tint : colors.secondary }, // Use secondary color for Google
                ]}
                onPress={handleGoogleLogin}
            >
                <Text style={styles.buttonText}>Login with Google</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        width: '100%',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    googleButton: {
        // Additional styling for Google button if needed
    },
});

export default Login;