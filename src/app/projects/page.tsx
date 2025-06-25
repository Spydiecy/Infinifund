"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Rocket,
  Calendar,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  Share2,
  Zap,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { infinifundContract, type Project } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all")
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    loadProjects()
    checkConnection()
  }, [])

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
  }

  const loadProjects = async () => {
    try {
      setLoading(true)
      const allProjects = await infinifundContract.getAllProjects()
      setProjects(allProjects)
    } catch (error) {
      console.error("Error loading projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
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

  const handleVote = async (projectId: number, approve: boolean) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to vote")
      return
    }

    try {
      toast.info("Submitting vote...")
      const tx = await infinifundContract.voteScreening(projectId, approve)
      await tx.wait()
      toast.success(`Vote ${approve ? "approved" : "rejected"} successfully!`)
      loadProjects() // Refresh projects
    } catch (error: any) {
      toast.error("Failed to vote: " + error.message)
    }
  }

  const handleFund = async (projectId: number, amount: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to fund")
      return
    }

    try {
      toast.info("Processing funding...")
      const tx = await infinifundContract.fundProject(projectId, amount)
      await tx.wait()
      toast.success("Project funded successfully!")
      loadProjects() // Refresh projects
    } catch (error: any) {
      toast.error("Failed to fund project: " + error.message)
    }
  }

  const filteredProjects = projects.filter((project) => {
    if (filter === "approved") return project.approvedForFunding
    if (filter === "pending") return !project.approvedForFunding
    return true
  })

  const formatEther = (wei: string) => {
    try {
      return Number.parseFloat(wei) / 1e18
    } catch {
      return 0
    }
  }

  const getProjectStatus = (project: Project) => {
    if (project.fundingExpired) return "expired"
    if (project.approvedForFunding) return "approved"
    return "pending"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "expired":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Infinita City Projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-blue-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                Infinita City Projects
              </h1>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-xl text-blue-300 mb-2">Breakthrough innovations advancing human longevity</p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Discover and support cutting-edge projects in biotechnology, AI, and frontier science
            </p>
          </motion.div>

          {/* Stats and Controls */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{projects.length}</div>
                  <div className="text-sm text-gray-300">Total Projects</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-green-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {projects.filter((p) => p.approvedForFunding).length}
                  </div>
                  <div className="text-sm text-gray-300">Approved</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {projects.filter((p) => !p.approvedForFunding && !p.fundingExpired).length}
                  </div>
                  <div className="text-sm text-gray-300">Pending</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {formatEther(
                      projects.reduce((sum, p) => sum + Number.parseFloat(p.totalFunds || "0"), 0).toString(),
                    ).toFixed(2)}{" "}
                    ETH
                  </div>
                  <div className="text-sm text-gray-300">Total Funded</div>
                </CardContent>
              </Card>
            </div>

            {/* Filter and Connect */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "bg-blue-600" : "bg-gray-800 border-gray-600 text-white"}
                >
                  All Projects
                </Button>
                <Button
                  variant={filter === "approved" ? "default" : "outline"}
                  onClick={() => setFilter("approved")}
                  className={filter === "approved" ? "bg-green-600" : "bg-gray-800 border-gray-600 text-white"}
                >
                  Approved
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  onClick={() => setFilter("pending")}
                  className={filter === "pending" ? "bg-yellow-600" : "bg-gray-800 border-gray-600 text-white"}
                >
                  Pending
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
                    Connect Wallet
                  </Button>
                )}
                <Link href="/create-project">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Rocket className="h-4 w-4 mr-2" />
                    Submit Project
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500">
                          <AvatarFallback className="text-white font-bold">{project.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                          <CardDescription className="text-gray-400 text-sm">
                            by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(getProjectStatus(project))}>{getProjectStatus(project)}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Project Image */}
                    {project.banner && (
                      <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-800">
                        <Image
                          src={
                            project.banner.startsWith("ipfs://")
                              ? `https://gateway.pinata.cloud/ipfs/${project.banner.replace("ipfs://", "")}`
                              : project.banner
                          }
                          alt={project.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-gray-300 text-sm line-clamp-3">{project.details}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-blue-400">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatEther(project.totalFunds).toFixed(4)} ETH</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-400">
                        <Target className="h-4 w-4" />
                        <span>{project.milestoneCount} Milestones</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400">
                        <Clock className="h-4 w-4" />
                        <span>Phase {project.currentMilestone + 1}</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(project.fundingDeadline * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">
                          {Math.round((project.currentMilestone / project.milestoneCount) * 100)}%
                        </span>
                      </div>
                      <Progress value={(project.currentMilestone / project.milestoneCount) * 100} className="h-2" />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {!project.approvedForFunding && isConnected && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleVote(project.id, true)}
                            className="bg-green-600 hover:bg-green-700 flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(project.id, false)}
                            className="border-red-500 text-red-400 hover:bg-red-500/10 flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {project.approvedForFunding && isConnected && (
                        <Button
                          size="sm"
                          onClick={() => handleFund(project.id, "0.01")}
                          className="bg-blue-600 hover:bg-blue-700 flex-1"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Fund 0.01 ETH
                        </Button>
                      )}

                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Rocket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
              <p className="text-gray-400 mb-6">
                {filter === "all" ? "No projects have been submitted yet." : `No ${filter} projects found.`}
              </p>
              <Link href="/create-project">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Rocket className="h-4 w-4 mr-2" />
                  Submit First Project
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
