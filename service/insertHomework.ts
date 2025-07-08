import supabase from '@/config/supabaseClient'

export default async function insertHomework(text: string, date: string, assignment: string): Promise<void> {
  const { data, error } = await supabase
    .from('Homework')
    .insert([{ Subjekt: text, due: date, to_do: assignment}]);

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Inserted data:', data);
  }
}
