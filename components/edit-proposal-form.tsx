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
import { Building2, MessageSquare, ListChecks, Calendar, DollarSign } from "lucide-react"
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

  // Form state for onboarding
  const [startDate, setStartDate] = useState<Date | undefined>(
    type === "onboarding" && proposal.project_start_date ? parseISO(proposal.project_start_date) : undefined,
  )
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    type === "onboarding" && proposal.estimated_delivery_date ? parseISO(proposal.estimated_delivery_date) : undefined,
  )
  const [selectedServices, setSelectedServices] = useState<string[]>(
    type === "onboarding" ? proposal.services_offered || [] : proposal.prospect_services_interested || [],
  )

  // Form state for prospects
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | undefined>(
    type === "prospect" ? proposal.prospect_business_type : undefined,
  )
  const [selectedFollowUpType, setSelectedFollowUpType] = useState<string | undefined>(
    type === "prospect" ? proposal.prospect_follow_up_type : undefined,
  )
  const [followUpCallDate, setFollowUpCallDate] = useState<Date | undefined>(
    type === "prospect" && proposal.prospect_follow_up_call_date
      ? parseISO(proposal.prospect_follow_up_call_date)
      : undefined,
  )

  // Split name for prospects (if needed)
  const [firstName, setFirstName] = useState<string>(
    type === "prospect" ? proposal.prospect_first_name || "" : ""
  )
  const [lastName, setLastName] = useState<string>(
    type === "prospect" ? proposal.prospect_last_name || "" : ""
  )

  // Initialize first and last name from contact name if they don't exist
  useEffect(() => {
    if (type === "prospect" && !proposal.prospect_first_name && !proposal.prospect_last_name && proposal.prospect_contact_name) {
      const nameParts = proposal.prospect_contact_name.split(" ")
      if (nameParts.length >= 2) {
        setFirstName(nameParts[0])
        setLastName(nameParts.slice(1).join(" "))
      } else {
        setFirstName(proposal.prospect_contact_name)
      }
    }
  }, [type, proposal])

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
        formData.set("projectStartDate", format(startDate, "yyyy-MM-dd"))
      }
      if (deliveryDate) {
        formData.set("estimatedDeliveryDate", format(deliveryDate, "yyyy-MM-dd"))
      }
    }

    // Handle follow-up call date for prospects
    if (type === "prospect" && followUpCallDate) {
      formData.set("prospectFollowUpCallDate", format(followUpCallDate, "yyyy-MM-dd"))
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
              <DollarSign className="mr-2 h-5 w-5" /> Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectValue">Project Value ($)</Label>
                <Input
                  id="projectValue"
                  name="projectValue"
                  type="number"
                  defaultValue={proposal.project_value}
                  required
                  className="mt-1 bg-input"
                />
                {getError("projectValue")}
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
            <Building2 className="mr-2 h-5 w-5" /> Prospect Details
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
