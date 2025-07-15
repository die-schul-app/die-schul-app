import { supabase } from '@/config/supabaseClient'
import { User } from '@supabase/supabase-js';

export const setTheme = async (user: User | null, theme: 'light' | 'dark') => {
    if (!user) {
        console.error('User not authenticated');
        return;
    }

    const isDarkMode = theme === 'dark';

    const { data, error } = await supabase
        .from('user_settings')
        .update({ dark_mode: isDarkMode })
        .eq('user_id', user.id)
        .select();

    if (error) {
        console.error('Error setting theme:', error);
    }
    return data;
}