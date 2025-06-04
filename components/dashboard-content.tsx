"use client"

import { useState, useEffect, useTransition } from "react"
import { getProposalsForDashboard, deleteOnboardingProposal, deleteProspectProposal } from "@/app/actions" // Import delete actions
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Building2,
  User,
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  TrendingUp,
  Users,
  FileText,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react"
import { format, parseISO } from "date-fns" // parseISO for parsing date strings from Supabase
import { useActionState } from "react" // Import useActionState for delete actions
import { EditProposalForm } from "./edit-proposal-form"

// Helper function to format contact name
const formatContactName = (firstName: string, lastName?: string) => {
  if (lastName && lastName.trim()) {
    return `${firstName} ${lastName}`
  }
  return firstName
}

// Define a unified proposal type for the dashboard
interface DashboardProposal {
  id: string
  type: "onboarding" | "prospect"
  clientName: string // For onboarding, formatted first+last name for prospect
  businessName: string // For onboarding, prospect_business_name for prospect
  industryNiche?: string // Onboarding only
  location?: string // Onboarding only
  submittedAt: Date
  status: string
  services: string[]
  // Onboarding specific
  oneTimeFee?: number | null
  monthlyRetainer?: number | null
  // Prospect specific
  budgetFeel?: string | null
  followUpType?: string | null
  followUpCallDate?: Date | null // New field for dashboard display
  // Raw data for modal
  rawData: any
}

