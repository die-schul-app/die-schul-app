import { supabase } from '@/config/supabaseClient'
import { User } from '@supabase/supabase-js'

export const setTheme = async ( user: User | null, theme: string ) => {
    if (!user) {
        console.error('User not authenticated')
        return
    }

    const {data, error} = await supabase
        .from('user_settings')
        .upsert({user_id: user.id, theme})
        .select()

    if (error) {
        console.error('Error setting theme:', error)
    }

    return data
}
