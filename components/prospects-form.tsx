"use client"
import { useActionState, useEffect, useRef, useState, useTransition } from "react" // Import useTransition
import type React from "react"

import { submitProspect, type ProspectFormState } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Import Popover components
import { Calendar } from "@/components/ui/calendar" // Import Calendar component
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  MessageCircle,
  ListChecks,
  CircleDollarSign,
  Users,
  FileText,
  Code,
  Eraser,
  Loader2,
  CalendarIcon,
} from "lucide-react"
import { format } from "date-fns" // Import format for date formatting
import { cn } from "@/lib/utils" // Import cn for conditional class names

const businessTypes = ["Roofer", "Towing", "Detailing", "HVAC", "Landscaping", "Consulting", "Other"]

const servicesInterested = [
  { id: "website", label: "Website" },
  { id: "aiCallAgent", label: "AI call agent" },
  { id: "bookingSystem", label: "Booking system" },
  { id: "automation", label: "Automation" },
  { id: "crm", label: "CRM" },
  { id: "reviewBoost", label: "Review boost" },
  { id: "notSure", label: "Not sure" },
]

const budgetFeels = ["Open", "Budget-conscious", "Didn't say"]
const followUpTypes = ["Follow-up call", "Proposal needed", "Wants pricing", "Just info"]

