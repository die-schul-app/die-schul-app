import supabase from '@/config/supabaseClient'

async function createSettingsTable() {
    const {
        data,
        error,
    } = await supabase.rpc('create_user_settings_table')

    if (error) {
        console.error('Error creating user_settings table:', error)
    } else {
        console.log('user_settings table created successfully:', data)
    }
}

createSettingsTable()
