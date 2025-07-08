import supabase from '@/config/supabaseClient'
import { useEffect, useState } from 'react'


export default function getHomework(){
  const [error, setError] = useState<string | null>(null)
  const [Homework, setHomework] = useState<any[] | null>(null)


   const fetchHomework = async () => {
    const { data, error } = await supabase.from('Homework').select();

    if (error) {
      setError('Couldnt fetch homework');
      setHomework(null);
      console.error(error);
    } else {
      setHomework(data);
      setError(null);
    }
  };

  useEffect(() => {
    fetchHomework();

    const channel = supabase
      .channel('homework-updates')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'Homework',
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchHomework();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { error, Homework };
}



 
