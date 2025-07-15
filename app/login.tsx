import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useTheme } from '@/contexts/ThemeContext'
import { Colors } from '@/constants/Colors'
import { loginWithEmail } from '@/service/auth/login'

import { AuthInput } from '@/components/AuthForm'
import { GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin'
import { supabase } from '@/config/supabaseClient'
import { isRunningInExpoGo } from 'expo'

let GoogleSignin: any = null

if (!isRunningInExpoGo()) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin
}

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    const {theme} = useTheme()

    const colors = theme === 'light' ? Colors.light : Colors.dark

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.')
            return
        }
        const {error} = await loginWithEmail(email, password)
        if (error) {
            Alert.alert('Login Error', error.message)
        } else {
            router.replace('/(tabs)/homework')
        }
    }

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
                style={( {pressed} ) => [
                    styles.button,
                    {backgroundColor: pressed ? colors.tint : colors.primary},
                ]}
                onPress={handleLogin}
            >
                <Text style={styles.buttonText}>Login</Text>
            </Pressable>

            <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={async () => {
                    try {
                        await GoogleSignin.hasPlayServices()
                        const userInfo = await GoogleSignin.signIn()
                        if (userInfo.data?.idToken) {
                            const {data, error} = await supabase.auth.signInWithIdToken({
                                provider: 'google',
                                token: userInfo.data.idToken,
                            })
                            console.log(error, data)
                        } else {
                            throw new Error('no ID token present!')
                        }
                    } catch (error: any) {
                        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                            // user cancelled the login flow
                        } else if (error.code === statusCodes.IN_PROGRESS) {
                            // operation (e.g. sign in) is in progress already
                        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                            // play services not available or outdated
                        } else {
                            // some other error happened
                        }
                    }
                }}
            />

            <Pressable style={styles.linkContainer} onPress={() => router.push('/signup')}>
                <Text style={[styles.link, {color: colors.tint}]}>
                    Don't have an account? <Text style={{color: 'rgba(1, 175, 255, 1)'}}>Sign Up</Text>
                </Text>
            </Pressable>
        </View>
    )
}

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
})

export default Login