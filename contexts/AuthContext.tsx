import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/config/supabaseClient'

export const AuthContext = createContext<{ session: Session | null; user: User | null }>({session: null, user: null})

export const AuthProvider = ( {children}: any ) => {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(( {data: {session}} ) => {
            setSession(session)
            setUser(session?.user ?? null)
        })

        const {data: authListener} = supabase.auth.onAuthStateChange(( _event, session ) => {
            setSession(session)
            setUser(session?.user ?? null)
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{session, user}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
