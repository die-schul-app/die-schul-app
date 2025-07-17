import { supabase } from '@/config/supabaseClient'
import { User } from '@supabase/supabase-js'

export const deleteHomework = async(user: User)  => {

    const {data, error} = await supabase
        .from('homework')  
        .delete()  
        .eq('id', user.id)
}
