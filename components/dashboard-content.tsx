"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getProposalsForDashboard,
  deleteOnboardingProposal,
  deleteProspectProposal,
  updateOnboardingStatus,
  updateProspectStatus,
} from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditProposalForm } from "@/components/edit-proposal-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Circle, Loader2 } from "lucide-react"
import { useActionState, useTransition } from "react"
import { toast } from "sonner"

const statusOptions = ["New", "Contacted", "Proposal Sent", "Negotiating", "Closed - Won", "Closed - Lost"]

export function DashboardContent() {
  const [proposals, setProposals] = useState({ onboardingProposals: [], prospectProposals: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [selectedProposalType, setSelectedProposalType] = useState<"onboarding" | "prospect" | null>(null)

  const [deleteOnboardingState, deleteOnboardingAction, isDeletingOnboarding] = useActionState(
    deleteOnboardingProposal,
    { message: "", success: false },
  )
  const [deleteProspectState, deleteProspectAction, isDeletingProspect] = useActionState(deleteProspectProposal, {
    message: "",
    success: false,
  })
  const [updateOnboardingStatusState, updateOnboardingStatusAction, isUpdatingOnboardingStatus] = useActionState(
    updateOnboardingStatus,
    { message: "", success: false },
  )
  const [updateProspectStatusState, updateProspectStatusAction, isUpdatingProspectStatus] = useActionState(
    updateProspectStatus,
    { message: "", success: false },
  )

  const [isTransitionPending, startTransition] = useTransition()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getProposalsForDashboard()
      setProposals(data)
    } catch (error) {
      console.error("Failed to fetch proposals:", error)
      toast.error("Failed to fetch proposals. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [
    fetchData,
    deleteOnboardingState.success,
    deleteProspectState.success,
    updateOnboardingStatusState.success,
    updateProspectStatusState.success,
  ])

  const handleOpenEditModal = (proposal: any, type: "onboarding" | "prospect") => {
    setSelectedProposal(proposal)
    setSelectedProposalType(type)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedProposal(null)
    setSelectedProposalType(null)
  }

  const handleDeleteProposal = (proposalId: string, type: "onboarding" | "prospect") => {
    const formData = new FormData()
    formData.append("proposalId", proposalId)

    if (type === "onboarding") {
      startTransition(() => {
        deleteOnboardingAction(formData)
      })
    } else {
      startTransition(() => {
        deleteProspectAction(formData)
      })
    }
  }

  const handleUpdateStatus = (proposalId: string, status: string, type: "onboarding" | "prospect") => {
    const formData = new FormData()
    formData.append("proposalId", proposalId)
    formData.append("status", status)

    if (type === "onboarding") {
      startTransition(() => {
        updateOnboardingStatusAction(formData)
      })
    } else {
      startTransition(() => {
        updateProspectStatusAction(formData)
      })
    }
  }

  const actualDeletingOnboarding = isDeletingOnboarding || isTransitionPending
  const actualDeletingProspect = isDeletingProspect || isTransitionPending
  const actualUpdatingOnboardingStatus = isUpdatingOnboardingStatus || isTransitionPending
  const actualUpdatingProspectStatus = isUpdatingProspectStatus || isTransitionPending

  return (
    <div>
      {isEditModalOpen && selectedProposal && selectedProposalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4 text-white">Edit Proposal</h2>
            <EditProposalForm
              proposal={selectedProposal}
              type={selectedProposalType}
              onSuccess={() => {
                toast.success("Proposal updated successfully!")
                handleCloseEditModal()
                fetchData() // Refresh data
              }}
              onCancel={handleCloseEditModal}
            />
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="secondary" onClick={handleCloseEditModal}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4 text-white">Onboarding Proposals</h2>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading proposals...
          </div>
        ) : proposals.onboardingProposals.length > 0 ? (
          <Table>
            <TableCaption>A list of onboarding proposals.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Client</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.onboardingProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">{proposal.client_name}</TableCell>
                  <TableCell>{proposal.business_name}</TableCell>
                  <TableCell>{proposal.industry_niche}</TableCell>
                  <TableCell>{proposal.location}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-[150px]">
                          {proposal.status || "New"}
                          <MoreVertical className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {statusOptions.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleUpdateStatus(proposal.id, status, "onboarding")}
                          >
                            {actualUpdatingOnboardingStatus ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Circle className="mr-2 h-4 w-4" />
                            )}
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenEditModal(proposal, "onboarding")}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProposal(proposal.id, "onboarding")}>
                          {actualDeletingOnboarding ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No onboarding proposals found.</p>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4 text-white">Prospect Proposals</h2>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Loading proposals...
          </div>
        ) : proposals.prospectProposals.length > 0 ? (
          <Table>
            <TableCaption>A list of prospect proposals.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Contact</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>City/State</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.prospectProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">{proposal.prospect_contact_name}</TableCell>
                  <TableCell>{proposal.prospect_business_name}</TableCell>
                  <TableCell>{proposal.prospect_city_state}</TableCell>
                  <TableCell>{proposal.prospect_business_type}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-[150px]">
                          {proposal.status || "New"}
                          <MoreVertical className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {statusOptions.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleUpdateStatus(proposal.id, status, "prospect")}
                          >
                            {actualUpdatingProspectStatus ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Circle className="mr-2 h-4 w-4" />
                            )}
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenEditModal(proposal, "prospect")}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProposal(proposal.id, "prospect")}>
                          {actualDeletingProspect ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No prospect proposals found.</p>
        )}
      </section>
    </div>
  )
}
