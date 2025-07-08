import supabase from '@/config/supabaseClient'

export const getTheme = async () => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('theme')
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.error('Error fetching theme or no theme set:', error);
    return 'light'; // Default theme
  }

  return data.theme || 'light';
};
