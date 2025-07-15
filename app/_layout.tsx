import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Stack } from 'expo-router'

const InitialLayout = () => {
    const {session, user} = useAuth()

    return (
        <>
            {session && user ? (
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                </Stack>
            ) : (
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name="login" options={{headerShown: false}}/>
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
