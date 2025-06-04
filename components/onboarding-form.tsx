import React, { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { submitOnboarding, type OnboardingFormState } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, Loader2 } from 'lucide-react'

const OnboardingForm: React.FC = () => {
  const [actionState, formAction, isActionPending] = useActionState(submitOnboarding, {
    message: '',
    success: false,
    errors: {},
    submittedData: {}
  } as OnboardingFormState)
  const [displayMessage, setDisplayMessage] = useState('')
  const [displayErrors, setDisplayErrors] = useState<Record<string, string[]>>({})

  // Phone formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    e.target.value = formatted
  }

  useEffect(() => {
    setDisplayMessage(actionState.message)
    setDisplayErrors(actionState.errors || {})

    if (actionState.success) {
      console.log("Onboarding Data Submitted:", actionState.submittedData)
    }
  }, [actionState])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formAction(formData)
  }

  const getError = (fieldName: string) => {
    if (displayErrors[fieldName]) {
      return <p className="text-sm text-red-500 mt-1">{displayErrors[fieldName].join(", ")}</p>
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="form-section bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
            Contact Information
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Please provide your contact details to get started</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Email
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g., john@example.com"
              required
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("email")}
          </div>
          <div>
            <Label htmlFor="phone" className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Phone Number
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g., 555-123-4567"
              required
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
              onChange={handlePhoneChange}
            />
            {getError("phone")}
          </div>
        </CardContent>
      </Card>

      <div className="form-section pt-6">
        {displayMessage && (
          <p
            className={`mb-4 p-3 rounded-md text-sm ${
              actionState.success ? "bg-sclayGreen-DEFAULT/20 text-sclayGreen-DEFAULT" : "bg-red-500/20 text-red-400"
            }`}
          >
            {displayMessage}
          </p>
        )}
        <Button
          type="submit"
          disabled={isActionPending}
          size="lg"
          className="w-full sm:w-auto bg-white text-black hover:bg-sclayGreen-DEFAULT hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-sclayGreen-DEFAULT focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center"
        >
          {isActionPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isActionPending ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  )
}

export default OnboardingForm 