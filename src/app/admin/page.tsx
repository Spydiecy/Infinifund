"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Shield,
  Users,
  FileCheck,
  UserCheck,
  Crown,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { infinifundContract, type CitizenshipRequest, type ProjectView } from "@/lib/infinifund-contract"
import { useInfinifundContract } from "@/hooks/use-infinifund-contract"
import { toast } from "sonner"

interface AdminCard {
  title: string
  description: string
  icon: React.ReactNode
  count?: number
  action: () => void
  color: string
}

export default function AdminPage() {
  const {
    isConnected,
    userAddress,
    isCitizen,
    isAdmin,
    loading,
    approveCitizenship,
    rejectCitizenship,
    revokeCitizenship,
    addAdmin,
    removeAdmin,
    finalizeScreening,
    getAllProjects,
    getPendingCitizenshipRequests,
  } = useInfinifundContract()

  const [isMainAdmin, setIsMainAdmin] = useState(false)
  const [activeView, setActiveView] = useState<string>("")

  // Real data from contract
  const [pendingRequests, setPendingRequests] = useState<CitizenshipRequest[]>([])
  const [pendingProjects, setPendingProjects] = useState<ProjectView[]>([])

  // Form states
  const [citizenAddress, setCitizenAddress] = useState("")
  const [adminAddress, setAdminAddress] = useState("")
  const [removeAdminAddress, setRemoveAdminAddress] = useState("")

  // Loading states
  const [approvingCitizen, setApprovingCitizen] = useState("")
  const [rejectingCitizen, setRejectingCitizen] = useState("")
  const [revokingCitizen, setRevokingCitizen] = useState("")
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [removingAdmin, setRemovingAdmin] = useState("")
  const [finalizingProject, setFinalizingProject] = useState(0)

  useEffect(() => {
    if (isConnected && userAddress) {
      checkMainAdminStatus()
    }
  }, [isConnected, userAddress])

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  const checkMainAdminStatus = async () => {
    try {
      const mainAdminAddress = await infinifundContract.getAdmin()
      setIsMainAdmin(userAddress.toLowerCase() === mainAdminAddress.toLowerCase())
    } catch (error) {
      console.error("Error checking main admin status:", error)
    }
  }

  const loadAdminData = async () => {
    try {
      const requests = await getPendingCitizenshipRequests()
      setPendingRequests(requests)

      const allProjects = await getAllProjects()
      const pending = allProjects.filter((p) => !p.approvedForFunding && !p.fundingExpired)
      setPendingProjects(pending)
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast.error("Failed to load admin data")
    }
  }

  const handleApproveCitizenship = async (address: string) => {
    setApprovingCitizen(address)
    try {
      toast.info("Approving citizenship...")
      await approveCitizenship(address)
      await loadAdminData()
    } catch (error: any) {
      toast.error("Failed to approve citizenship: " + error.message)
    } finally {
      setApprovingCitizen("")
    }
  }

  const handleRejectCitizenship = async (address: string) => {
    setRejectingCitizen(address)
    try {
      toast.info("Rejecting citizenship...")
      await rejectCitizenship(address)
      await loadAdminData()
    } catch (error: any) {
      toast.error("Failed to reject citizenship: " + error.message)
    } finally {
      setRejectingCitizen("")
    }
  }

  const handleRevokeCitizenship = async () => {
    if (!citizenAddress) {
      toast.error("Please enter a citizen address")
      return
    }

    setRevokingCitizen(citizenAddress)
    try {
      toast.info("Revoking citizenship...")
      await revokeCitizenship(citizenAddress)
      setCitizenAddress("")
    } catch (error: any) {
      toast.error("Failed to revoke citizenship: " + error.message)
    } finally {
      setRevokingCitizen("")
    }
  }

  const handleAddAdmin = async () => {
    if (!adminAddress) {
      toast.error("Please enter an admin address")
      return
    }

    setAddingAdmin(true)
    try {
      toast.info("Adding admin...")
      await addAdmin(adminAddress)
      setAdminAddress("")
    } catch (error: any) {
      toast.error("Failed to add admin: " + error.message)
    } finally {
      setAddingAdmin(false)
    }
  }

  const handleRemoveAdmin = async () => {
    if (!removeAdminAddress) {
      toast.error("Please enter an admin address")
      return
    }

    setRemovingAdmin(removeAdminAddress)
    try {
      toast.info("Removing admin...")
      await removeAdmin(removeAdminAddress)
      setRemoveAdminAddress("")
    } catch (error: any) {
      toast.error("Failed to remove admin: " + error.message)
    } finally {
      setRemovingAdmin("")
    }
  }

  const handleFinalizeScreening = async (projectId: number) => {
    setFinalizingProject(projectId)
    try {
      toast.info("Finalizing project screening...")
      await finalizeScreening(projectId)
      await loadAdminData()
    } catch (error: any) {
      toast.error("Failed to finalize screening: " + error.message)
    } finally {
      setFinalizingProject(0)
    }
  }

  // Admin cards configuration
  const adminCards: AdminCard[] = [
    {
      title: "Citizenship Requests",
      description: "Review and approve new citizenship applications",
      icon: <UserCheck className="w-6 h-6" />,
      count: pendingRequests.length,
      action: () => setActiveView("citizenship"),
      color: "from-black/40 to-black/60 border-white/20"
    },
    {
      title: "Project Reviews",
      description: "Finalize screening for community-voted projects",
      icon: <FileCheck className="w-6 h-6" />,
      count: pendingProjects.length,
      action: () => setActiveView("projects"),
      color: "from-black/40 to-black/60 border-white/20"
    },
    {
      title: "Manage Admins",
      description: "Add or remove administrator privileges",
      icon: <Crown className="w-6 h-6" />,
      action: () => setActiveView("admins"),
      color: "from-black/40 to-black/60 border-white/20"
    },
    {
      title: "System Overview",
      description: "View platform statistics and analytics",
      icon: <Activity className="w-6 h-6" />,
      action: () => setActiveView("overview"),
      color: "from-black/40 to-black/60 border-white/20"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-black/50 border border-white/20 rounded-xl p-8 text-center max-w-md">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-gray-300 mb-4">Connect your wallet to access the admin panel</p>
          <p className="text-gray-400 text-sm">Use the wallet connection button in the navigation bar</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-black/50 border border-white/20 rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-white mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-4">You are not authorized to access the admin panel</p>
          <p className="text-sm text-gray-400">
            Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </p>
        </div>
      </div>
    )
  }

  // Main Dashboard View
  if (activeView === "") {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Hey Admin, Welcome Back
                </h1>
                <p className="text-gray-300 text-lg">
                  Here's what's happening with your platform today
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/30 rounded-lg border border-white/20">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm text-white">
                  Connected as {isMainAdmin ? "Main Admin" : "Admin"}
                </span>
              </div>
              <div className="text-sm text-gray-300 font-mono">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
                  <p className="text-sm text-gray-300">Pending Requests</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{pendingProjects.length}</p>
                  <p className="text-sm text-gray-300">Projects to Review</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">Active</p>
                  <p className="text-sm text-gray-300">Platform Status</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{isMainAdmin ? "Main" : "Sub"}</p>
                  <p className="text-sm text-gray-300">Access Level</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminCards.map((card, index) => (
              <div
                key={index}
                onClick={card.action}
                className={`relative overflow-hidden bg-gradient-to-br ${card.color} rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-200 border group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-black/30 border border-white/20 flex items-center justify-center text-white">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                      {card.count !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">{card.count}</span>
                          <span className="text-sm text-gray-300">pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-white text-sm mb-4">{card.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Click to manage</span>
                  <div className="w-6 h-6 rounded-full bg-black/30 border border-white/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <span className="text-white text-xs">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Citizenship Management View
  if (activeView === "citizenship") {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setActiveView("")}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">Citizenship Management</h1>
          </div>

          <div className="space-y-8">
            {/* Pending Requests */}
            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Pending Requests ({pendingRequests.length})
              </h3>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No pending citizenship requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.address}
                      className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/20"
                    >
                      <div>
                        <p className="text-white font-mono text-sm">
                          {request.address.slice(0, 8)}...{request.address.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-300">
                          {new Date(request.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleApproveCitizenship(request.address)}
                          disabled={approvingCitizen === request.address}
                          className="bg-black/80 hover:bg-black border border-white/20 text-white"
                        >
                          {approvingCitizen === request.address ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectCitizenship(request.address)}
                          disabled={rejectingCitizen === request.address}
                          className="border-white/20 text-white hover:bg-white hover:text-black"
                        >
                          {rejectingCitizen === request.address ? "Rejecting..." : "Reject"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revoke Citizenship */}
            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revoke Citizenship</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Citizen Address</Label>
                  <Input
                    value={citizenAddress}
                    onChange={(e) => setCitizenAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-black/30 border-white/20 text-white mt-2"
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!citizenAddress || revokingCitizen === citizenAddress}
                      className="bg-black/80 hover:bg-black border border-white/20 text-white"
                    >
                      {revokingCitizen === citizenAddress ? "Revoking..." : "Revoke Citizenship"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black border-white/20">
                    <DialogHeader>
                      <DialogTitle className="text-white">Confirm Revocation</DialogTitle>
                      <DialogDescription className="text-white">
                        Are you sure you want to revoke citizenship for {citizenAddress}?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button variant="outline" className="border-white/20">
                        Cancel
                      </Button>
                      <Button onClick={handleRevokeCitizenship} className="bg-black/80 hover:bg-black border border-white/20">
                        Confirm
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Project Management View
  if (activeView === "projects") {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setActiveView("")}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">Project Management</h1>
          </div>

          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Projects Awaiting Review ({pendingProjects.length})
            </h3>
            {pendingProjects.length === 0 ? (
              <div className="text-center py-12">
                <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No projects awaiting review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProjects.map((project) => (
                  <div key={project.project_id} className="p-4 bg-black/30 rounded-lg border border-white/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">{project.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                          <span>by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}</span>
                          <span>ID: {project.project_id}</span>
                          <span>{project.milestoneCount} milestones</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link href={`/projects/${project.project_id}`}>
                          <Button size="sm" variant="outline" className="border-white/20">
                            View Project
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleFinalizeScreening(project.project_id)}
                          disabled={finalizingProject === project.project_id}
                          className="bg-black/80 hover:bg-black border border-white/20"
                        >
                          {finalizingProject === project.project_id ? "Finalizing..." : "Finalize"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Admin Management View
  if (activeView === "admins") {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setActiveView("")}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">Admin Management</h1>
          </div>

          {!isMainAdmin && (
            <div className="p-4 bg-black/20 border border-white/20 rounded-xl mb-8">
              <p className="text-white text-sm">
                Only the main administrator can manage other administrators.
              </p>
            </div>
          )}

          <div className="space-y-8">
            {/* Add Admin */}
            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add Administrator</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">New Admin Address</Label>
                  <Input
                    value={adminAddress}
                    onChange={(e) => setAdminAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-black/30 border-white/20 text-white mt-2"
                    disabled={!isMainAdmin}
                  />
                </div>
                <Button
                  onClick={handleAddAdmin}
                  disabled={!adminAddress || addingAdmin || !isMainAdmin}
                  className="bg-black/80 hover:bg-black border border-white/20"
                >
                  {addingAdmin ? "Adding..." : "Add Administrator"}
                </Button>
              </div>
            </div>

            {/* Remove Admin */}
            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Remove Administrator</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Admin Address to Remove</Label>
                  <Input
                    value={removeAdminAddress}
                    onChange={(e) => setRemoveAdminAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-black/30 border-white/20 text-white mt-2"
                    disabled={!isMainAdmin}
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!removeAdminAddress || removingAdmin === removeAdminAddress || !isMainAdmin}
                      className="bg-black/80 hover:bg-black border border-white/20"
                    >
                      {removingAdmin === removeAdminAddress ? "Removing..." : "Remove Administrator"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black border-white/20">
                    <DialogHeader>
                      <DialogTitle className="text-white">Confirm Removal</DialogTitle>
                      <DialogDescription className="text-white">
                        Are you sure you want to remove admin privileges from {removeAdminAddress}?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button variant="outline" className="border-white/20">
                        Cancel
                      </Button>
                      <Button onClick={handleRemoveAdmin} className="bg-black/80 hover:bg-black border border-white/20">
                        Confirm
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // System Overview View
  if (activeView === "overview") {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setActiveView("")}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">System Overview</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Citizens</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{pendingRequests.length}</p>
              <p className="text-sm text-gray-300">Pending applications</p>
            </div>

            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Projects</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{pendingProjects.length}</p>
              <p className="text-sm text-gray-300">Awaiting review</p>
            </div>

            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Platform</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-1">Active</p>
              <p className="text-sm text-gray-300">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
