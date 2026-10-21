
import {
    useEffect,
    useState,
} from 'react'
import { supabase } from '../lib/supabase'

import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        })

        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession()

            if (!isMounted) return

            if (error) {
                console.error('Unable to check session:', error.message)
            }

            setUser(data?.session?.user ?? null)
            setLoading(false)
        }

        checkSession()

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async ({ email, password }) => {
        return supabase.auth.signUp({ email, password })
    }

    const signIn = async ({ email, password }) => {
        return supabase.auth.signInWithPassword({ email, password })
    }

    const signOut = async () => {
        return supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider
            value={{ user, loading, signUp, signIn, signOut }}
        >
            {children}
        </AuthContext.Provider>
    )
}


