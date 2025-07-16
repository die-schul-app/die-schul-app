import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {useState} from 'react';
import {useRouter} from 'expo-router';
import {useTheme} from '@/contexts/ThemeContext';
import {Colors} from '@/constants/Colors';
import {signUpWithEmail} from '@/service/auth/signup';
import {AuthInput} from '@/components/AuthForm';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const {theme} = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        const {error} = await signUpWithEmail(email, password);
        if (error) {
            Alert.alert('Sign Up Error', error.message);
        } else {
            Alert.alert(
                'Success!',
                'Please check your email to confirm your account.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.push('/login'),
                    },
                ]
            );
        }
    };

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <Text style={[styles.title, {color: colors.text}]}>Create Account</Text>

            <AuthInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                colorConfig={colors}
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
                onPress={handleSignUp}
            >
                <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/login')}>
                <Text style={[styles.link, {color: colors.tint}]}>
                    Already have an account? <Text style={{color: 'rgba(1, 175, 255, 1)'}}>Log In</Text>
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
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default SignUp;