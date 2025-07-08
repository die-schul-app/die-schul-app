import supabase from '@/config/supabaseClient';

export const setTheme = async (theme: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ id: 1, theme })
    .select();

  if (error) {
    console.error('Error setting theme:', error);
  }

  return data;
};
