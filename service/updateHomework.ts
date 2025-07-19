import { supabase } from '@/config/supabaseClient';

type UpdateHomeworkPayload = {
    subject?: string;
    to_do?: string;
    due_date?: string;
};

export const updateHomework = async (
    homeworkId: number, 
    updates: UpdateHomeworkPayload
) => {
    const { data, error } = await supabase
        .from('homework')
        .update(updates)
        .eq('id', homeworkId)
        .select();

    if (error) {
        console.error("Error updating homework:", error.message);
    }

    return { data, error };
};