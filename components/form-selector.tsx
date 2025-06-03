"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FormSelectorProps {
  activeForm: "onboarding" | "prospects"
  setActiveForm: (form: "onboarding" | "prospects") => void
}

export function FormSelector({ activeForm, setActiveForm }: FormSelectorProps) {
  return (
    <div className="mb-8 flex justify-center space-x-2 sm:space-x-4 p-1 bg-muted rounded-lg">
      <Button
        variant={activeForm === "onboarding" ? "default" : "ghost"}
        onClick={() => setActiveForm("onboarding")}
        className={cn(
          "w-full sm:w-auto px-6 py-3 text-sm sm:text-base transition-all duration-200 ease-in-out",
          activeForm === "onboarding"
            ? "bg-sclayGreen-dark text-sclayGreen-foreground shadow-md" // Changed to sclayGreen-dark
            : "text-muted-foreground hover:bg-sclayGreen-DEFAULT/10 hover:text-sclayGreen-DEFAULT",
        )}
      >
        Onboarding Form
      </Button>
      <Button
        variant={activeForm === "prospects" ? "default" : "ghost"}
        onClick={() => setActiveForm("prospects")}
        className={cn(
          "w-full sm:w-auto px-6 py-3 text-sm sm:text-base transition-all duration-200 ease-in-out",
          activeForm === "prospects"
            ? "bg-sclayGreen-dark text-sclayGreen-foreground shadow-md" // Changed to sclayGreen-dark
            : "text-muted-foreground hover:bg-sclayGreen-DEFAULT/10 hover:text-sclayGreen-DEFAULT",
        )}
      >
        Prospects Form
      </Button>
    </div>
  )
}
