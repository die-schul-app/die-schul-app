import { supabase } from '@/config/supabaseClient';
import { User } from '@supabase/supabase-js';

export const getHomework = async (user: User) => {
    
    const {error, data} = await supabase
        .from('homework')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

    if (error) {
        return {error: 'Couldnt fetch homework', Homework: null}
    } else {
        return {error: null, Homework: data}
    }
};