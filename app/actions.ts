"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase/server"

// --- Onboarding Proposal Schema and Action ---
const proposalSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  businessName: z.string().min(1, "Business name is required"),
  industryNiche: z.string().min(1, "Industry/Niche is required"),
  location: z.string().min(1, "Location is required"),
  websiteUrl: z.string().url().optional().or(z.literal("")).nullable(),
  painPointsGoals: z.string().min(1, "Pain points/goals are required"),
  servicesOffered: z.array(z.string()).min(1, "At least one service must be selected"),
  oneTimeFee: z.string().optional().nullable(),
  monthlyRetainer: z.string().optional().nullable(),
  performanceBased: z.string().optional().nullable(),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  projectStartDate: z.string().min(1, "Project start date is required"),
  estimatedDeliveryDate: z.string().min(1, "Estimated delivery date is required"),
  yourName: z.string().min(1, "Your name is required"),
  sclayEmail: z.string().email("Invalid email address"),
  yourWebsite: z.string().url().optional().or(z.literal("")).nullable(),
  logoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  socialCalendlyLink: z.string().url().optional().or(z.literal("")).nullable(),
})

export interface ProposalFormState {
  message: string
  success: boolean
  errors?: Record<string, string[]>
  submittedData?: Record<string, any>
}

export async function submitProposal(prevState: ProposalFormState, formData: FormData): Promise<ProposalFormState> {
  const webhookUrl = "https://hook.us2.make.com/yctumxqvh734ttd902rm1efnu9hpg36h"

  const rawFormData = {
    clientName: formData.get("clientName"),
    businessName: formData.get("businessName"),
    industryNiche: formData.get("industryNiche"),
    location: formData.get("location"),
    websiteUrl: formData.get("websiteUrl") || null,
    painPointsGoals: formData.get("painPointsGoals"),
    servicesOffered: formData.getAll("servicesOffered"),
    oneTimeFee: formData.get("oneTimeFee") || null,
    monthlyRetainer: formData.get("monthlyRetainer") || null,
    performanceBased: formData.get("performanceBased") || null,
    paymentTerms: formData.get("paymentTerms"),
    projectStartDate: formData.get("projectStartDate"),
    estimatedDeliveryDate: formData.get("estimatedDeliveryDate"),
    yourName: formData.get("yourName"),
    sclayEmail: formData.get("sclayEmail"),
    yourWebsite: formData.get("yourWebsite") || null,
    logoUrl: formData.get("logoUrl") || null,
    socialCalendlyLink: formData.get("socialCalendlyLink") || null,
  }

  const validatedFields = proposalSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the Onboarding form for errors.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const dataFromZod = validatedFields.data

  // Prepare data for Supabase (map to snake_case, parse numeric fields)
  const supabaseData = {
    client_name: dataFromZod.clientName,
    business_name: dataFromZod.businessName,
    industry_niche: dataFromZod.industryNiche,
    location: dataFromZod.location,
    website_url: dataFromZod.websiteUrl,
    pain_points_goals: dataFromZod.painPointsGoals,
    services_offered: dataFromZod.servicesOffered,
    one_time_fee: dataFromZod.oneTimeFee ? Number.parseFloat(dataFromZod.oneTimeFee) : null,
    monthly_retainer: dataFromZod.monthlyRetainer ? Number.parseFloat(dataFromZod.monthlyRetainer) : null,
    performance_based: dataFromZod.performanceBased,
    payment_terms: dataFromZod.paymentTerms,
    project_start_date: dataFromZod.projectStartDate,
    estimated_delivery_date: dataFromZod.estimatedDeliveryDate,
    your_name: dataFromZod.yourName,
    sclay_email: dataFromZod.sclayEmail,
    your_website: dataFromZod.yourWebsite,
    logo_url: dataFromZod.logoUrl,
    social_calendly_link: dataFromZod.socialCalendlyLink,
    // status will use default in DB
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formType: "onboarding", ...dataFromZod }), // Send Zod data (camelCase) to webhook
    })
    if (!webhookResponse.ok) {
      console.warn(`Webhook for onboarding responded with ${webhookResponse.status}`)
    }
  } catch (error: any) {
    console.error(`Error sending onboarding data to webhook: ${error.message}`)
  }

  try {
    const { error: supabaseError } = await supabaseAdmin.from("proposals_onboarding").insert(supabaseData)
    if (supabaseError) {
      console.error("Supabase error (Onboarding):", supabaseError)
      return { message: `Error saving onboarding data to database: ${supabaseError.message}`, success: false }
    }
    return {
      message: "Onboarding data submitted successfully to webhook and database!",
      success: true,
      submittedData: dataFromZod,
    }
  } catch (error: any) {
    console.error(`Unexpected error during Supabase onboarding insert: ${error.message}`)
    return { message: `Unexpected error saving onboarding data: ${error.message}`, success: false }
  }
}

