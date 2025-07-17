import {AuthInput} from '@/components/AuthForm';
import {Colors} from '@/constants/Colors';
import {useTheme} from '@/contexts/ThemeContext';
import {signInWithGoogle} from '@/service/auth/google_auth';
import {loginWithEmail} from '@/service/auth/login';
import {makeRedirectUri, useAuthRequest} from 'expo-auth-session';
import {useRouter} from 'expo-router';
import {useEffect, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {supabase} from '@/config/supabaseClient';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const {theme} = useTheme(); // Get theme
    const colors = theme === 'light' ? Colors.light : Colors.dark; // Get colors

    // Configure Google OAuth
    const [_request, response] = useAuthRequest(
        {
            clientId: '835113993151-4hln3mttnjncj101olh2jlu4tfupmimo.apps.googleusercontent.com',
            scopes: ['openid', 'profile', 'email'],
            redirectUri: makeRedirectUri({
                scheme: 'dieschulapp',
                path: '/(tabs)/homework',
            }),
        },
        {
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
            revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
        }
    );

    useEffect(() => {
        if (response?.type === 'success') {
            const {authentication} = response;
            if (authentication?.idToken) {
                handleSupabaseSignIn(authentication.idToken);
            }
        }
    }, [response]);

    const handleSupabaseSignIn = async (idToken: string) => {
        try {
            const {data, error} = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) {
                console.error('Supabase sign-in error:', error);
                Alert.alert('Login Error', error.message);
            } else {
                console.log('Supabase sign-in successful:', data);
                router.replace('/(tabs)/homework');
            }
        } catch (error: any) {
            console.error('Authentication error:', error);
            Alert.alert('Login Error', 'Failed to complete authentication');
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        const {error} = await loginWithEmail(email, password);
        if (error) {
            Alert.alert('Login Error', error.message);
        } else {
            router.replace('/(tabs)/homework');
        }
    };

    const handleGoogleLogin = async () => {
        const {error} = await signInWithGoogle();
        if (error) {
            Alert.alert('Google Login Error', error.message);
        }
    };

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <Text style={[styles.title, {color: colors.text}]}>Welcome Back!</Text>

            <AuthInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                colorConfig={colors}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <AuthInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secure
                colorConfig={colors}
            />

            <Pressable
                style={({pressed}) => [
                    styles.button,
                    {backgroundColor: pressed ? colors.tint : colors.primary},
                ]}
                onPress={handleLogin}
            >
                <Text style={styles.buttonText}>Login</Text>
            </Pressable>

            <Pressable
                style={({pressed}) => [
                    styles.button,
                    {backgroundColor: pressed ? '#3a78d9' : '#4285F4'},
                ]}
                onPress={handleGoogleLogin}
            >
                <Text style={styles.buttonText}>Login with Google</Text>
            </Pressable>

            <Pressable style={styles.linkContainer} onPress={() => router.push('/signup')}>
                <Text style={[styles.link, {color: colors.tint}]}>
                    Don't have an account? <Text style={{color: 'rgba(1, 175, 255, 1)'}}>Sign Up</Text>
                </Text>
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
    linkContainer: {
        marginTop: 15,
    },
    link: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default Login;