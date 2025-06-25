"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, DollarSign, Target, Users, Eye, Vote, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { infinifundContract, type ProjectView } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import { ethers } from "ethers"
import Link from "next/link"

export default function TopProjectsPage() {
  const [topProjects, setTopProjects] = useState<ProjectView[]>([])
  const [loading, setLoading] = useState(true)
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    checkConnection()
    loadTopProjects()
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

  const loadTopProjects = async () => {
    try {
      setLoading(true)

      // Get top 10 projects by funding
      const topProjectIds = await infinifundContract.getTopProjects(10)
      const projectsData: ProjectView[] = []

      for (const projectId of topProjectIds) {
        if (projectId > 0) {
          try {
            const project = await infinifundContract.getProjectById(projectId)
            projectsData.push(project)
          } catch (error) {
            console.error(`Error loading project ${projectId}:`, error)
          }
        }
      }

      setTopProjects(projectsData)
    } catch (error) {
      console.error("Error loading top projects:", error)
      toast.error("Failed to load top projects")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Top Projects...</p>
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
              <Crown className="h-8 w-8 text-yellow-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-white to-purple-400 bg-clip-text text-transparent">
                Top Funded Projects
              </h1>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-xl text-yellow-300 mb-2">Most Successful Projects on Infinifund</p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Discover the highest funded breakthrough innovations in our decentralized ecosystem
            </p>
          </motion.div>

          {/* Connection Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-4 h-4 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`}
                    />
                    <span className="text-white font-medium">
                      {isConnected
                        ? `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
                        : "Not Connected"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {!isConnected && (
                      <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
                        Connect Wallet
                      </Button>
                    )}
                    <Link href="/projects">
                      <Button variant="outline" className="border-gray-600 text-gray-300">
                        All Projects
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Projects Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {topProjects.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-700/50">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
                  <p className="text-gray-400 mb-6">No projects have been funded yet</p>
                  <Link href="/create-project">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Submit First Project
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {topProjects.map((project, index) => {
                  const status = getProjectStatus(project)
                  const progress = getProgressPercentage(project)
                  const rank = index + 1

                  return (
                    <motion.div
                      key={project.project_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300">
                        <CardContent className="p-8">
                          <div className="flex items-start gap-6">
                            {/* Rank Badge */}
                            <div className="flex-shrink-0">
                              <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                                  rank === 1
                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                                    : rank === 2
                                      ? "bg-gradient-to-r from-gray-300 to-gray-500 text-black"
                                      : rank === 3
                                        ? "bg-gradient-to-r from-orange-400 to-orange-600 text-black"
                                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                }`}
                              >
                                #{rank}
                              </div>
                            </div>

                            {/* Project Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h2 className="text-2xl font-bold text-white mb-2">{project.name}</h2>
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      <span>
                                        by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Target className="h-4 w-4" />
                                      <span>{project.milestoneCount} milestones</span>
                                    </div>
                                  </div>
                                </div>
                                <Badge className={status.color}>{status.text}</Badge>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="text-center p-4 bg-black/30 rounded-lg border border-gray-700">
                                  <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
                                  <div className="text-2xl font-bold text-white">{formatEther(project.totalFunds)}</div>
                                  <div className="text-sm text-gray-400">ETH Funded</div>
                                </div>

                                <div className="text-center p-4 bg-black/30 rounded-lg border border-gray-700">
                                  <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                                  <div className="text-2xl font-bold text-white">
                                    {project.currentMilestone}/{project.milestoneCount}
                                  </div>
                                  <div className="text-sm text-gray-400">Progress</div>
                                </div>

                                <div className="text-center p-4 bg-black/30 rounded-lg border border-gray-700">
                                  <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                                  <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
                                  <div className="text-sm text-gray-400">Complete</div>
                                </div>

                                <div className="text-center p-4 bg-black/30 rounded-lg border border-gray-700">
                                  <Crown className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                                  <div className="text-2xl font-bold text-white">#{rank}</div>
                                  <div className="text-sm text-gray-400">Rank</div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-gray-400">Milestone Progress</span>
                                  <span className="text-white">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-4">
                                <Link href={`/projects/${project.project_id}`} className="flex-1">
                                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                </Link>

                                {project.approvedForFunding && !project.fundingExpired && (
                                  <Link href={`/projects/${project.project_id}`} className="flex-1">
                                    <Button className="w-full bg-green-600 hover:bg-green-700">
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      Fund Project
                                    </Button>
                                  </Link>
                                )}

                                {!project.approvedForFunding && isConnected && (
                                  <Link href={`/projects/${project.project_id}`} className="flex-1">
                                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                      <Vote className="h-4 w-4 mr-2" />
                                      Vote
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Call to Action */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Want to see your project here?</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Submit your breakthrough innovation and get community funding to make it to the top of the leaderboard
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/create-project">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Zap className="h-4 w-4 mr-2" />
                      Submit Project
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="outline" className="border-gray-600 text-gray-300">
                      Browse All Projects
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
