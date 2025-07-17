import {supabase} from '@/config/supabaseClient';
import {User} from '@supabase/supabase-js';

/**
 * Get the current user session
 */
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const {data: {user}, error} = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting current user:', error);
            return null;
        }
        return user;
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        return null;
    }
};

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const {data: {session}, error} = await supabase.auth.getSession();
        if (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
        return !!session;
    } catch (error) {
        console.error('Error in isAuthenticated:', error);
        return false;
    }
};

/**
 * Refresh the current session
 */
export const refreshSession = async () => {
    try {
        const {data, error} = await supabase.auth.refreshSession();
        if (error) {
            console.error('Error refreshing session:', error);
            return {success: false, error};
        }
        return {success: true, session: data.session};
    } catch (error) {
        console.error('Error in refreshSession:', error);
        return {success: false, error};
    }
};
