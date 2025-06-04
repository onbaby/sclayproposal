"use client" // This page now needs to be a client component for state

import { useState } from "react"
import { ProposalForm } from "@/components/proposal-form" // This is your "Onboarding" form
import { ProspectsForm } from "@/components/prospects-form"
import { FormSelector } from "@/components/form-selector"
import { Header } from "@/components/header"

export default function MultiFormPage() {
  const [activeForm, setActiveForm] = useState<"onboarding" | "prospects">("onboarding")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-900/50">
      <Header />

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white inline-flex items-center">
            Sclay AI Data Entry
          </h1>
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Switch between Onboarding and Prospects forms.
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <FormSelector activeForm={activeForm} setActiveForm={setActiveForm} />

          {activeForm === "onboarding" && (
            <div>
              <h2 className="text-3xl font-semibold text-center mb-6 text-sclayGreen-DEFAULT/90">Onboarding Form</h2>
              <ProposalForm />
            </div>
          )}

          {activeForm === "prospects" && (
            <div>
              <h2 className="text-3xl font-semibold text-center mb-6 text-sclayGreen-DEFAULT/90">Prospects Form</h2>
              <ProspectsForm />
            </div>
          )}
        </main>

        <footer className="text-center mt-12 py-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Sclay AI. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}
