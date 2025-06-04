"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { AuthLoading } from "@/components/auth-loading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, supabaseError } = useAuth()

  if (loading) {
    return <AuthLoading />
  }

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

  if (!user) {
    return null // AuthProvider will redirect to login
  }

  return <>{children}</>
}
