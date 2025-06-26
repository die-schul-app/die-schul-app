import supabase from '@/config/supabaseClient'
import { useEffect, useState } from 'react'

export default function useHomework() {
  const [error, setError] = useState<string | null>(null)
  const [Homework, setHomework] = useState<any[] | null>(null)
  
  async function getHomework() {
  const { data, error } = await supabase
    .from('Homework')
    .insert([])

  if (error) {
    console.error(' Insert error:', error)
  } else {
    console.log(' Inserted data:', data)
  }
}
  

getHomework()

  useEffect(() => {
    const fetchHomework = async () => {
      const { data, error } = await supabase.from('Homework').select()

      if (error) {
        setError('Couldnt fetch')
        setHomework(null)
        console.log(error)
      } else {
        setHomework(data)
        setError(null)
        console.log(data)
        
      }
    }

    fetchHomework()
  }, [])

  return { error, Homework }
}
