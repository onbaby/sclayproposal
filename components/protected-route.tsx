"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { AuthLoading } from "@/components/auth-loading"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoading />
  }

  if (!user) {
    return null // AuthProvider will redirect to login
  }

  return <>{children}</>
}
