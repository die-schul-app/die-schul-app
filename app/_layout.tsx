import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Stack } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

const InitialLayout = () => {
    const { session, user, loading } = useAuth()

    // Show loading spinner while checking authentication state
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <>
            {session && user ? (
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                </Stack>
            ) : (
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name="login" options={{headerShown: false}}/>
                    <Stack.Screen name="signup" options={{headerShown: false}}/>
                </Stack>
            )}
        </>
    )
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <InitialLayout/>
            </ThemeProvider>
        </AuthProvider>
    )
}
