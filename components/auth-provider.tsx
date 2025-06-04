"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  supabaseError: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  supabaseError: null,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setSupabaseError("Supabase configuration is missing. Please check your environment variables.")
      setLoading(false)
      return
    }

    // Dynamically import and initialize Supabase only if env vars are available
    const initializeAuth = async () => {
      try {
        const { supabase } = await import("@/lib/supabase/client")

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setLoading(false)

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)

          if (event === "SIGNED_IN") {
            router.push("/")
          } else if (event === "SIGNED_OUT") {
            router.push("/login")
          }
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Failed to initialize Supabase:", error)
        setSupabaseError("Failed to initialize authentication. Please check your Supabase configuration.")
        setLoading(false)
      }
    }

    const cleanup = initializeAuth()
    return () => {
      cleanup.then((unsubscribe) => unsubscribe?.())
    }
  }, [router])

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (!loading && !user && !supabaseError && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, loading, pathname, router, supabaseError])

  const signOut = async () => {
    try {
      const { supabase } = await import("@/lib/supabase/client")
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  const value = {
    user,
    loading,
    signOut,
    supabaseError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
