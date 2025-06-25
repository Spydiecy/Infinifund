"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Rocket, Target, DollarSign, CheckCircle, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { infinifundContract, type ProjectView } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import { ethers } from "ethers"
import Link from "next/link"

export default function MyProjectsPage() {
  const [userProjects, setUserProjects] = useState<ProjectView[]>([])
  const [loading, setLoading] = useState(true)
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isCitizen, setIsCitizen] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (isConnected && userAddress) {
      loadUserProjects()
    }
  }, [isConnected, userAddress])

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

  const loadUserProjects = async () => {
    try {
      setLoading(true)

      // Check citizenship status
      const citizenStatus = await infinifundContract.isCitizen(userAddress)
      setIsCitizen(citizenStatus)

      // Get user's project IDs
      const projectIds = await infinifundContract.getUserProjects(userAddress)
      const projectsData: ProjectView[] = []

      for (const projectId of projectIds) {
        try {
          const project = await infinifundContract.getProjectById(projectId)
          projectsData.push(project)
        } catch (error) {
          console.error(`Error loading project ${projectId}:`, error)
        }
      }

      // Sort by funding amount (highest first)
      projectsData.sort((a, b) => Number(b.totalFunds) - Number(a.totalFunds))
      setUserProjects(projectsData)
    } catch (error) {
      console.error("Error loading user projects:", error)
      toast.error("Failed to load your projects")
    } finally {
      setLoading(false)
    }
  }

  const formatEther = (wei: string) => {
    try {
      return Number.parseFloat(ethers.formatEther(wei)).toFixed(4)
    } catch {
      return "0.0000"
    }
  }

  const getProjectStatus = (project: ProjectView) => {
    if (project.fundingExpired) return { text: "Expired", color: "bg-red-500/20 text-red-300 border-red-500/30" }
    if (project.approvedForFunding)
      return { text: "Approved", color: "bg-green-500/20 text-green-300 border-green-500/30" }
    return { text: "Pending", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" }
  }

  const getProgressPercentage = (project: ProjectView) => {
    return project.milestoneCount > 0 ? (project.currentMilestone / project.milestoneCount) * 100 : 0
  }

  const getTotalFunding = () => {
    return userProjects.reduce((total, project) => total + Number(project.totalFunds), 0)
  }

  const getApprovedCount = () => {
    return userProjects.filter((p) => p.approvedForFunding).length
  }

  const getPendingProjects = () => {
    return userProjects.filter((p) => !p.approvedForFunding && !p.fundingExpired)
  }

  const getApprovedProjects = () => {
    return userProjects.filter((p) => p.approvedForFunding)
  }

  const getCompletedProjects = () => {
    return userProjects.filter((p) => p.currentMilestone >= p.milestoneCount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Your Projects...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-700 p-8 text-center max-w-md">
          <Rocket className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">Connect your wallet to view your projects</p>
          <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700 w-full">
            Connect Wallet
          </Button>
        </Card>
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                  My Projects
                </h1>
                <p className="text-gray-300 mt-2">Manage and track your submitted projects</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="text-sm text-gray-400">
                    Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </div>
                  {isCitizen && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Citizen
                    </Badge>
                  )}
                </div>
              </div>
              <Link href="/create-project">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Rocket className="h-4 w-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Rocket className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{userProjects.length}</p>
                    <p className="text-sm text-gray-400">Total Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{getApprovedCount()}</p>
                    <p className="text-sm text-gray-400">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{formatEther(getTotalFunding().toString())}</p>
                    <p className="text-sm text-gray-400">ETH Raised</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{getCompletedProjects().length}</p>
                    <p className="text-sm text-gray-400">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-700">
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="pending">Pending ({getPendingProjects().length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({getApprovedProjects().length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({getCompletedProjects().length})</TabsTrigger>
              </TabsList>

              {/* All Projects Tab */}
              <TabsContent value="all" className="space-y-6">
                {userProjects.length === 0 ? (
                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardContent className="p-12 text-center">
                      <Rocket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                      <p className="text-gray-400 mb-6">
                        {!isCitizen
                          ? "You need to be a citizen to submit projects"
                          : "Create your first project to get started"}
                      </p>
                      {isCitizen ? (
                        <Link href="/create-project">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Rocket className="h-4 w-4 mr-2" />
                            Create Project
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/citizenship">
                          <Button className="bg-green-600 hover:bg-green-700">Apply for Citizenship</Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {userProjects.map((project, index) => (
                      <ProjectCard key={project.project_id} project={project} index={index} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Pending Projects Tab */}
              <TabsContent value="pending" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getPendingProjects().map((project, index) => (
                    <ProjectCard key={project.project_id} project={project} index={index} />
                  ))}
                </div>
              </TabsContent>

              {/* Approved Projects Tab */}
              <TabsContent value="approved" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getApprovedProjects().map((project, index) => (
                    <ProjectCard key={project.project_id} project={project} index={index} />
                  ))}
                </div>
              </TabsContent>

              {/* Completed Projects Tab */}
              <TabsContent value="completed" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getCompletedProjects().map((project, index) => (
                    <ProjectCard key={project.project_id} project={project} index={index} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, index }: { project: ProjectView; index: number }) {
  const status = getProjectStatus(project)
  const progress = getProgressPercentage(project)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card className="bg-gray-900/50 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-white text-lg mb-2">{project.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={status.color}>{status.text}</Badge>
                <span className="text-xs text-gray-400">ID: {project.project_id}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <DollarSign className="h-4 w-4" />
              <span>{formatEther(project.totalFunds)} ETH</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Target className="h-4 w-4" />
              <span>
                {project.currentMilestone}/{project.milestoneCount}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/projects/${project.project_id}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full border-gray-600">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>

            {project.approvedForFunding && project.currentMilestone < project.milestoneCount && (
              <Link href={`/projects/${project.project_id}/milestone`} className="flex-1">
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  <Edit className="h-4 w-4 mr-1" />
                  Report
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function getProjectStatus(project: ProjectView) {
  if (project.fundingExpired) return { text: "Expired", color: "bg-red-500/20 text-red-300 border-red-500/30" }
  if (project.approvedForFunding)
    return { text: "Approved", color: "bg-green-500/20 text-green-300 border-green-500/30" }
  return { text: "Pending", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" }
}

function getProgressPercentage(project: ProjectView) {
  return project.milestoneCount > 0 ? (project.currentMilestone / project.milestoneCount) * 100 : 0
}

function formatEther(wei: string) {
  try {
    return Number.parseFloat(ethers.formatEther(wei)).toFixed(4)
  } catch {
    return "0.0000"
  }
}
