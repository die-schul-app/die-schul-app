import {supabase} from '@/config/supabaseClient';

export const logout = async () => {
    const {error} = await supabase.auth.signOut();
    return {error};
};
