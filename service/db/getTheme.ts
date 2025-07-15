import { supabase } from '@/config/supabaseClient'
import { User } from '@supabase/supabase-js'

export const getTheme = async ( user: User | null ) => {
    if (!user) {
        return 'dark'
    }

    const {data, error} = await supabase
        .from('Homework')
        .select('theme')
        .eq('user_id', user.id)

    if (error || !data) {
        console.error('Error fetching theme or no theme set:', error)
        return 'dark'
    }

    return data.theme || 'dark'
}