// --- Prospects Schema and Action ---
const prospectSchema = z
  .object({
    prospectBusinessName: z.string().min(1, "Business name is required"),
    prospectFirstName: z.string().min(1, "First name is required"),
    prospectLastName: z.string().min(1, "Last name is required"),
    prospectPhone: z.string().min(1, "Phone is required"),
    prospectEmail: z.string().email("Invalid email address").min(1, "Email is required"),
    prospectCityState: z.string().min(1, "City/State is required"),
    prospectBusinessType: z.string().min(1, "Business type is required"),
    otherBusinessType: z
      .string()
      .optional()
      .nullable()
      .transform((val) => val || null),
    prospectPainPoint: z.string().min(1, "Pain point is required"),
    prospectServicesInterested: z.array(z.string()).min(1, "At least one service must be selected"),
    prospectBudgetFeel: z.string().min(1, "Budget feel is required"),
    prospectFollowUpType: z.string().min(1, "Follow-up type is required"),
    prospectFollowUpCallDate: z
      .string()
      .optional()
      .nullable()
      .transform((val) => val || null),
    prospectCallNotes: z
      .string()
      .optional()
      .nullable()
      .transform((val) => val || null),
  })
  .superRefine((data, ctx) => {
    // Conditional validation for otherBusinessType
    if (data.prospectBusinessType === "Other" && !data.otherBusinessType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specify Other Business Type is required when Business Type is 'Other'",
        path: ["otherBusinessType"],
      })
    }

    // Conditional validation for prospectFollowUpCallDate
    if (data.prospectFollowUpType === "Follow-up call" && !data.prospectFollowUpCallDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Follow-Up Call Date is required when Follow-Up Type is 'Follow-up call'",
        path: ["prospectFollowUpCallDate"],
      })
    }
  })

export interface ProspectFormState {
  message: string
  success: boolean
  errors?: Record<string, string[]>
  submittedData?: Record<string, any>
}

