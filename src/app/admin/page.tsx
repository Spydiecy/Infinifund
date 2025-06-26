"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  UserMinus,
  UserPlus,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Users,
  Gavel,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { infinifundContract, type CitizenshipRequest, type ProjectView } from "@/lib/infinifund-contract"
import { toast } from "sonner"

export default function AdminPage() {
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMainAdmin, setIsMainAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

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
    checkConnection()
  }, [])

  useEffect(() => {
    if (isConnected && userAddress) {
      checkAdminStatus()
    }
  }, [isConnected, userAddress])

  useEffect(() => {
    if (isAdmin) {
      loadAdminData()
    }
  }, [isAdmin])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setUserAddress(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
    setLoading(false)
  }

  const connectWallet = async () => {
    try {
      const address = await infinifundContract.connect()
      setUserAddress(address)
      setIsConnected(true)
      toast.success("Wallet connected successfully!")
    } catch (error: any) {
      toast.error("Failed to connect wallet: " + error.message)
    }
  }

  const checkAdminStatus = async () => {
    if (!userAddress) return

    try {
      const [adminStatus, mainAdminAddress] = await Promise.all([
        infinifundContract.isAdmin(userAddress),
        infinifundContract.getAdmin(),
      ])

      setIsAdmin(adminStatus || userAddress.toLowerCase() === mainAdminAddress.toLowerCase())
      setIsMainAdmin(userAddress.toLowerCase() === mainAdminAddress.toLowerCase())
    } catch (error) {
      console.error("Error checking admin status:", error)
      toast.error("Failed to check admin status")
    }
  }

  const loadAdminData = async () => {
    try {
      // Load pending citizenship requests from contract events
      const requests = await infinifundContract.getPendingCitizenshipRequests()
      setPendingRequests(requests)

      // Load pending projects (not approved for funding)
      const allProjects = await infinifundContract.getAllProjects()
      const pending = allProjects.filter((p) => !p.approvedForFunding && !p.fundingExpired)
      setPendingProjects(pending)
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast.error("Failed to load admin data")
    }
  }

  const handleApproveCitizenship = async (address: string) => {
    console.log("approve citizenship is running");
    
    setApprovingCitizen(address)
    try {
      toast.info("Approving citizenship...")
      const tx = await infinifundContract.approveCitizenship(address)
      await tx.wait()
      toast.success("Citizenship approved successfully!")
      await loadAdminData()
    } catch (error: any) {
      console.log(error);
      
      toast.error("Failed to approve citizenship: " + error.message)
    } finally {
      setApprovingCitizen("")
    }
  }

  const handleRejectCitizenship = async (address: string) => {
    setRejectingCitizen(address)
    try {
      toast.info("Rejecting citizenship...")
      const tx = await infinifundContract.rejectCitizenship(address)
      await tx.wait()
      toast.success("Citizenship rejected successfully!")
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
      const tx = await infinifundContract.revokeCitizenship(citizenAddress)
      await tx.wait()
      toast.success("Citizenship revoked successfully!")
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
      const tx = await infinifundContract.addAdmin(adminAddress)
      await tx.wait()
      toast.success("Admin added successfully!")
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
      const tx = await infinifundContract.removeAdmin(removeAdminAddress)
      await tx.wait()
      toast.success("Admin removed successfully!")
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
      const tx = await infinifundContract.finalizeScreening(projectId)
      await tx.wait()
      toast.success("Project screening finalized!")
      await loadAdminData()
    } catch (error: any) {
      toast.error("Failed to finalize screening: " + error.message)
    } finally {
      setFinalizingProject(0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-700 p-8 text-center">
          <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
          <p className="text-gray-300 mb-6">Connect your wallet to access the admin panel</p>
          <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
            Connect Wallet
          </Button>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-blue-500/30 p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-4">You are not authorized to access the admin panel</p>
          <p className="text-sm text-gray-400">
            Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-blue-800/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-white to-blue-300 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <Crown className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-xl text-blue-300 mb-2">Infinifund Platform Administration</p>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {isMainAdmin ? "Main Administrator" : "Administrator"}
              </Badge>
              <span className="text-gray-400">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{pendingRequests.length}</div>
                <div className="text-sm text-gray-300">Pending Citizenship</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Gavel className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{pendingProjects.length}</div>
                <div className="text-sm text-gray-300">Projects to Review</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{isMainAdmin ? "Main" : "Sub"}</div>
                <div className="text-sm text-gray-300">Admin Level</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tabs defaultValue="citizenship" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-700">
                <TabsTrigger value="citizenship">Citizenship Management</TabsTrigger>
                <TabsTrigger value="projects">Project Review</TabsTrigger>
                <TabsTrigger value="admins" disabled={!isMainAdmin}>
                  Admin Management
                </TabsTrigger>
              </TabsList>

              {/* Citizenship Management */}
              <TabsContent value="citizenship" className="space-y-6">
                {/* Pending Requests */}
                <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-400" />
                      Pending Citizenship Requests ({pendingRequests.length})
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Review and approve or reject citizenship applications from the blockchain
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No pending citizenship requests</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingRequests.map((request) => (
                          <div
                            key={request.address}
                            className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gray-700"
                          >
                            <div>
                              <p className="text-white font-mono">
                                {request.address.slice(0, 6)}...{request.address.slice(-4)}
                              </p>
                              <p className="text-sm text-gray-400">
                                Requested {new Date(request.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveCitizenship(request.address)}
                                disabled={approvingCitizen === request.address}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {approvingCitizen === request.address ? (
                                  <Clock className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectCitizenship(request.address)}
                                disabled={rejectingCitizen === request.address}
                                className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
                              >
                                {rejectingCitizen === request.address ? (
                                  <Clock className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Revoke Citizenship */}
                <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserMinus className="h-5 w-5 text-blue-400" />
                      Revoke Citizenship
                    </CardTitle>
                    <CardDescription className="text-gray-300">Remove citizenship from a user</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Citizen Address</Label>
                      <Input
                        value={citizenAddress}
                        onChange={(e) => setCitizenAddress(e.target.value)}
                        placeholder="0x..."
                        className="bg-black/50 border-gray-600 text-white"
                      />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!citizenAddress || revokingCitizen === citizenAddress}
                          className="bg-blue-600 hover:bg-blue-700 w-full"
                        >
                          {revokingCitizen === citizenAddress ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Revoking...
                            </>
                          ) : (
                            <>
                              <UserMinus className="h-4 w-4 mr-2" />
                              Revoke Citizenship
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-blue-400">Confirm Revocation</DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Are you sure you want to revoke citizenship for {citizenAddress}? This action cannot be
                            undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-4 justify-end">
                          <Button variant="outline" className="border-gray-600">
                            Cancel
                          </Button>
                          <Button onClick={handleRevokeCitizenship} className="bg-blue-600 hover:bg-blue-700">
                            Confirm Revocation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Project Review */}
              <TabsContent value="projects" className="space-y-6">
                <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gavel className="h-5 w-5 text-blue-400" />
                      Projects Awaiting Review ({pendingProjects.length})
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Finalize screening votes for projects that have received community votes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pendingProjects.length === 0 ? (
                      <div className="text-center py-8">
                        <Gavel className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No projects awaiting review</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingProjects.map((project) => (
                          <div key={project.project_id} className="p-4 bg-black/30 rounded-lg border border-gray-700">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-white font-semibold text-lg mb-2">{project.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                  <span>
                                    by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                                  </span>
                                  <span>ID: {project.project_id}</span>
                                  <span>{project.milestoneCount} milestones</span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                  <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/30">
                                    <div className="text-blue-400 font-semibold">Votes For</div>
                                    <div className="text-white text-lg">Loading...</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-500/10 rounded border border-gray-500/30">
                                    <div className="text-gray-400 font-semibold">Votes Against</div>
                                    <div className="text-white text-lg">Loading...</div>
                                  </div>
                                  <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/30">
                                    <div className="text-blue-400 font-semibold">Total Votes</div>
                                    <div className="text-white text-lg">Loading...</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 ml-4">
                                <Link href={`/projects/${project.project_id}`}>
                                  <Button size="sm" variant="outline" className="border-gray-600">
                                    View Details
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  onClick={() => handleFinalizeScreening(project.project_id)}
                                  disabled={finalizingProject === project.project_id}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {finalizingProject === project.project_id ? (
                                    <Clock className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Finalize"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Management */}
              <TabsContent value="admins" className="space-y-6">
                <Alert className="border-blue-500/30 bg-blue-500/10">
                  <Crown className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    Only the main administrator can manage other administrators.
                  </AlertDescription>
                </Alert>

                {/* Add Admin */}
                <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-blue-400" />
                      Add Administrator
                    </CardTitle>
                    <CardDescription className="text-gray-300">Grant admin privileges to a user</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">New Admin Address</Label>
                      <Input
                        value={adminAddress}
                        onChange={(e) => setAdminAddress(e.target.value)}
                        placeholder="0x..."
                        className="bg-black/50 border-gray-600 text-white"
                      />
                    </div>
                    <Button
                      onClick={handleAddAdmin}
                      disabled={!adminAddress || addingAdmin}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      {addingAdmin ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Adding Admin...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Administrator
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Remove Admin */}
                <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trash2 className="h-5 w-5 text-blue-400" />
                      Remove Administrator
                    </CardTitle>
                    <CardDescription className="text-gray-300">Remove admin privileges from a user</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Admin Address to Remove</Label>
                      <Input
                        value={removeAdminAddress}
                        onChange={(e) => setRemoveAdminAddress(e.target.value)}
                        placeholder="0x..."
                        className="bg-black/50 border-gray-600 text-white"
                      />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          disabled={!removeAdminAddress || removingAdmin === removeAdminAddress}
                          className="bg-blue-600 hover:bg-blue-700 w-full"
                        >
                          {removingAdmin === removeAdminAddress ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Administrator
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-blue-400">Confirm Removal</DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Are you sure you want to remove admin privileges from {removeAdminAddress}?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-4 justify-end">
                          <Button variant="outline" className="border-gray-600">
                            Cancel
                          </Button>
                          <Button onClick={handleRemoveAdmin} className="bg-blue-600 hover:bg-blue-700">
                            Confirm Removal
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
