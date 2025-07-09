import { supabase } from '@/config/supabaseClient'
import { User } from '@supabase/supabase-js'

export default async function insertHomework( user: User, text: string, date: string, assignment: string ): Promise<void> {
    if (!user) {
        console.error('User not authenticated')
        return
    }

    const {data, error} = await supabase
        .from('Homework')
        .insert([{Subjekt: text, due: date, to_do: assignment, user_id: user.id}])

    if (error) {
        console.error('Insert error:', error)
    } else {
        console.log('Inserted data:', data)
    }
}
