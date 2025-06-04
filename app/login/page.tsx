"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, User } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error("Invalid credentials. Please try again.")
        console.error("Login error:", error)
      } else {
        toast.success("Login successful!")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
      console.error("Unexpected login error:", error)
    } finally {
      setIsLoading(false)
    }
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
