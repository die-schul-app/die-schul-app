import { supabase } from '@/config/supabaseClient';
import { User } from '@supabase/supabase-js';

export const getHomework = async (user: User, homework_id?: number) => {
    let query = supabase.from('homework').select('*');

    if (homework_id) {
        query = query.eq('id', homework_id);
    } else {
        query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
        return { error: 'Couldnt fetch homework', Homework: null };
    } 
    
    return { error: null, Homework: data };
};