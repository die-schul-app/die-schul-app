import { supabase } from '@/config/supabaseClient'
import { User } from '@supabase/supabase-js';

export const getTheme = async (user: User | null): Promise<'light' | 'dark'> => {
    if (!user) {
        return 'dark'; 
    }

    const { data, error } = await supabase
        .from('user_settings')
        .select('dark_mode')
        .eq('user_id', user.id)
        .single();

    if (error || !data) {
        console.error('Error fetching theme or no settings found:', error);
        return 'dark';
    }
    
    return data.dark_mode ? 'dark' : 'light';
}