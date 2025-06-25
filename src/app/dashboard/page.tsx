"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Users, Rocket, DollarSign, Target, CheckCircle, Eye, Vote, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { infinifundContract, type Project } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import { ethers } from "ethers"
import Link from "next/link"

interface DashboardStats {
  totalProjects: number
  approvedProjects: number
  totalFunding: string
  userProjects: number
  userInvestments: number
}

export default function DashboardPage() {
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isCitizen, setIsCitizen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    approvedProjects: 0,
    totalFunding: "0",
    userProjects: 0,
    userInvestments: 0,
  })
  const [topProjects, setTopProjects] = useState<Project[]>([])
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [userInvestments, setUserInvestments] = useState<Project[]>([])

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (isConnected && userAddress) {
      loadDashboardData()
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

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Check user status
      const [citizenStatus, adminStatus] = await Promise.all([
        infinifundContract.isCitizen(userAddress),
        infinifundContract.isAdmin(userAddress),
      ])
      setIsCitizen(citizenStatus)
      setIsAdmin(adminStatus)

      // Get basic stats
      const projectCount = await infinifundContract.getProjectCount()
      const topProjectIds = await infinifundContract.getTopProjects(5)
      const userProjectIds = await infinifundContract.getUserProjects(userAddress)
      const userInvestmentIds = await infinifundContract.getUserInvestments(userAddress)

      // Load project details
      const [topProjectsData, userProjectsData, userInvestmentsData] = await Promise.all([
        Promise.all(topProjectIds.map((id) => infinifundContract.getProject(id))),
        Promise.all(userProjectIds.map((id) => infinifundContract.getProject(id))),
        Promise.all(userInvestmentIds.map((id) => infinifundContract.getProject(id))),
      ])

      // Calculate total funding and approved projects
      let totalFunding = BigInt(0)
      let approvedCount = 0

      for (let i = 1; i <= projectCount; i++) {
        try {
          const project = await infinifundContract.getProject(i)
          if (project.exists) {
            totalFunding += BigInt(project.totalFunds)
            if (project.approvedForFunding) approvedCount++
          }
        } catch (error) {
          console.error(`Error loading project ${i}:`, error)
        }
      }

      setStats({
        totalProjects: projectCount,
        approvedProjects: approvedCount,
        totalFunding: ethers.formatEther(totalFunding),
        userProjects: userProjectIds.length,
        userInvestments: userInvestmentIds.length,
      })

      setTopProjects(topProjectsData.filter((p) => p.exists))
      setUserProjects(userProjectsData.filter((p) => p.exists))
      setUserInvestments(userInvestmentsData.filter((p) => p.exists))
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load dashboard data")
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

  const getProjectStatus = (project: Project) => {
    if (project.fundingExpired) return { text: "Expired", color: "bg-red-500/20 text-red-300" }
    if (project.approvedForFunding) return { text: "Approved", color: "bg-green-500/20 text-green-300" }
    return { text: "Pending", color: "bg-yellow-500/20 text-yellow-300" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-700 p-8 text-center max-w-md">
          <Zap className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">Connect your wallet to access the Infinifund dashboard</p>
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
                  Infinifund Dashboard
                </h1>
                <p className="text-gray-300 mt-2">Decentralized funding platform for breakthrough innovations</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Connected as</p>
                  <p className="text-white font-mono">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {isCitizen && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Citizen
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
          >
            <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Rocket className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
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
                    <p className="text-2xl font-bold text-white">{stats.approvedProjects}</p>
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
                    <p className="text-2xl font-bold text-white">{Number.parseFloat(stats.totalFunding).toFixed(2)}</p>
                    <p className="text-sm text-gray-400">ETH Funded</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.userProjects}</p>
                    <p className="text-sm text-gray-400">My Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orange-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.userInvestments}</p>
                    <p className="text-sm text-gray-400">Investments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border border-gray-700">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="my-projects">My Projects</TabsTrigger>
                <TabsTrigger value="investments">Investments</TabsTrigger>
                <TabsTrigger value="actions">Quick Actions</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      Top Funded Projects
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Most successful projects on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProjects.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No projects found</p>
                      ) : (
                        topProjects.map((project) => {
                          const status = getProjectStatus(project)
                          return (
                            <div
                              key={project.id}
                              className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold">{project.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <h3 className="text-white font-semibold">{project.name}</h3>
                                  <p className="text-sm text-gray-400">
                                    by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-white font-semibold">{formatEther(project.totalFunds)} ETH</p>
                                  <Badge className={status.color}>{status.text}</Badge>
                                </div>
                                <Link href={`/projects/${project.id}`}>
                                  <Button size="sm" variant="outline" className="border-gray-600">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My Projects Tab */}
              <TabsContent value="my-projects" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">My Projects</h2>
                  <Link href="/create-project">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Rocket className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.length === 0 ? (
                    <Card className="col-span-full bg-gray-900/50 border-gray-700/50">
                      <CardContent className="p-8 text-center">
                        <Rocket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                        <p className="text-gray-400 mb-6">Create your first project to get started</p>
                        <Link href="/create-project">
                          <Button className="bg-blue-600 hover:bg-blue-700">Create Project</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    userProjects.map((project) => {
                      const status = getProjectStatus(project)
                      const progress = (project.currentMilestone / project.milestoneCount) * 100
                      return (
                        <Card
                          key={project.id}
                          className="bg-gray-900/50 border-gray-700/50 hover:border-blue-500/50 transition-colors"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-white font-semibold">{project.name}</h3>
                              <Badge className={status.color}>{status.text}</Badge>
                            </div>

                            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.details}</p>

                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white">{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />

                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Funded</span>
                                <span className="text-white">{formatEther(project.totalFunds)} ETH</span>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Link href={`/projects/${project.id}`} className="flex-1">
                                  <Button size="sm" variant="outline" className="w-full border-gray-600">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </Link>
                                {project.approvedForFunding && (
                                  <Link href={`/projects/${project.id}/milestone`} className="flex-1">
                                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                      <Target className="h-4 w-4 mr-1" />
                                      Report
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </TabsContent>

              {/* Investments Tab */}
              <TabsContent value="investments" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">My Investments</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userInvestments.length === 0 ? (
                    <Card className="col-span-full bg-gray-900/50 border-gray-700/50">
                      <CardContent className="p-8 text-center">
                        <DollarSign className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Investments Yet</h3>
                        <p className="text-gray-400 mb-6">Start funding projects to build your portfolio</p>
                        <Link href="/projects">
                          <Button className="bg-purple-600 hover:bg-purple-700">Browse Projects</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    userInvestments.map((project) => {
                      const status = getProjectStatus(project)
                      const progress = (project.currentMilestone / project.milestoneCount) * 100
                      return (
                        <Card
                          key={project.id}
                          className="bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50 transition-colors"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-white font-semibold">{project.name}</h3>
                              <Badge className={status.color}>{status.text}</Badge>
                            </div>

                            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.details}</p>

                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white">{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />

                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Funded</span>
                                <span className="text-white">{formatEther(project.totalFunds)} ETH</span>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Link href={`/projects/${project.id}`} className="flex-1">
                                  <Button size="sm" variant="outline" className="w-full border-gray-600">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </Link>
                                <Link href={`/projects/${project.id}/vote`} className="flex-1">
                                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                                    <Vote className="h-4 w-4 mr-1" />
                                    Vote
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </TabsContent>

              {/* Quick Actions Tab */}
              <TabsContent value="actions" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {!isCitizen && (
                    <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Become a Citizen</h3>
                        <p className="text-gray-300 mb-4">Apply for citizenship to submit projects and vote</p>
                        <Link href="/citizenship">
                          <Button className="bg-blue-600 hover:bg-blue-700 w-full">Apply Now</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  {isCitizen && (
                    <Card className="bg-gray-900/50 border-green-500/30 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <Rocket className="h-12 w-12 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Submit Project</h3>
                        <p className="text-gray-300 mb-4">Create a new project for community funding</p>
                        <Link href="/create-project">
                          <Button className="bg-green-600 hover:bg-green-700 w-full">Create Project</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
                    <CardContent className="p-6 text-center">
                      <Eye className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Browse Projects</h3>
                      <p className="text-gray-300 mb-4">Discover and fund innovative projects</p>
                      <Link href="/projects">
                        <Button className="bg-purple-600 hover:bg-purple-700 w-full">Browse Now</Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {isCitizen && (
                    <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <Vote className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Vote on Projects</h3>
                        <p className="text-gray-300 mb-4">Help decide which projects get funded</p>
                        <Link href="/vote">
                          <Button className="bg-yellow-600 hover:bg-yellow-700 w-full">Vote Now</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  {isAdmin && (
                    <Card className="bg-gray-900/50 border-red-500/30 backdrop-blur-sm">
                      <CardContent className="p-6 text-center">
                        <Crown className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Admin Panel</h3>
                        <p className="text-gray-300 mb-4">Manage platform and user permissions</p>
                        <Link href="/admin">
                          <Button className="bg-red-600 hover:bg-red-700 w-full">Admin Panel</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