export function ProspectsForm() {
  const initialState: ProspectFormState = { message: "", success: false }
  // The `pending` state from useActionState might not update correctly when action is called manually.
  // We'll use `isPending` from `useTransition` for more reliable UI feedback during manual invocation.
  const [actionState, formAction, isActionPending] = useActionState(submitProspect, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  const [isTransitionPending, startTransition] = useTransition() // For wrapping the manual action call

  const [selectedBusinessType, setSelectedBusinessType] = useState<string | undefined>(undefined)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedFollowUpType, setSelectedFollowUpType] = useState<string | undefined>(undefined) // New state for follow-up type
  const [followUpCallDate, setFollowUpCallDate] = useState<Date | undefined>(undefined) // New state for follow-up call date

  const [displayMessage, setDisplayMessage] = useState<string>("")
  const [displayErrors, setDisplayErrors] = useState<Record<string, string[]> | undefined>(undefined)

  useEffect(() => {
    setDisplayMessage(actionState.message)
    setDisplayErrors(actionState.errors)

    if (actionState.success) {
      formRef.current?.reset()
      setSelectedBusinessType(undefined)
      setSelectedServices([])
      setSelectedFollowUpType(undefined) // Reset follow-up type
      setFollowUpCallDate(undefined) // Reset follow-up call date
      console.log("Prospect Data Submitted:", actionState.submittedData)
    }
  }, [actionState])

  const getError = (fieldName: string) => {
    if (displayErrors && displayErrors[fieldName]) {
      return <p className="text-sm text-red-500 mt-1">{displayErrors[fieldName]?.join(", ")}</p>
    }
    return null
  }

  const handleServiceChange = (checked: boolean, serviceLabel: string) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, serviceLabel])
    } else {
      setSelectedServices((prev) => prev.filter((s) => s !== serviceLabel))
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formRef.current) return

    const formData = new FormData(formRef.current)
    formData.delete("prospectServicesInterested")
    selectedServices.forEach((service) => {
      formData.append("prospectServicesInterested", service)
    })

    // Manually append followUpCallDate if it exists
    if (followUpCallDate) {
      formData.append("prospectFollowUpCallDate", format(followUpCallDate, "yyyy-MM-dd"))
    } else {
      formData.delete("prospectFollowUpCallDate") // Ensure it's not sent if not selected
    }

    setDisplayMessage("")
    setDisplayErrors(undefined)

    startTransition(() => {
      formAction(formData)
    })
  }

  const handleClear = () => {
    if (formRef.current) {
      formRef.current.reset()
      setSelectedBusinessType(undefined)
      setSelectedServices([])
      setSelectedFollowUpType(undefined) // Clear follow-up type
      setFollowUpCallDate(undefined) // Clear follow-up call date
      setDisplayMessage("")
      setDisplayErrors(undefined)
    }
  }

  const fillSampleData = () => {
    if (formRef.current) {
      const form = formRef.current
      ;(form.querySelector('[name="prospectBusinessName"]') as HTMLInputElement).value = "Apex Roofing Solutions"
      ;(form.querySelector('[name="prospectFirstName"]') as HTMLInputElement).value = "John"
      ;(form.querySelector('[name="prospectLastName"]') as HTMLInputElement).value = "Smith"
      ;(form.querySelector('[name="prospectPhone"]') as HTMLInputElement).value = "555-123-4567"
      ;(form.querySelector('[name="prospectEmail"]') as HTMLInputElement).value = "john@apexroofing.com"
      ;(form.querySelector('[name="prospectCityState"]') as HTMLInputElement).value = "Atlanta, GA"
      ;(form.querySelector('[name="prospectPainPoint"]') as HTMLInputElement).value =
        "Misses calls while on rooftops, loses potential customers"
      ;(form.querySelector('[name="prospectCallNotes"]') as HTMLTextAreaElement).value =
        "Very interested in AI call agent. Currently uses basic voicemail. Wants to capture leads 24/7."
      setSelectedBusinessType("Roofer")
      setSelectedServices(["Website", "AI call agent", "Automation"])
      setSelectedFollowUpType("Follow-up call") // Set sample follow-up type
      setFollowUpCallDate(new Date(2025, 6, 15)) // Set a sample date (July 15, 2025)
    }
  }

  // Use isTransitionPending for the submit button's disabled and loading state
  const actualPending = isActionPending || isTransitionPending

  return (
    <div className="relative">
      <button
        type="button"
        onClick={fillSampleData}
        className="fixed bottom-4 left-4 z-50 p-2 bg-sclayGreen-DEFAULT hover:bg-sclayGreen-dark text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Fill sample data (Development)"
      >
        <Code className="w-4 h-4" />
      </button>

      <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
        {/* ... rest of the form structure ... */}
        <Card className="form-section bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
              <Building2 className="mr-2 h-6 w-6" /> Business & Contact
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Alex pls lock in</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prospectBusinessName" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Business Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="prospectBusinessName"
                name="prospectBusinessName"
                placeholder="e.g., Apex Solutions"
                required
                className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
              />
              {getError("prospectBusinessName")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prospectFirstName" className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> First Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="prospectFirstName"
                  name="prospectFirstName"
                  placeholder="e.g., Jane"
                  required
                  className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
                />
                {getError("prospectFirstName")}
              </div>
              <div>
                <Label htmlFor="prospectLastName" className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Last Name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="prospectLastName"
                  name="prospectLastName"
                  placeholder="e.g., Smith"
                  required
                  className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
                />
                {getError("prospectLastName")}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prospectPhone" className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Phone
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="prospectPhone"
                  name="prospectPhone"
                  placeholder="e.g., 555-123-4567"
                  required
                  className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
                />
                {getError("prospectPhone")}
              </div>
              <div>
                <Label htmlFor="prospectEmail" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Email
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="prospectEmail"
                  name="prospectEmail"
                  type="email"
                  placeholder="e.g., jane@apex.com"
                  required
                  className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
                />
                {getError("prospectEmail")}
              </div>
            </div>
            <div>
              <Label htmlFor="prospectCityState" className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> City / State
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="prospectCityState"
                name="prospectCityState"
                placeholder="e.g., Atlanta"
                defaultValue="GA"
                required
                className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
              />
              {getError("prospectCityState")}
            </div>
            <div>
              <Label htmlFor="prospectBusinessType" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Business Type
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                name="prospectBusinessType"
                required
                onValueChange={(value) => setSelectedBusinessType(value)}
                value={selectedBusinessType}
              >
                <SelectTrigger className="w-full mt-1 bg-input focus:ring-sclayGreen-DEFAULT">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border border-border">
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError("prospectBusinessType")}
              {selectedBusinessType === "Other" && (
                <div className="mt-4 animate-fadeIn">
                  <Label htmlFor="otherBusinessType" className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Specify Other Business Type
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="otherBusinessType"
                    name="otherBusinessType"
                    placeholder="e.g., E-commerce, Non-profit"
                    required // Make required if "Other" is selected
                    className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
                  />
                  {getError("otherBusinessType")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="form-section bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
              <MessageCircle className="mr-2 h-6 w-6" /> Needs & Interests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prospectPainPoint" className="flex items-center">
                <MessageCircle className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Pain Point (1-line)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="prospectPainPoint"
                name="prospectPainPoint"
                placeholder="e.g., Misses calls, loses jobs while driving"
                required
                className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
              />
              {getError("prospectPainPoint")}
            </div>
            <div>
              <Label className="flex items-center mb-2">
                <ListChecks className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Services Proposed
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="space-y-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {servicesInterested.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`prospect-${service.id}`}
                      name="prospectServicesInterested" // Name is still useful for non-JS scenarios or if we change submission
                      value={service.label}
                      checked={selectedServices.includes(service.label)}
                      onCheckedChange={(checked) => handleServiceChange(Boolean(checked), service.label)}
                      className="data-[state=checked]:bg-sclayGreen-DEFAULT data-[state=checked]:text-sclayGreen-foreground border-sclayGreen-DEFAULT/50"
                    />
                    <Label htmlFor={`prospect-${service.id}`} className="font-normal text-sm">
                      {service.label}
                    </Label>
                  </div>
                ))}
              </div>
              {getError("prospectServicesInterested")}
            </div>
          </CardContent>
        </Card>

        <Card className="form-section bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
              <Users className="mr-2 h-6 w-6" /> Client Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prospectBudgetFeel" className="flex items-center">
                <CircleDollarSign className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Budget Feel (If Applicable)
              </Label>
              <Select name="prospectBudgetFeel" value={undefined} onValueChange={() => {}}>
                <SelectTrigger className="w-full mt-1 bg-input focus:ring-sclayGreen-DEFAULT">
                  <SelectValue placeholder="Select budget feel" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border border-border">
                  {budgetFeels.map((feel) => (
                    <SelectItem key={feel} value={feel}>
                      {feel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError("prospectBudgetFeel")}
            </div>
            <div>
              <Label htmlFor="prospectFollowUpType" className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Follow-Up Type
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                name="prospectFollowUpType"
                required
                onValueChange={(value) => setSelectedFollowUpType(value)}
                value={selectedFollowUpType}
              >
                <SelectTrigger className="w-full mt-1 bg-input focus:ring-sclayGreen-DEFAULT">
                  <SelectValue placeholder="Select follow-up type" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border border-border">
                  {followUpTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError("prospectFollowUpType")}
            </div>
            {selectedFollowUpType === "Follow-up call" && (
              <div className="animate-fadeIn">
                <Label htmlFor="prospectFollowUpCallDate" className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Follow-Up Call Date
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1 bg-input hover:bg-muted focus:ring-sclayGreen-DEFAULT",
                        !followUpCallDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {followUpCallDate ? format(followUpCallDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black text-white border border-border">
                    <Calendar mode="single" selected={followUpCallDate} onSelect={setFollowUpCallDate} initialFocus />
                  </PopoverContent>
                </Popover>
                {/* Hidden input to send the date string with the form data */}
                <Input
                  type="hidden"
                  name="prospectFollowUpCallDate"
                  value={followUpCallDate ? format(followUpCallDate, "yyyy-MM-dd") : ""}
                />
                {getError("prospectFollowUpCallDate")}
              </div>
            )}
            <div>
              <Label htmlFor="prospectCallNotes" className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" /> Call Notes (Optional)
              </Label>
              <Textarea
                id="prospectCallNotes"
                name="prospectCallNotes"
                placeholder="e.g., Tows himself. Uses Square. Wants AI but concerned about negotiation flexibility."
                className="mt-1 min-h-[100px] bg-input focus:ring-sclayGreen-DEFAULT"
              />
              {getError("prospectCallNotes")}
            </div>
          </CardContent>
        </Card>

        <div className="form-section pt-6">
          {displayMessage && (
            <p
              className={`mb-4 p-3 rounded-md text-sm ${actionState.success ? "bg-sclayGreen-DEFAULT/20 text-sclayGreen-DEFAULT" : "bg-red-500/20 text-red-400"}`}
            >
              {displayMessage}
            </p>
          )}
          {!actionState.success && displayErrors && Object.keys(displayErrors).length > 0 && (
            <div className="mb-4 p-3 rounded-md text-sm bg-red-500/20 text-red-400 text-left">
              <p className="font-semibold">Please correct the following errors:</p>
              <ul className="list-disc list-inside">
                {Object.entries(displayErrors).map(([field, messages]) =>
                  messages?.map((message, index) => (
                    <li key={`${field}-${index}`}>
                      {field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}: {message}
                    </li>
                  )),
                )}
              </ul>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              type="button"
              onClick={handleClear}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 ease-in-out focus:ring-2 focus:ring-sclayGreen-DEFAULT focus:ring-offset-2 focus:ring-offset-background"
              disabled={actualPending}
            >
              <Eraser className="mr-2 h-4 w-4" /> Clear Form
            </Button>
            <Button
              type="submit"
              disabled={actualPending}
              size="lg"
              className="w-full sm:w-auto bg-white text-black hover:bg-sclayGreen-DEFAULT hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-sclayGreen-DEFAULT focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center"
            >
              {actualPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actualPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
