import { supabase } from '@/config/supabaseClient'

export const getClass = async()=> {
    const { data: { session } } = await supabase.auth.getSession();

    const userId = session.user.id;
    
    const { data, error } = await supabase
        .from('user_settings')
        .select('class')    
        .eq('user_id', userId )     

    if (error){
        console.error("Class couldn't be fetched because: ", error);
    } else {
        console.log("User class fetched successfully:", data ? data[0] : 'No data returned');
    }

    return { data, error };
}