export function DashboardContent() {
  const [proposals, setProposals] = useState<DashboardProposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [isTransitionPending, startTransition] = useTransition()

  // Edit state
  const [editingProposal, setEditingProposal] = useState<any>(null)
  const [editingType, setEditingType] = useState<"onboarding" | "prospect" | null>(null)

  // Delete action states
  const [deleteOnboardingState, deleteOnboardingAction, isOnboardingDeleting] = useActionState(
    deleteOnboardingProposal,
    { message: "", success: false },
  )
  const [deleteProspectState, deleteProspectAction, isProspectDeleting] = useActionState(deleteProspectProposal, {
    message: "",
    success: false,
  })

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getProposalsForDashboard()
      if (result.error) {
        throw new Error(result.error)
      }

      const mappedOnboarding: DashboardProposal[] = result.onboardingProposals.map((p: any) => ({
        id: p.id,
        type: "onboarding",
        clientName: p.client_name,
        businessName: p.business_name,
        industryNiche: p.industry_niche,
        location: p.location,
        submittedAt: parseISO(p.submitted_at),
        status: p.status || "New",
        services: p.services_offered || [],
        oneTimeFee: p.one_time_fee,
        monthlyRetainer: p.monthly_retainer,
        rawData: p,
      }))

      const mappedProspects: DashboardProposal[] = result.prospectProposals.map((p: any) => ({
        id: p.id,
        type: "prospect",
        clientName: formatContactName(p.prospect_first_name, p.prospect_last_name),
        businessName: p.prospect_business_name,
        submittedAt: parseISO(p.submitted_at),
        status: p.status || "New",
        services: p.prospect_services_interested || [],
        budgetFeel: p.prospect_budget_feel,
        followUpType: p.prospect_follow_up_type,
        followUpCallDate: p.prospect_follow_up_call_date ? parseISO(p.prospect_follow_up_call_date) : null,
        // Prospect specific fields for modal if needed
        industryNiche: p.prospect_business_type === "Other" ? p.other_business_type : p.prospect_business_type,
        location: p.prospect_city_state,
        rawData: p,
      }))

      const combinedProposals = [...mappedOnboarding, ...mappedProspects]
      combinedProposals.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()) // Sort by date descending
      setProposals(combinedProposals)
    } catch (err: any) {
      setError(err.message || "Failed to fetch proposals.")
      console.error("Dashboard fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Refetch data when a proposal is successfully deleted
  useEffect(() => {
    if (deleteOnboardingState.success || deleteProspectState.success) {
      fetchData()
    }
  }, [deleteOnboardingState.success, deleteProspectState.success])

  const handleDeleteProposal = (proposalId: string, proposalType: "onboarding" | "prospect") => {
    const formData = new FormData()
    formData.append("proposalId", proposalId)

    startTransition(() => {
      if (proposalType === "onboarding") {
        deleteOnboardingAction(formData)
      } else {
        deleteProspectAction(formData)
      }
    })
  }

  const handleEditProposal = (proposal: any, type: "onboarding" | "prospect") => {
    setEditingProposal(proposal)
    setEditingType(type)
  }

  const handleEditSuccess = () => {
    setEditingProposal(null)
    setEditingType(null)
    fetchData() // Refresh the data
  }

  const handleEditCancel = () => {
    setEditingProposal(null)
    setEditingType(null)
  }

  const filteredProposals = proposals.filter((proposal) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      proposal.clientName.toLowerCase().includes(searchLower) ||
      proposal.businessName.toLowerCase().includes(searchLower) ||
      (proposal.industryNiche && proposal.industryNiche.toLowerCase().includes(searchLower))

    const matchesType = filterType === "all" || proposal.type === filterType
    const matchesStatus = filterStatus === "all" || proposal.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: proposals.length,
    onboarding: proposals.filter((p) => p.type === "onboarding").length,
    prospects: proposals.filter((p) => p.type === "prospect").length,
    completed: proposals.filter((p) => p.status.toLowerCase() === "completed").length,
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-sclayGreen-DEFAULT" />
        <p className="ml-4 text-lg text-muted-foreground">Loading proposals...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Edit Proposal Dialog */}
      <Dialog open={!!editingProposal} onOpenChange={() => handleEditCancel()}>
        <DialogContent className="max-w-4xl bg-black border border-border">
          <DialogHeader>
            <DialogTitle className="text-sclayGreen-DEFAULT">
              Edit {editingType === "onboarding" ? "Onboarding" : "Prospect"} Proposal
            </DialogTitle>
            <DialogDescription>Make changes to the proposal details below.</DialogDescription>
          </DialogHeader>
          {editingProposal && editingType && (
            <EditProposalForm
              proposal={editingProposal}
              type={editingType}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Display delete messages */}
      {(deleteOnboardingState.message || deleteProspectState.message) && (
        <div
          className={`p-3 rounded-md text-sm ${
            deleteOnboardingState.success || deleteProspectState.success
              ? "bg-sclayGreen-DEFAULT/20 text-sclayGreen-DEFAULT"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {deleteOnboardingState.message || deleteProspectState.message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 py-8 mb-12">
        <Card className="bg-card/80 backdrop-blur-sm rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sclayGreen-DEFAULT">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Forms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onboarding}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospect Forms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prospects}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 backdrop-blur-sm rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sclayGreen-DEFAULT">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-sclayGreen-DEFAULT">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-[3] w-full">
              <div className="relative">
                <Input
                  placeholder="Search by client, business, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 bg-input focus:ring-sclayGreen-DEFAULT w-full h-12 sm:h-10"
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 sm:contents">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1 sm:w-[70px] bg-input h-12 sm:h-10">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="prospect">Prospects</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="flex-1 sm:w-[70px] bg-input h-12 sm:h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Table */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center text-xl text-sclayGreen-DEFAULT">
              <FileText className="mr-2 h-5 w-5" />
              Recent Proposals ({filteredProposals.length})
            </span>
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Client/Contact</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Industry/Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-sclayGreen-DEFAULT" />
                        {proposal.clientName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        {proposal.businessName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={proposal.type === "onboarding" ? "default" : "secondary"}>
                        {proposal.type === "onboarding" ? "Onboarding" : "Prospect"}
                      </Badge>
                    </TableCell>
                    <TableCell>{proposal.industryNiche || proposal.location}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(proposal.submittedAt, "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={proposal.status.toLowerCase() === "completed" ? "default" : "outline"}>
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-black border border-border">
                            <DialogHeader>
                              <DialogTitle className="text-sclayGreen-DEFAULT">
                                {proposal.businessName} - {proposal.type === "onboarding" ? "Onboarding" : "Prospect"}{" "}
                                Details
                              </DialogTitle>
                              <DialogDescription>
                                Submitted on {format(proposal.submittedAt, "MMMM dd, yyyy 'at' h:mm a")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                              {/* Common Fields */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Client/Contact Name</h4>
                                  <p className="text-sm">{proposal.clientName}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Business Name</h4>
                                  <p className="text-sm">{proposal.businessName}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Services</h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(
                                    proposal.rawData.services_offered ||
                                    proposal.rawData.prospect_services_interested ||
                                    []
                                  ).map((service: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Onboarding Specific */}
                              {proposal.type === "onboarding" && (
                                <>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Industry/Niche</h4>
                                      <p className="text-sm">{proposal.rawData.industry_niche}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Location</h4>
                                      <p className="text-sm">{proposal.rawData.location}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Website URL</h4>
                                      <p className="text-sm">{proposal.rawData.website_url || "N/A"}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Payment Terms</h4>
                                      <p className="text-sm">{proposal.rawData.payment_terms}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">
                                        Project Start Date
                                      </h4>
                                      <p className="text-sm">
                                        {format(parseISO(proposal.rawData.project_start_date), "MMM dd, yyyy")}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">
                                        Est. Delivery Date
                                      </h4>
                                      <p className="text-sm">
                                        {format(parseISO(proposal.rawData.estimated_delivery_date), "MMM dd, yyyy")}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">One-Time Fee</h4>
                                      <p className="text-sm">
                                        ${proposal.rawData.one_time_fee?.toLocaleString() || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">
                                        Monthly Retainer
                                      </h4>
                                      <p className="text-sm">
                                        ${proposal.rawData.monthly_retainer?.toLocaleString() || "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Pain Points/Goals</h4>
                                    <p className="text-sm whitespace-pre-wrap">{proposal.rawData.pain_points_goals}</p>
                                  </div>
                                  {proposal.rawData.performance_based && (
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">
                                        Performance Based
                                      </h4>
                                      <p className="text-sm whitespace-pre-wrap">
                                        {proposal.rawData.performance_based}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Prospect Specific */}
                              {proposal.type === "prospect" && (
                                <>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Phone</h4>
                                      <p className="text-sm">{proposal.rawData.prospect_phone}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Email</h4>
                                      <p className="text-sm">{proposal.rawData.prospect_email}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">City/State</h4>
                                      <p className="text-sm">{proposal.rawData.prospect_city_state}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Business Type</h4>
                                      <p className="text-sm">
                                        {proposal.rawData.prospect_business_type}
                                        {proposal.rawData.other_business_type
                                          ? ` (${proposal.rawData.other_business_type})`
                                          : ""}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Budget Feel</h4>
                                      <p className="text-sm">{proposal.rawData.prospect_budget_feel}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Follow-Up Type</h4>
                                      <p className="text-sm">{proposal.rawData.prospect_follow_up_type}</p>
                                    </div>
                                    {proposal.rawData.prospect_follow_up_call_date && (
                                      <div>
                                        <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">
                                          Follow-Up Call Date
                                        </h4>
                                        <p className="text-sm text-red-500">
                                          {format(
                                            parseISO(proposal.rawData.prospect_follow_up_call_date),
                                            "MMM dd, yyyy",
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Pain Point</h4>
                                    <p className="text-sm whitespace-pre-wrap">
                                      {proposal.rawData.prospect_pain_point}
                                    </p>
                                  </div>
                                  {proposal.rawData.prospect_call_notes && (
                                    <div>
                                      <h4 className="font-semibold text-sm text-sclayGreen-DEFAULT">Call Notes</h4>
                                      <p className="text-sm whitespace-pre-wrap">
                                        {proposal.rawData.prospect_call_notes}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            {/* Action Buttons in Modal Footer */}
                            <div className="flex justify-between pt-4 border-t border-border">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProposal(proposal.rawData, proposal.type)}
                                disabled={isOnboardingDeleting || isProspectDeleting || isTransitionPending}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Proposal
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={isOnboardingDeleting || isProspectDeleting || isTransitionPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Proposal
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-black border border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-400 text-xl">⚠️ Delete Proposal</AlertDialogTitle>
                                    <AlertDialogDescription className="text-base mt-4">
                                      Are you absolutely sure you want to delete this{" "}
                                      {proposal.type === "onboarding" ? "onboarding" : "prospect"} proposal for{" "}
                                      <strong className="text-white">{proposal.businessName}</strong>?
                                      <br /><br />
                                      <span className="text-red-400">This action cannot be undone.</span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-6">
                                    <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteProposal(proposal.id, proposal.type)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {isOnboardingDeleting || isProspectDeleting || isTransitionPending ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        "Yes, Delete Proposal"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredProposals.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">No proposals found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