export async function submitProspect(prevState: ProspectFormState, formData: FormData): Promise<ProspectFormState> {
  const webhookUrl = "https://hook.us2.make.com/yctumxqvh734ttd902rm1efnu9hpg36h"

  const rawFormData = {
    prospectBusinessName: formData.get("prospectBusinessName") || "",
    prospectFirstName: formData.get("prospectFirstName") || "",
    prospectLastName: formData.get("prospectLastName") || "",
    prospectPhone: formData.get("prospectPhone") || "",
    prospectEmail: formData.get("prospectEmail") || "",
    prospectCityState: formData.get("prospectCityState") || "",
    prospectBusinessType: formData.get("prospectBusinessType") || "",
    otherBusinessType: formData.get("otherBusinessType") || null,
    prospectPainPoint: formData.get("prospectPainPoint") || "",
    prospectServicesInterested: formData.getAll("prospectServicesInterested"),
    prospectBudgetFeel: formData.get("prospectBudgetFeel") || "",
    prospectFollowUpType: formData.get("prospectFollowUpType") || "",
    prospectFollowUpCallDate: formData.get("prospectFollowUpCallDate") || null,
    prospectCallNotes: formData.get("prospectCallNotes") || null,
  }

  const validatedFields = prospectSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the Prospects form for errors.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  const dataFromZod = validatedFields.data

  // Prepare data for Supabase (map camelCase from Zod to snake_case for DB)
  const supabaseData = {
    prospect_business_name: dataFromZod.prospectBusinessName,
    prospect_first_name: dataFromZod.prospectFirstName,
    prospect_last_name: dataFromZod.prospectLastName,
    prospect_contact_name: `${dataFromZod.prospectFirstName} ${dataFromZod.prospectLastName}`, // Keep for backward compatibility
    prospect_phone: dataFromZod.prospectPhone,
    prospect_email: dataFromZod.prospectEmail,
    prospect_city_state: dataFromZod.prospectCityState,
    prospect_business_type: dataFromZod.prospectBusinessType,
    other_business_type: dataFromZod.otherBusinessType,
    prospect_pain_point: dataFromZod.prospectPainPoint,
    prospect_services_interested: dataFromZod.prospectServicesInterested,
    prospect_budget_feel: dataFromZod.prospectBudgetFeel,
    prospect_follow_up_type: dataFromZod.prospectFollowUpType,
    prospect_follow_up_call_date: dataFromZod.prospectFollowUpCallDate,
    prospect_call_notes: dataFromZod.prospectCallNotes,
    // status will use default in DB
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formType: "prospect", ...dataFromZod }), // Send Zod data (camelCase) to webhook
    })
    if (!webhookResponse.ok) {
      console.warn(`Webhook for prospect responded with ${webhookResponse.status}`)
    }
  } catch (error: any) {
    console.error(`Error sending prospect data to webhook: ${error.message}`)
  }

  try {
    const { error: supabaseError } = await supabaseAdmin.from("proposals_prospects").insert(supabaseData)
    if (supabaseError) {
      console.error("Supabase error (Prospects):", supabaseError)
      return { message: `Error saving prospect data to database: ${supabaseError.message}`, success: false }
    }
    return {
      message: "Prospect data submitted successfully to webhook and database!",
      success: true,
      submittedData: dataFromZod,
    }
  } catch (error: any) {
    console.error(`Unexpected error during Supabase prospect insert: ${error.message}`)
    return { message: `Unexpected error saving prospect data: ${error.message}`, success: false }
  }
}

export async function getProposalsForDashboard() {
  try {
    const { data: onboardingProposals, error: onboardingError } = await supabaseAdmin
      .from("proposals_onboarding")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (onboardingError) {
      console.error("Error fetching onboarding proposals:", onboardingError)
      throw onboardingError
    }

    const { data: prospectProposals, error: prospectError } = await supabaseAdmin
      .from("proposals_prospects")
      .select("*")
      .order("submitted_at", { ascending: false })

    if (prospectError) {
      console.error("Error fetching prospect proposals:", prospectError)
      throw prospectError
    }
    return {
      onboardingProposals: onboardingProposals || [],
      prospectProposals: prospectProposals || [],
    }
  } catch (error: any) {
    console.error("Error in getProposalsForDashboard:", error.message)
    return { onboardingProposals: [], prospectProposals: [], error: error.message }
  }
}

// --- Delete Proposal Actions ---
export interface DeleteProposalState {
  message: string
  success: boolean
  error?: string
}

export async function deleteOnboardingProposal(
  prevState: DeleteProposalState,
  formData: FormData,
): Promise<DeleteProposalState> {
  const proposalId = formData.get("proposalId") as string

  if (!proposalId) {
    return {
      message: "Proposal ID is required",
      success: false,
      error: "Missing proposal ID",
    }
  }

  try {
    const { error: supabaseError } = await supabaseAdmin.from("proposals_onboarding").delete().eq("id", proposalId)

    if (supabaseError) {
      console.error("Supabase error deleting onboarding proposal:", supabaseError)
      return {
        message: `Error deleting onboarding proposal: ${supabaseError.message}`,
        success: false,
        error: supabaseError.message,
      }
    }

    return {
      message: "Onboarding proposal deleted successfully!",
      success: true,
    }
  } catch (error: any) {
    console.error("Unexpected error deleting onboarding proposal:", error.message)
    return {
      message: `Unexpected error deleting onboarding proposal: ${error.message}`,
      success: false,
      error: error.message,
    }
  }
}

