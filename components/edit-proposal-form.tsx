"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useActionState, useTransition } from "react"
import { editOnboardingProposal, editProspectProposal } from "@/app/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MessageSquare, ListChecks, Calendar, DollarSign, User, Phone, Mail } from "lucide-react"
import { format, parseISO } from "date-fns"

interface EditProposalFormProps {
  proposal: any
  type: "onboarding" | "prospect"
  onSuccess: () => void
  onCancel: () => void
}

const services = [
  { id: "website", label: "Website redesign or new build" },
  { id: "aiVoiceAgent", label: "AI voice agent (inbound/outbound)" },
  { id: "automationSetup", label: "Automation setup (Zapier, Make, CRM workflows)" },
  { id: "bookingSystem", label: "Booking system" },
  { id: "googleReview", label: "Google review generation" },
  { id: "leadScraping", label: "Lead scraping or database building" },
  { id: "monthlyRetainerMgmt", label: "Monthly retainer for management" },
]

const prospectServices = [
  { id: "website", label: "Website" },
  { id: "aiCallAgent", label: "AI call agent" },
  { id: "bookingSystem", label: "Booking system" },
  { id: "automation", label: "Automation" },
  { id: "crm", label: "CRM" },
  { id: "reviewBoost", label: "Review boost" },
  { id: "notSure", label: "Not sure" },
]

const paymentTermsOptions = [
  { id: "upfront", label: "100% Upfront" },
  { id: "5050", label: "50% Upfront, 50% Upon Completion" },
  { id: "monthly", label: "Monthly Billing" },
]

const businessTypes = ["Roofer", "Towing", "Detailing", "HVAC", "Landscaping", "Consulting", "Other"]
const budgetFeels = ["Open", "Budget-conscious", "Didn't say"]
const followUpTypes = ["Follow-up call", "Proposal needed", "Wants pricing", "Just info"]

