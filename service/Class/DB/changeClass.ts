import { supabase } from '@/config/supabaseClient'

export const changeClass = async (course: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session.user.id;
    const { data, error } = await supabase
        .from('user_settings')
        .update({ class: course }) 
        .eq('user_id', userId)     
        .select()               
    if (error){
        console.error("Class couldn't be updated because: ", error);
    } else {
        console.log("User class updated successfully:", data ? data[0] : 'No data returned');
    }

    return { data, error };
}