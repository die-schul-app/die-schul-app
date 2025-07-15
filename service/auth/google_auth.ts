import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/config/supabaseClient';

export const signInWithGoogle = async () => {
  const redirectUri = makeRedirectUri({
    scheme: 'dieschulapp',
    path: '/(tabs)/homework',
  });

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
    },
  });
};
