"use client"

import React from "react"

import { useActionState, useEffect, useRef, useState, useTransition } from "react" // Added useTransition
import { submitProposal, type ProposalFormState } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Building2,
  User,
  Briefcase,
  MapPin,
  Link2,
  MessageSquare,
  ListChecks,
  Tag,
  CircleDollarSign,
  CalendarDays,
  Mail,
  Globe,
  ImageIcon,
  Share2,
  Eraser,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const services = [
  { id: "website", label: "Website redesign or new build" },
  { id: "aiVoiceAgent", label: "AI voice agent (inbound/outbound)" },
  { id: "automationSetup", label: "Automation setup (Zapier, Make, CRM workflows)" },
  { id: "bookingSystem", label: "Booking system" },
  { id: "googleReview", label: "Google review generation" },
  { id: "leadScraping", label: "Lead scraping or database building" },
  { id: "monthlyRetainerMgmt", label: "Monthly retainer for management" },
]

const paymentTermsOptions = [
  { id: "upfront", label: "100% Upfront" },
  { id: "5050", label: "50% Upfront, 50% Upon Completion" },
  { id: "monthly", label: "Monthly Billing" },
]

export function ProposalForm() {
  const initialState: ProposalFormState = { message: "", success: false }
  const [actionState, formAction, isActionPending] = useActionState(submitProposal, initialState) // Renamed to actionState, isActionPending
  const formRef = useRef<HTMLFormElement>(null)

  const [isTransitionPending, startTransition] = useTransition() // For wrapping the manual action call

  const [startDate, setStartDate] = React.useState<Date | undefined>()
  const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>()
  const [selectedServices, setSelectedServices] = useState<string[]>([]) // State for checkboxes

  // Local state for displaying messages and errors
  const [displayMessage, setDisplayMessage] = useState<string>("")
  const [displayErrors, setDisplayErrors] = useState<Record<string, string[]> | undefined>(undefined)

  useEffect(() => {
    // Update local display state based on actionState
    setDisplayMessage(actionState.message)
    setDisplayErrors(actionState.errors)

    if (actionState.success) {
      formRef.current?.reset()
      setStartDate(undefined)
      setDeliveryDate(undefined)
      setSelectedServices([]) // Reset selected services on success
      console.log("Submitted Data:", actionState.submittedData)
    }
  }, [actionState]) // Depend on actionState

  // Helper to get error messages
  const getError = (fieldName: string) => {
    if (displayErrors && displayErrors[fieldName]) {
      return <p className="text-sm text-red-500 mt-1">{displayErrors[fieldName]?.join(", ")}</p>
    }
    return null
  }

  // Handler for checkbox changes
  const handleServiceChange = (checked: boolean, serviceLabel: string) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, serviceLabel])
    } else {
      setSelectedServices((prev) => prev.filter((s) => s !== serviceLabel))
    }
  }

  // Custom submit handler to ensure only checked services are sent
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Prevent default form submission

    if (!formRef.current) return

    const formData = new FormData(formRef.current)

    // Remove all existing 'servicesOffered' entries from formData
    formData.delete("servicesOffered")

    // Append only the services that are actually selected in our state
    selectedServices.forEach((service) => {
      formData.append("servicesOffered", service)
    })

    // Clear previous messages/errors before new submission attempt
    setDisplayMessage("")
    setDisplayErrors(undefined)

    startTransition(() => {
      formAction(formData)
    })
  }

  // Function to clear all form inputs and states
  const handleClear = () => {
    if (formRef.current) {
      formRef.current.reset() // Resets native form inputs
      setStartDate(undefined) // Resets controlled date picker
      setDeliveryDate(undefined) // Resets controlled date picker
      setSelectedServices([]) // Resets controlled checkboxes
      setDisplayMessage("") // Clear local message state
      setDisplayErrors(undefined) // Clear local errors state
    }
  }

  // Use isTransitionPending for the submit button's disabled and loading state
  const actualPending = isActionPending || isTransitionPending

  return (
    <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
      <Card className="form-section bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
            <Building2 className="mr-2 h-6 w-6" /> Client Business Details
          </CardTitle>
          <CardDescription>Information about the client's business.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clientName" className="flex items-center">
              <User className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Client Name<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="e.g., John Doe"
              required
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("clientName")}
          </div>
          <div>
            <Label htmlFor="businessName" className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Business Name<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="businessName"
              name="businessName"
              placeholder="e.g., Acme Corp"
              required
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("businessName")}
          </div>
          <div>
            <Label htmlFor="industryNiche" className="flex items-center">
              <Tag className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Industry/Niche<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="industryNiche"
              name="industryNiche"
              placeholder="e.g., Roofing, Coaching"
              required
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("industryNiche")}
          </div>
          <div>
            <Label htmlFor="location" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Location<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., New York, NY"
              required
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("location")}
          </div>
          <div>
            <Label htmlFor="websiteUrl" className="flex items-center">
              <Link2 className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Website URL (Optional)
            </Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              placeholder="https://example.com"
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("websiteUrl")}
          </div>
        </CardContent>
      </Card>

      <Card className="form-section bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
            <MessageSquare className="mr-2 h-6 w-6" /> Pain Points or Goals
            <span className="text-red-500 ml-1">*</span>
          </CardTitle>
          <CardDescription>A short note on what they need or why they reached out.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="painPointsGoals"
            name="painPointsGoals"
            placeholder="e.g., They miss calls frequently and lose leads. Wants automation to handle inbound calls and book jobs."
            required
            className="min-h-[100px] bg-input focus:ring-sclayGreen-DEFAULT"
          />
          {getError("painPointsGoals")}
        </CardContent>
      </Card>

      <Card className="form-section bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
            <ListChecks className="mr-2 h-6 w-6" /> Services Offered
            <span className="text-red-500 ml-1">*</span>
          </CardTitle>
          <CardDescription>Select the services to include in this proposal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox
                id={service.id}
                name="servicesOffered"
                value={service.label}
                checked={selectedServices.includes(service.label)} // Controlled component
                onCheckedChange={(checked) => handleServiceChange(Boolean(checked), service.label)} // Update state
                className="data-[state=checked]:bg-sclayGreen-DEFAULT data-[state=checked]:text-sclayGreen-foreground border-sclayGreen-DEFAULT/50"
              />
              <Label htmlFor={service.id} className="font-normal">
                {service.label}
              </Label>
            </div>
          ))}
          {getError("servicesOffered")}
        </CardContent>
      </Card>

      <Card className="form-section bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
            <CircleDollarSign className="mr-2 h-6 w-6" /> Pricing
            <span className="text-red-500 ml-1">*</span>
          </CardTitle>
          <CardDescription>Define the pricing structure for this proposal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oneTimeFee">One-Time Fee (Optional)</Label>
              <Input
                id="oneTimeFee"
                name="oneTimeFee"
                type="number"
                placeholder="e.g., 500"
                className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
              />
              {getError("oneTimeFee")}
            </div>
            <div>
              <Label htmlFor="monthlyRetainer">Monthly Retainer (Optional)</Label>
              <Input
                id="monthlyRetainer"
                name="monthlyRetainer"
                type="number"
                placeholder="e.g., 120"
                className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
              />
              {getError("monthlyRetainer")}
            </div>
          </div>
          <div>
            <Label htmlFor="performanceBased">Performance-Based (Optional)</Label>
            <Textarea
              id="performanceBased"
              name="performanceBased"
              placeholder="Describe performance-based pricing if applicable"
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("performanceBased")}
          </div>
          <div>
            <Label htmlFor="paymentTerms">
              Payment Terms<span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="paymentTerms" required>
              <SelectTrigger className="w-full mt-1 bg-input focus:ring-sclayGreen-DEFAULT">
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border border-border">
                {" "}
                {/* Changed to bg-black text-white */}
                {paymentTermsOptions.map((option) => (
                  <SelectItem key={option.id} value={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getError("paymentTerms")}
          </div>
        </CardContent>
      </Card>

      <Card className="form-section bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
            <CalendarDays className="mr-2 h-6 w-6" /> Timeline
            <span className="text-red-500 ml-1">*</span>
          </CardTitle>
          <CardDescription>Project timeline details.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectStartDate">
              Project Start Date<span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1 bg-input hover:bg-muted focus:ring-sclayGreen-DEFAULT",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black text-white border border-border">
                {" "}
                {/* Changed to bg-black text-white */}
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Input type="hidden" name="projectStartDate" value={startDate ? format(startDate, "yyyy-MM-dd") : ""} />
            {getError("projectStartDate")}
          </div>
          <div>
            <Label htmlFor="estimatedDeliveryDate">
              Estimated Delivery Date<span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1 bg-input hover:bg-muted focus:ring-sclayGreen-DEFAULT",
                    !deliveryDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black text-white border border-border">
                {" "}
                {/* Changed to bg-black text-white */}
                <Calendar
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  initialFocus
                  disabled={(date) => startDate && date < startDate}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="hidden"
              name="estimatedDeliveryDate"
              value={deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : ""}
            />
            {getError("estimatedDeliveryDate")}
          </div>
        </CardContent>
      </Card>

      <Card className="form-section bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-sclayGreen-DEFAULT">
            <User className="mr-2 h-6 w-6" /> Your Contact & Branding
            <span className="text-red-500 ml-1">*</span>
          </CardTitle>
          <CardDescription>Your information for the proposal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="yourName" className="flex items-center">
              <User className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Your Name<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="yourName"
              name="yourName"
              placeholder="Your Name"
              required
              defaultValue="Sclay AI Team"
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("yourName")}
          </div>
          <div>
            <Label htmlFor="sclayEmail" className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              SCLAY Email<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="sclayEmail"
              name="sclayEmail"
              type="email"
              placeholder="you@sclay.ai"
              required
              defaultValue="contact@sclay.ai"
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("sclayEmail")}
          </div>
          <div>
            <Label htmlFor="yourWebsite" className="flex items-center">
              <Globe className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Your Website (Optional)
            </Label>
            <Input
              id="yourWebsite"
              name="yourWebsite"
              type="url"
              placeholder="https://sclay.ai"
              defaultValue="https://sclay.ai"
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("yourWebsite")}
          </div>
          <div>
            <Label htmlFor="logoUrl" className="flex items-center">
              <ImageIcon className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Logo URL (Optional)
            </Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://sclay.ai/logo.png"
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("logoUrl")}
          </div>
          <div>
            <Label htmlFor="socialCalendlyLink" className="flex items-center">
              <Share2 className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
              Social or Calendly Link (Optional)
            </Label>
            <Input
              id="socialCalendlyLink"
              name="socialCalendlyLink"
              type="url"
              placeholder="https://calendly.com/sclayai"
              className="mt-1 bg-input focus:ring-sclayGreen-DEFAULT"
            />
            {getError("socialCalendlyLink")}
          </div>
        </CardContent>
      </Card>

      <div className="form-section pt-6 flex flex-col sm:flex-row justify-center gap-4">
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
          {actualPending ? "Submitting Proposal..." : "Submit"}
        </Button>
      </div>
    </form>
  )
}
