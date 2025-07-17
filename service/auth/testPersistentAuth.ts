/**
 * Test file to verify persistent authentication functionality
 * Run this file to test if Supabase authentication persists across app restarts
 */

import {supabase} from '@/config/supabaseClient';
import {getCurrentUser, isAuthenticated} from './authUtils';

export const testPersistentAuth = async () => {
    console.log('🧪 Testing Persistent Authentication...');

    try {
        // Test 1: Check if session is persistent
        console.log('\n1. Checking current session...');
        const {data: {session}, error: sessionError} = await supabase.auth.getSession();

        if (sessionError) {
            console.error('❌ Session error:', sessionError);
            return false;
        }

        if (session) {
            console.log('✅ Found existing session for:', session.user.email);
            console.log('📅 Session expires at:', new Date(session.expires_at! * 1000));
        } else {
            console.log('ℹ️ No existing session found');
        }

        // Test 2: Check user retrieval
        console.log('\n2. Testing user retrieval...');
        const user = await getCurrentUser();
        if (user) {
            console.log('✅ Current user:', user.email);
        } else {
            console.log('ℹ️ No current user');
        }

        // Test 3: Check authentication status
        console.log('\n3. Testing authentication status...');
        const authStatus = await isAuthenticated();
        console.log(authStatus ? '✅ User is authenticated' : 'ℹ️ User is not authenticated');

        // Test 4: Check storage
        console.log('\n4. Checking AsyncStorage...');
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const keys = await AsyncStorage.getAllKeys();
            const supabaseKeys = keys.filter((key: string) => key.includes('supabase'));
            console.log('📦 Supabase keys in storage:', supabaseKeys);

            if (supabaseKeys.length > 0) {
                console.log('✅ Session data found in AsyncStorage');
            } else {
                console.log('ℹ️ No session data in AsyncStorage');
            }
        } catch (error) {
            console.error('❌ Error checking AsyncStorage:', error);
        }

        console.log('\n🏁 Persistent auth test completed');
        return true;

    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
};