export async function deleteProspectProposal(
  prevState: DeleteProposalState,
  formData: FormData,
): Promise<DeleteProposalState> {
  const proposalId = formData.get("proposalId") as string

  if (!proposalId) {
    return {
      message: "Proposal ID is required",
      success: false,
      error: "Missing proposal ID",
    }
  }

  try {
    const { error: supabaseError } = await supabaseAdmin.from("proposals_prospects").delete().eq("id", proposalId)

    if (supabaseError) {
      console.error("Supabase error deleting prospect proposal:", supabaseError)
      return {
        message: `Error deleting prospect proposal: ${supabaseError.message}`,
        success: false,
        error: supabaseError.message,
      }
    }

    return {
      message: "Prospect proposal deleted successfully!",
      success: true,
    }
  } catch (error: any) {
    console.error("Unexpected error deleting prospect proposal:", error.message)
    return {
      message: `Unexpected error deleting prospect proposal: ${error.message}`,
      success: false,
      error: error.message,
    }
  }
}

// --- Edit Proposal Actions ---
export interface EditProposalState {
  message: string
  success: boolean
  errors?: Record<string, string[]>
  error?: string
}

export async function editOnboardingProposal(
  prevState: EditProposalState,
  formData: FormData,
): Promise<EditProposalState> {
  const proposalId = formData.get("proposalId") as string

  if (!proposalId) {
    return {
      message: "Proposal ID is required",
      success: false,
      error: "Missing proposal ID",
    }
  }

  const rawFormData = {
    clientName: formData.get("clientName"),
    businessName: formData.get("businessName"),
    industryNiche: formData.get("industryNiche"),
    location: formData.get("location"),
    websiteUrl: formData.get("websiteUrl") || null,
    painPointsGoals: formData.get("painPointsGoals"),
    servicesOffered: formData.getAll("servicesOffered"),
    oneTimeFee: formData.get("oneTimeFee") || null,
    monthlyRetainer: formData.get("monthlyRetainer") || null,
    performanceBased: formData.get("performanceBased") || null,
    paymentTerms: formData.get("paymentTerms"),
    projectStartDate: formData.get("projectStartDate"),
    estimatedDeliveryDate: formData.get("estimatedDeliveryDate"),
    yourName: formData.get("yourName"),
    sclayEmail: formData.get("sclayEmail"),
    yourWebsite: formData.get("yourWebsite") || null,
    logoUrl: formData.get("logoUrl") || null,
    socialCalendlyLink: formData.get("socialCalendlyLink") || null,
  }

  const validatedFields = proposalSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the form for errors.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const dataFromZod = validatedFields.data

  // Prepare data for Supabase (map to snake_case, parse numeric fields)
  const supabaseData = {
    client_name: dataFromZod.clientName,
    business_name: dataFromZod.businessName,
    industry_niche: dataFromZod.industryNiche,
    location: dataFromZod.location,
    website_url: dataFromZod.websiteUrl,
    pain_points_goals: dataFromZod.painPointsGoals,
    services_offered: dataFromZod.servicesOffered,
    one_time_fee: dataFromZod.oneTimeFee ? Number.parseFloat(dataFromZod.oneTimeFee) : null,
    monthly_retainer: dataFromZod.monthlyRetainer ? Number.parseFloat(dataFromZod.monthlyRetainer) : null,
    performance_based: dataFromZod.performanceBased,
    payment_terms: dataFromZod.paymentTerms,
    project_start_date: dataFromZod.projectStartDate,
    estimated_delivery_date: dataFromZod.estimatedDeliveryDate,
    your_name: dataFromZod.yourName,
    sclay_email: dataFromZod.sclayEmail,
    your_website: dataFromZod.yourWebsite,
    logo_url: dataFromZod.logoUrl,
    social_calendly_link: dataFromZod.socialCalendlyLink,
  }

  try {
    const { error: supabaseError } = await supabaseAdmin
      .from("proposals_onboarding")
      .update(supabaseData)
      .eq("id", proposalId)

    if (supabaseError) {
      console.error("Supabase error updating onboarding proposal:", supabaseError)
      return {
        message: `Error updating onboarding proposal: ${supabaseError.message}`,
        success: false,
        error: supabaseError.message,
      }
    }

    return {
      message: "Onboarding proposal updated successfully!",
      success: true,
    }
  } catch (error: any) {
    console.error("Unexpected error updating onboarding proposal:", error.message)
    return {
      message: `Unexpected error updating onboarding proposal: ${error.message}`,
      success: false,
      error: error.message,
    }
  }
}

