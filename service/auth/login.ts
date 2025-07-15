import { supabase } from '@/config/supabaseClient';

export const loginWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};
