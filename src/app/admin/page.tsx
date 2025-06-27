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
  RefreshCw,
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
import { infinifundContract, type ProjectView, type ProjectDetails } from "@/lib/infinifund-contract"
import { useInfinifundContract } from "@/hooks/use-infinifund-contract"
import { toast } from "sonner"
import { useChainId } from 'wagmi'
import { baseSepolia } from '@/lib/rainbowkit-config'

interface AdminCard {
  title: string
  description: string
  icon: React.ReactNode
  count?: number
  action: () => void
  color: string
}

export default function AdminPage() {
  const chainId = useChainId()
  const {
    isConnected,
    userAddress,
    isCitizen,
    isAdmin,
    loading,
    approveCitizenship,
    revokeCitizenship,
    addAdmin,
    removeAdmin,
    finalizeScreening,
    getAllProjects,
  } = useInfinifundContract()

  const [isMainAdmin, setIsMainAdmin] = useState(false)
  const [activeView, setActiveView] = useState<string>("")

  // Real data from contract
  const [pendingProjects, setPendingProjects] = useState<ProjectView[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectView | null>(null)
  const [projectDetailsModalOpen, setProjectDetailsModalOpen] = useState(false)

  // Form states
  const [citizenAddress, setCitizenAddress] = useState("")
  const [revokeAddress, setRevokeAddress] = useState("")
  const [adminAddress, setAdminAddress] = useState("")
  const [removeAdminAddress, setRemoveAdminAddress] = useState("")

  // Loading states
  const [approvingCitizen, setApprovingCitizen] = useState("")
  const [revokingCitizen, setRevokingCitizen] = useState("")
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [removingAdmin, setRemovingAdmin] = useState("")
  const [finalizingProject, setFinalizingProject] = useState(0)
  const [refreshingData, setRefreshingData] = useState(false)

  useEffect(() => {
    if (isConnected && userAddress) {
      console.log("Admin page: Connected user:", userAddress)
      checkMainAdminStatus()
    }
  }, [isConnected, userAddress])

  // Removed auto-loading useEffect to prevent overloading
  // Data will only be loaded manually via "Load Data" button

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
      setRefreshingData(true)
      console.log("Loading admin data...")

      const allProjects = await getAllProjects()
      console.log("All projects:", allProjects)
      const pending = allProjects.filter((p) => !p.approvedForFunding && !p.fundingExpired)
      console.log("Pending projects:", pending)
      setPendingProjects(pending)
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast.error("Failed to load admin data")
    } finally {
      setRefreshingData(false)
    }
  }

  const handleApproveCitizenship = async (address: string) => {
    if (!address || !address.trim()) {
      toast.error("Please enter a valid address")
      return
    }

    console.log("Starting approval process for:", address)
    console.log("Current user address:", userAddress)
    console.log("Contract address:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
    console.log("Current chain ID:", chainId)
    console.log("Expected chain ID:", baseSepolia.id)
    
    // Check network first
    if (chainId !== baseSepolia.id) {
      toast.error(`Please switch to Base Sepolia network (Chain ID: ${baseSepolia.id}). Current chain: ${chainId}`)
      return
    }
    
    // Check admin status properly
    try {
      const adminStatus = await isAdmin(userAddress)
      console.log("Current user isAdmin:", adminStatus)
      
      if (!adminStatus) {
        toast.error("You are not authorized to approve citizenship. Only admins can perform this action.")
        return
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      toast.error("Failed to verify admin status")
      return
    }
    
    setApprovingCitizen(address)
    try {
      console.log("Calling approveCitizenship function...")
      toast.info("Submitting approval transaction...")
      const result = await approveCitizenship(address)
      console.log("Approval result:", result)
      
      if (result) {
        toast.success("Citizenship approval transaction submitted successfully!")
      } else {
        toast.error("Transaction failed. Please check the console for details.")
      }
    } catch (error: any) {
      console.error("Failed to approve citizenship:", error)
      let errorMessage = "Failed to approve citizenship"
      
      if (error?.message) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected by user"
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for gas fees"
        } else if (error.message.includes("not authorized") || error.message.includes("admin")) {
          errorMessage = "Not authorized - admin access required"
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setApprovingCitizen("")
    }
  }

  const handleRevokeCitizenship = async () => {
    if (!revokeAddress) {
      toast.error("Please enter a citizen address to revoke")
      return
    }

    setRevokingCitizen(revokeAddress)
    try {
      toast.info("Revoking citizenship...")
      await revokeCitizenship(revokeAddress)
      setRevokeAddress("")
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

  const handleApproveProject = async (projectId: number) => {
    setFinalizingProject(projectId)
    try {
      console.log("Approving project for funding:", projectId)
      console.log("Current user address:", userAddress)
      
      // Check admin status properly
      const adminStatus = await isAdmin(userAddress)
      console.log("Current user isAdmin:", adminStatus)
      
      if (!adminStatus) {
        toast.error("Only admins can approve projects for funding")
        return
      }
      
      toast.info("Submitting project approval transaction...")
      const result = await finalizeScreening(projectId)
      console.log("Approval result:", result)
      
      if (result) {
        toast.success("Project approval transaction submitted! Click 'Load Data' to refresh.")
        // Removed auto-reload - user must manually refresh
      } else {
        toast.error("Transaction failed. Please check the console for details.")
      }
    } catch (error: any) {
      console.error("Failed to approve project:", error)
      console.error("Error details:", {
        message: error?.message,
        cause: error?.cause,
        stack: error?.stack
      })
      
      let errorMessage = "Failed to approve project for funding"
      if (error?.message) {
        if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected by user"
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction"
        } else if (error.message.includes("not authorized") || error.message.includes("admin")) {
          errorMessage = "Not authorized - admin access required"
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setFinalizingProject(0)
    }
  }

  const handleViewProjectDetails = async (project: ProjectView) => {
    try {
      console.log("Opening project details for:", project.project_id)
      console.log("Project data:", project)
      console.log("Setting modal open to true...")
      
      // Set loading state
      setSelectedProject(null)
      setProjectDetailsModalOpen(true)
      console.log("Modal state set to open:", true)
      toast.info("Loading project details...")
      
      // Fetch full project details
      const fullDetails = await infinifundContract.getProjectDetails(project.project_id)
      console.log("Full project details received:", fullDetails)
      
      // Combine basic project data with full details
      const combinedProject = {
        ...project,
        icon: fullDetails.icon || "",
        banner: fullDetails.banner || "",
        details: fullDetails.details || "No description available",
        fundingDeadline: fullDetails.fundingDeadline || 0,
        exists: fullDetails.exists || false,
        investors: fullDetails.investors || [],
        milestones: fullDetails.milestones || []
      }
      
      console.log("Combined project data:", combinedProject)
      setSelectedProject(combinedProject as any)
      toast.success("Project details loaded")
    } catch (error) {
      console.error("Error fetching project details:", error)
      toast.error("Failed to load project details")
      
      // Show basic project data even if fetch fails
      const basicProject = {
        ...project,
        icon: "",
        banner: "",
        details: "Unable to load full project details",
        fundingDeadline: 0,
        exists: true,
        investors: [],
        milestones: []
      }
      setSelectedProject(basicProject as any)
    }
  }

  // Admin cards configuration
  const adminCards: AdminCard[] = [
    {
      title: "Citizenship Management",
      description: "Manually approve or revoke citizenship status",
      icon: <UserCheck className="w-6 h-6" />,
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
              <button
                onClick={loadAdminData}
                disabled={refreshingData}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors disabled:opacity-50 font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${refreshingData ? 'animate-spin' : ''}`} />
                <span>Load Data</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-black/50 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">-</p>
                  <p className="text-sm text-gray-300">Manual Management</p>
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
            {/* Manual Citizenship Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Approve Citizenship */}
              <div className="bg-black/50 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Approve Citizenship</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">User Address</Label>
                    <Input
                      value={citizenAddress}
                      onChange={(e) => setCitizenAddress(e.target.value)}
                      placeholder="0x..."
                      className="bg-black/30 border-white/20 text-white mt-2"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (citizenAddress.trim()) {
                        handleApproveCitizenship(citizenAddress.trim())
                        setCitizenAddress("")
                      }
                    }}
                    disabled={!citizenAddress || !!approvingCitizen}
                    className="w-full bg-green-600 hover:bg-green-700 border border-green-500 text-white"
                  >
                    {approvingCitizen ? "Approving..." : "Approve Citizenship"}
                  </Button>
                </div>
              </div>

              {/* Revoke Citizenship */}
              <div className="bg-black/50 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revoke Citizenship</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Citizen Address</Label>
                    <Input
                      value={revokeAddress}
                      onChange={(e) => setRevokeAddress(e.target.value)}
                      placeholder="0x..."
                      className="bg-black/30 border-white/20 text-white mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleRevokeCitizenship}
                    disabled={!revokeAddress || revokingCitizen === revokeAddress}
                    className="w-full bg-red-600 hover:bg-red-700 border border-red-500 text-white"
                  >
                    {revokingCitizen === revokeAddress ? "Revoking..." : "Revoke Citizenship"}
                  </Button>
                </div>
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
                <p className="text-gray-300">
                  {refreshingData ? "Loading..." : "No projects awaiting review found. Click 'Load Data' to refresh."}
                </p>
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
                          <span>Funds: {parseFloat(project.totalFunds) / 1e18} ETH</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          <p>Status: {project.approvedForFunding ? "Approved" : "Pending Review"}</p>
                          <p>Current Milestone: {project.currentMilestone} / {project.milestoneCount}</p>
                          <p>Funding Expired: {project.fundingExpired ? "Yes" : "No"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProjectDetails(project)}
                          className="border-white/20 text-white hover:bg-white hover:text-black"
                        >
                          View Details
                        </Button>
                        <Link href={`/projects/${project.project_id}`}>
                          <Button size="sm" variant="outline" className="border-white/20 w-full">
                            Public View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleApproveProject(project.project_id)}
                          disabled={finalizingProject === project.project_id || project.approvedForFunding}
                          className="bg-green-600 hover:bg-green-700 border border-green-500 text-white disabled:opacity-50"
                        >
                          {finalizingProject === project.project_id ? "Approving..." : 
                           project.approvedForFunding ? "Already Approved" : "Approve for Funding"}
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
              <p className="text-2xl font-bold text-white mb-1">-</p>
              <p className="text-sm text-gray-300">Manual management</p>
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

  return (
    <>
      {/* Main Content */}
      {/* Project Details Modal */}
      <div style={{ zIndex: 10000, position: 'relative' }}>
        <Dialog open={projectDetailsModalOpen} onOpenChange={setProjectDetailsModalOpen}>
          <DialogContent 
            className="bg-black border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto"
            style={{ zIndex: 9999, position: 'fixed' }}
          >
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {selectedProject ? `Project Details - ${selectedProject.name}` : "Loading Project Details..."}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedProject ? "Detailed information about the selected project" : "Please wait while we load the project information..."}
            </DialogDescription>
          </DialogHeader>
          
          {!selectedProject ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3 text-white">Loading project details...</span>
            </div>
          ) : (
            <div className="space-y-6 mt-4">
              {/* Project Header with Images */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Project Icon */}
                <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">Project Icon</h4>
                  {(selectedProject as any).icon ? (
                    <img 
                      src={(selectedProject as any).icon} 
                      alt="Project Icon" 
                      className="w-full h-32 object-cover rounded border border-white/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+";
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-700 rounded flex items-center justify-center border border-white/20">
                      <span className="text-gray-400 text-sm">No Icon Available</span>
                    </div>
                  )}
                </div>
                
                {/* Project Banner */}
                <div className="md:col-span-2 p-4 bg-black/30 border border-white/10 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">Project Banner</h4>
                  {(selectedProject as any).banner ? (
                    <img 
                      src={(selectedProject as any).banner} 
                      alt="Project Banner" 
                      className="w-full h-32 object-cover rounded border border-white/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gQmFubmVyPC90ZXh0Pgo8L3N2Zz4=";
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-700 rounded flex items-center justify-center border border-white/20">
                      <span className="text-gray-400 text-sm">No Banner Available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Basic Info */}
              <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                <h3 className="text-white font-bold text-lg mb-4">{selectedProject.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-400 block">Project ID</span>
                    <span className="text-white font-mono">{selectedProject.project_id}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 block">Creator</span>
                    <span className="text-white font-mono text-xs">
                      {selectedProject.creator.slice(0, 8)}...{selectedProject.creator.slice(-8)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 block">Total Funds</span>
                    <span className="text-white font-semibold">{parseFloat(selectedProject.totalFunds) / 1e18} ETH</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-400 block">Milestones</span>
                    <span className="text-white">{selectedProject.currentMilestone} / {selectedProject.milestoneCount}</span>
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Project Description</h4>
                <div className="text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto">
                  {(selectedProject as any).details || "No description available for this project."}
                </div>
              </div>

              {/* Project Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">Funding Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Approved for Funding:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${
                        selectedProject.approvedForFunding 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {selectedProject.approvedForFunding ? 'Approved' : 'Pending Review'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Funding Expired:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${
                        selectedProject.fundingExpired 
                          ? 'bg-red-900 text-red-300' 
                          : 'bg-green-900 text-green-300'
                      }`}>
                        {selectedProject.fundingExpired ? 'Yes' : 'Active'}
                      </span>
                    </div>
                    {(selectedProject as any).fundingDeadline && (selectedProject as any).fundingDeadline > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Funding Deadline:</span>
                        <span className="text-white text-xs">
                          {new Date((selectedProject as any).fundingDeadline * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">Project Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Milestone:</span>
                      <span className="text-white font-medium">{selectedProject.currentMilestone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Milestones:</span>
                      <span className="text-white font-medium">{selectedProject.milestoneCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Project Exists:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${
                        (selectedProject as any).exists 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {(selectedProject as any).exists ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investors */}
              {(selectedProject as any).investors && (selectedProject as any).investors.length > 0 && (
                <div className="p-4 bg-black/30 border border-white/10 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">
                    Investors ({(selectedProject as any).investors.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {(selectedProject as any).investors.map((investor: string, index: number) => (
                      <div key={index} className="bg-black/20 p-2 rounded border border-white/10">
                        <span className="text-gray-300 text-xs font-mono">
                          {investor.slice(0, 8)}...{investor.slice(-8)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setProjectDetailsModalOpen(false)}
                  className="border-white/20 text-white hover:bg-white hover:text-black"
                >
                  Close
                </Button>
                <Link href={`/projects/${selectedProject.project_id}`} target="_blank">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-slate-800">
                    View Public Page
                  </Button>
                </Link>
                {!selectedProject.approvedForFunding && (
                  <Button
                    onClick={() => {
                      setProjectDetailsModalOpen(false)
                      handleApproveProject(selectedProject.project_id)
                    }}
                    disabled={finalizingProject === selectedProject.project_id}
                    className="bg-green-600 hover:bg-green-700 border border-green-500 text-white"
                  >
                    {finalizingProject === selectedProject.project_id ? "Approving..." : "Approve for Funding"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
      
      {null}
    </>
  )
}
