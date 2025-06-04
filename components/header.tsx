"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/images/sclaylogo.png" alt="Sclay AI Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">Sclay AI</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          {isDashboard ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Forms</span>
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
