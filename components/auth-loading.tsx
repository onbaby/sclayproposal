import { Loader2 } from "lucide-react"

export function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-900/50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <img src="/images/sclaylogo.png" alt="Sclay AI Logo" className="h-16 w-16" />
        <Loader2 className="h-8 w-8 animate-spin text-sclayGreen-DEFAULT" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
