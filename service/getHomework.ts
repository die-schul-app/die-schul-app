import { supabase } from '@/config/supabaseClient'
import { User } from '@supabase/supabase-js'

export const getHomework = async ( user: User ) => {
    if (!user) {
        return {error: 'User not authenticated', Homework: null}
    }

    const {data, error} = await supabase
        .from('Homework')
        .select('*')
        .eq('user_id', user.id)

    if (error) {
        return {error: 'Couldnt fetch homework', Homework: null}
    } else {
        return {error: null, Homework: data}
    }
}



 
