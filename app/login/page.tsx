"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { supabaseError } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Check if Supabase is available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError("Supabase configuration is missing. Please check your environment variables.")
        setIsLoading(false)
        return
      }

      const { supabase } = await import("@/lib/supabase/client")

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError("Invalid credentials. Please try again.")
        console.error("Login error:", authError)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Unexpected login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show configuration error if Supabase is not properly set up
  if (supabaseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-slate-900/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/images/sclaylogo.png" alt="Sclay AI Logo" className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-400">Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{supabaseError}</AlertDescription>
            </Alert>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Please ensure the following environment variables are set:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-900/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/images/sclaylogo.png" alt="Sclay AI Logo" className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-sclayGreen-DEFAULT">Sclay AI Login</CardTitle>
          <CardDescription>Enter your credentials to access the proposal generator</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="email" className="flex items-center">
                <User className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="password" className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sclayGreen-DEFAULT hover:bg-sclayGreen-dark text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
