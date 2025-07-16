import { supabase } from '@/config/supabaseClient'

export default async function insertHomework( user: string, text: string, date: string, assignment: string ): Promise<void> {
    if (!user) {
        console.error('User not authenticated')
        return
    }

    const {data, error} = await supabase
        .from('homework')
        .insert([{subject: text, due_date: date, to_do: assignment, user_id: user}])

    if (error) {
        console.error('Insert error:', error)
    } else {
        console.log('Inserted data:', data)
    }
}