export async function editProspectProposal(
  prevState: EditProposalState,
  formData: FormData,
): Promise<EditProposalState> {
  const proposalId = formData.get("proposalId") as string

  if (!proposalId) {
    return {
      message: "Proposal ID is required",
      success: false,
      error: "Missing proposal ID",
    }
  }

  const rawFormData = {
    prospectBusinessName: formData.get("prospectBusinessName") || "",
    prospectFirstName: formData.get("prospectFirstName") || "",
    prospectLastName: formData.get("prospectLastName") || "",
    prospectPhone: formData.get("prospectPhone") || "",
    prospectEmail: formData.get("prospectEmail") || "",
    prospectCityState: formData.get("prospectCityState") || "",
    prospectBusinessType: formData.get("prospectBusinessType") || "",
    otherBusinessType: formData.get("otherBusinessType") || null,
    prospectPainPoint: formData.get("prospectPainPoint") || "",
    prospectServicesInterested: formData.getAll("prospectServicesInterested"),
    prospectBudgetFeel: formData.get("prospectBudgetFeel") || "",
    prospectFollowUpType: formData.get("prospectFollowUpType") || "",
    prospectFollowUpCallDate: formData.get("prospectFollowUpCallDate") || null,
    prospectCallNotes: formData.get("prospectCallNotes") || null,
  }

  const validatedFields = prospectSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the form for errors.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const dataFromZod = validatedFields.data

  // Prepare data for Supabase (map camelCase from Zod to snake_case for DB)
  const supabaseData = {
    prospect_business_name: dataFromZod.prospectBusinessName,
    prospect_first_name: dataFromZod.prospectFirstName,
    prospect_last_name: dataFromZod.prospectLastName,
    prospect_contact_name: `${dataFromZod.prospectFirstName} ${dataFromZod.prospectLastName}`, // Keep for backward compatibility
    prospect_phone: dataFromZod.prospectPhone,
    prospect_email: dataFromZod.prospectEmail,
    prospect_city_state: dataFromZod.prospectCityState,
    prospect_business_type: dataFromZod.prospectBusinessType,
    other_business_type: dataFromZod.otherBusinessType,
    prospect_pain_point: dataFromZod.prospectPainPoint,
    prospect_services_interested: dataFromZod.prospectServicesInterested,
    prospect_budget_feel: dataFromZod.prospectBudgetFeel,
    prospect_follow_up_type: dataFromZod.prospectFollowUpType,
    prospect_follow_up_call_date: dataFromZod.prospectFollowUpCallDate,
    prospect_call_notes: dataFromZod.prospectCallNotes,
  }

  try {
    const { error: supabaseError } = await supabaseAdmin
      .from("proposals_prospects")
      .update(supabaseData)
      .eq("id", proposalId)

    if (supabaseError) {
      console.error("Supabase error updating prospect proposal:", supabaseError)
      return {
        message: `Error updating prospect proposal: ${supabaseError.message}`,
        success: false,
        error: supabaseError.message,
      }
    }

    return {
      message: "Prospect proposal updated successfully!",
      success: true,
    }
  } catch (error: any) {
    console.error("Unexpected error updating prospect proposal:", error.message)
    return {
      message: `Unexpected error updating prospect proposal: ${error.message}`,
      success: false,
      error: error.message,
    }
  }
}
