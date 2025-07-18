import { supabase } from '@/config/supabaseClient'

export const deleteHomework = async(homework_id: number)  => {

    const {data, error} = await supabase
        .from('homework')  
        .delete()  
        .eq('id', homework_id)

    if (error){
        console.error("Homework couldn't be deleted because: ", error);
    }
    return {data, error}
}
