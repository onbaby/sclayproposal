import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard-content"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-slate-900/50">
        <Header />
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <header className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Proposal Dashboard</h1>
              <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                View and manage all your proposal generations
              </p>
            </header>
            <DashboardContent />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