export function EditProposalForm({ proposal, type, onSuccess, onCancel }: EditProposalFormProps) {
  const [isTransitionPending, startTransition] = useTransition()

  // Action states
  const [editOnboardingState, editOnboardingAction, isOnboardingEditing] = useActionState(editOnboardingProposal, {
    message: "",
    success: false,
  })
  const [editProspectState, editProspectAction, isProspectEditing] = useActionState(editProspectProposal, {
    message: "",
    success: false,
  })

  // Form state for onboarding dates
  const [startDate, setStartDate] = useState<string>(
    type === "onboarding" && proposal.project_start_date ? proposal.project_start_date : "",
  )
  const [deliveryDate, setDeliveryDate] = useState<string>(
    type === "onboarding" && proposal.estimated_delivery_date ? proposal.estimated_delivery_date : "",
  )

  // Form state for services
  const [selectedServices, setSelectedServices] = useState<string[]>(
    type === "onboarding" ? proposal.services_offered || [] : proposal.prospect_services_interested || [],
  )

  // Form state for prospects
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>(
    type === "prospect" ? proposal.prospect_business_type || "" : "",
  )
  const [selectedBudgetFeel, setSelectedBudgetFeel] = useState<string>(
    type === "prospect" ? proposal.prospect_budget_feel || "" : "",
  )
  const [selectedFollowUpType, setSelectedFollowUpType] = useState<string>(
    type === "prospect" ? proposal.prospect_follow_up_type || "" : "",
  )
  const [followUpCallDate, setFollowUpCallDate] = useState<string>(
    type === "prospect" && proposal.prospect_follow_up_call_date ? proposal.prospect_follow_up_call_date : "",
  )

  // Form state for onboarding payment terms
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<string>(
    type === "onboarding" ? proposal.payment_terms || "" : "",
  )

  // Split name for prospects
  const [firstName, setFirstName] = useState<string>(
    type === "prospect" ? proposal.prospect_first_name || "" : ""
  )
  const [lastName, setLastName] = useState<string>(
    type === "prospect" ? proposal.prospect_last_name || "" : ""
  )

  const currentState = type === "onboarding" ? editOnboardingState : editProspectState
  const currentAction = type === "onboarding" ? editOnboardingAction : editProspectAction
  const isEditing = isOnboardingEditing || isProspectEditing || isTransitionPending

  useEffect(() => {
    if (currentState.success) {
      onSuccess()
    }
  }, [currentState.success, onSuccess])

  const getError = (fieldName: string) => {
    if (currentState.errors && currentState.errors[fieldName]) {
      return <p className="text-sm text-red-500 mt-1">{currentState.errors[fieldName]?.join(", ")}</p>
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
    const formData = new FormData(event.currentTarget)

    // Add proposal ID
    formData.append("proposalId", proposal.id)

    // Handle services
    const serviceField = type === "onboarding" ? "servicesOffered" : "prospectServicesInterested"
    formData.delete(serviceField)
    selectedServices.forEach((service) => {
      formData.append(serviceField, service)
    })

    // Handle dates for onboarding
    if (type === "onboarding") {
      if (startDate) {
        formData.set("projectStartDate", startDate)
      }
      if (deliveryDate) {
        formData.set("estimatedDeliveryDate", deliveryDate)
      }
      if (selectedPaymentTerms) {
        formData.set("paymentTerms", selectedPaymentTerms)
      }
    }

    // Handle prospect-specific fields
    if (type === "prospect") {
      if (selectedBusinessType) {
        formData.set("prospectBusinessType", selectedBusinessType)
      }
      if (selectedBudgetFeel) {
        formData.set("prospectBudgetFeel", selectedBudgetFeel)
      }
      if (selectedFollowUpType) {
        formData.set("prospectFollowUpType", selectedFollowUpType)
      }
      if (followUpCallDate) {
        formData.set("prospectFollowUpCallDate", followUpCallDate)
      }
    }

    startTransition(() => {
      currentAction(formData)
    })
  }

  if (type === "onboarding") {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
        {currentState.message && (
          <div
            className={`p-3 rounded-md text-sm ${
              currentState.success ? "bg-sclayGreen-DEFAULT/20 text-sclayGreen-DEFAULT" : "bg-red-500/20 text-red-400"
            }`}
          >
            {currentState.message}
          </div>
        )}

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
              <Building2 className="mr-2 h-5 w-5" /> Client Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  defaultValue={proposal.client_name}
                  required
                  className="mt-1 bg-input"
                />
                {getError("clientName")}
              </div>
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  defaultValue={proposal.business_name}
                  required
                  className="mt-1 bg-input"
                />
                {getError("businessName")}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industryNiche">Industry/Niche</Label>
                <Input
                  id="industryNiche"
                  name="industryNiche"
                  defaultValue={proposal.industry_niche}
                  required
                  className="mt-1 bg-input"
                />
                {getError("industryNiche")}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={proposal.location}
                  required
                  className="mt-1 bg-input"
                />
                {getError("location")}
              </div>
            </div>
            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                defaultValue={proposal.website_url || ""}
                className="mt-1 bg-input"
              />
              {getError("websiteUrl")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
              <MessageSquare className="mr-2 h-5 w-5" /> Pain Points or Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="painPointsGoals"
              name="painPointsGoals"
              defaultValue={proposal.pain_points_goals}
              required
              className="min-h-[100px] bg-input"
            />
            {getError("painPointsGoals")}
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
              <ListChecks className="mr-2 h-5 w-5" /> Services Offered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={service.id}
                    checked={selectedServices.includes(service.label)}
                    onChange={(e) => handleServiceChange(e.target.checked, service.label)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={service.id} className="text-sm">
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
            {getError("servicesOffered")}
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
              <DollarSign className="mr-2 h-5 w-5" /> Project Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="oneTimeFee">One-Time Fee ($)</Label>
                <Input
                  id="oneTimeFee"
                  name="oneTimeFee"
                  type="number"
                  defaultValue={proposal.one_time_fee || ""}
                  className="mt-1 bg-input"
                />
                {getError("oneTimeFee")}
              </div>
              <div>
                <Label htmlFor="monthlyRetainer">Monthly Retainer ($)</Label>
                <Input
                  id="monthlyRetainer"
                  name="monthlyRetainer"
                  type="number"
                  defaultValue={proposal.monthly_retainer || ""}
                  className="mt-1 bg-input"
                />
                {getError("monthlyRetainer")}
              </div>
            </div>
            <div>
              <Label htmlFor="performanceBased">Performance Based</Label>
              <Textarea
                id="performanceBased"
                name="performanceBased"
                defaultValue={proposal.performance_based || ""}
                className="mt-1 bg-input min-h-[80px]"
                placeholder="Describe any performance-based compensation..."
              />
              {getError("performanceBased")}
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select value={selectedPaymentTerms} onValueChange={setSelectedPaymentTerms}>
                <SelectTrigger className="mt-1 bg-input">
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
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

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
              <Calendar className="mr-2 h-5 w-5" /> Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectStartDate">Project Start Date</Label>
                <Input
                  id="projectStartDate"
                  name="projectStartDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 bg-input"
                />
                {getError("projectStartDate")}
              </div>
              <div>
                <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
                <Input
                  id="estimatedDeliveryDate"
                  name="estimatedDeliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  className="mt-1 bg-input"
                />
                {getError("estimatedDeliveryDate")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
              <User className="mr-2 h-5 w-5" /> Sclay AI Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yourName">Your Name</Label>
                <Input
                  id="yourName"
                  name="yourName"
                  defaultValue={proposal.your_name}
                  required
                  className="mt-1 bg-input"
                />
                {getError("yourName")}
              </div>
              <div>
                <Label htmlFor="sclayEmail">Sclay Email</Label>
                <Input
                  id="sclayEmail"
                  name="sclayEmail"
                  type="email"
                  defaultValue={proposal.sclay_email}
                  required
                  className="mt-1 bg-input"
                />
                {getError("sclayEmail")}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yourWebsite">Your Website</Label>
                <Input
                  id="yourWebsite"
                  name="yourWebsite"
                  type="url"
                  defaultValue={proposal.your_website || ""}
                  className="mt-1 bg-input"
                />
                {getError("yourWebsite")}
              </div>
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  defaultValue={proposal.logo_url || ""}
                  className="mt-1 bg-input"
                />
                {getError("logoUrl")}
              </div>
            </div>
            <div>
              <Label htmlFor="socialCalendlyLink">Social/Calendly Link</Label>
              <Input
                id="socialCalendlyLink"
                name="socialCalendlyLink"
                type="url"
                defaultValue={proposal.social_calendly_link || ""}
                className="mt-1 bg-input"
              />
              {getError("socialCalendlyLink")}
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-3 pt-4">
          <Button type="submit" disabled={isEditing} className="flex-1">
            {isEditing ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  // Prospect form
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {currentState.message && (
        <div
          className={`p-3 rounded-md text-sm ${
            currentState.success ? "bg-sclayGreen-DEFAULT/20 text-sclayGreen-DEFAULT" : "bg-red-500/20 text-red-400"
          }`}
        >
          {currentState.message}
        </div>
      )}

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
            <User className="mr-2 h-5 w-5" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prospectFirstName">First Name</Label>
              <Input
                id="prospectFirstName"
                name="prospectFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1 bg-input"
              />
              {getError("prospectFirstName")}
            </div>
            <div>
              <Label htmlFor="prospectLastName">Last Name</Label>
              <Input
                id="prospectLastName"
                name="prospectLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1 bg-input"
              />
              {getError("prospectLastName")}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prospectPhone">Phone</Label>
              <Input
                id="prospectPhone"
                name="prospectPhone"
                type="tel"
                defaultValue={proposal.prospect_phone}
                required
                className="mt-1 bg-input"
              />
              {getError("prospectPhone")}
            </div>
            <div>
              <Label htmlFor="prospectEmail">Email</Label>
              <Input
                id="prospectEmail"
                name="prospectEmail"
                type="email"
                defaultValue={proposal.prospect_email}
                required
                className="mt-1 bg-input"
              />
              {getError("prospectEmail")}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
            <Building2 className="mr-2 h-5 w-5" /> Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prospectBusinessName">Business Name</Label>
            <Input
              id="prospectBusinessName"
              name="prospectBusinessName"
              defaultValue={proposal.prospect_business_name}
              required
              className="mt-1 bg-input"
            />
            {getError("prospectBusinessName")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prospectCityState">City/State</Label>
              <Input
                id="prospectCityState"
                name="prospectCityState"
                defaultValue={proposal.prospect_city_state}
                required
                className="mt-1 bg-input"
              />
              {getError("prospectCityState")}
            </div>
            <div>
              <Label htmlFor="prospectBusinessType">Business Type</Label>
              <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
                <SelectTrigger className="mt-1 bg-input">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError("prospectBusinessType")}
            </div>
          </div>
          {selectedBusinessType === "Other" && (
            <div>
              <Label htmlFor="otherBusinessType">Specify Other Business Type</Label>
              <Input
                id="otherBusinessType"
                name="otherBusinessType"
                defaultValue={proposal.other_business_type || ""}
                className="mt-1 bg-input"
              />
              {getError("otherBusinessType")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
            <MessageSquare className="mr-2 h-5 w-5" /> Pain Points & Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prospectPainPoint">Pain Point</Label>
            <Textarea
              id="prospectPainPoint"
              name="prospectPainPoint"
              defaultValue={proposal.prospect_pain_point}
              required
              className="min-h-[100px] bg-input"
            />
            {getError("prospectPainPoint")}
          </div>
          <div>
            <Label>Services Interested In</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {prospectServices.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={service.id}
                    checked={selectedServices.includes(service.label)}
                    onChange={(e) => handleServiceChange(e.target.checked, service.label)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={service.id} className="text-sm">
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
            {getError("prospectServicesInterested")}
          </div>
          <div>
            <Label htmlFor="prospectBudgetFeel">Budget Feel</Label>
            <Select value={selectedBudgetFeel} onValueChange={setSelectedBudgetFeel}>
              <SelectTrigger className="mt-1 bg-input">
                <SelectValue placeholder="Select budget feel" />
              </SelectTrigger>
              <SelectContent>
                {budgetFeels.map((feel) => (
                  <SelectItem key={feel} value={feel}>
                    {feel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getError("prospectBudgetFeel")}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-sclayGreen-DEFAULT">
            <Calendar className="mr-2 h-5 w-5" /> Follow-Up Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prospectFollowUpType">Follow-Up Type</Label>
            <Select value={selectedFollowUpType} onValueChange={setSelectedFollowUpType}>
              <SelectTrigger className="mt-1 bg-input">
                <SelectValue placeholder="Select follow-up type" />
              </SelectTrigger>
              <SelectContent>
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
            <div>
              <Label htmlFor="prospectFollowUpCallDate">Follow-Up Call Date</Label>
              <Input
                id="prospectFollowUpCallDate"
                name="prospectFollowUpCallDate"
                type="date"
                value={followUpCallDate}
                onChange={(e) => setFollowUpCallDate(e.target.value)}
                className="mt-1 bg-input"
              />
              {getError("prospectFollowUpCallDate")}
            </div>
          )}
          <div>
            <Label htmlFor="prospectCallNotes">Call Notes</Label>
            <Textarea
              id="prospectCallNotes"
              name="prospectCallNotes"
              defaultValue={proposal.prospect_call_notes || ""}
              className="min-h-[100px] bg-input"
              placeholder="Any additional notes from the call..."
            />
            {getError("prospectCallNotes")}
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" disabled={isEditing} className="flex-1">
          {isEditing ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
