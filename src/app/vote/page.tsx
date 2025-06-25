"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Vote, CheckCircle, XCircle, Clock, Target, DollarSign, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { infinifundContract, type Project } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import { ethers } from "ethers"
import Link from "next/link"
import Image from "next/image"

interface VotingProject extends Project {
  screeningVotes: { votesFor: number; votesAgainst: number }
  hasVoted: boolean
}

export default function VotePage() {
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isCitizen, setIsCitizen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingProjects, setPendingProjects] = useState<VotingProject[]>([])
  const [approvedProjects, setApprovedProjects] = useState<VotingProject[]>([])
  const [votingProject, setVotingProject] = useState<number | null>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (isConnected && userAddress) {
      loadVotingData()
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

  const loadVotingData = async () => {
    try {
      setLoading(true)

      // Check citizenship status
      const citizenStatus = await infinifundContract.isCitizen(userAddress)
      setIsCitizen(citizenStatus)

      if (!citizenStatus) {
        setLoading(false)
        return
      }

      // Get all projects
      const projectCount = await infinifundContract.getProjectCount()
      const projects: VotingProject[] = []

      for (let i = 1; i <= projectCount; i++) {
        try {
          const project = await infinifundContract.getProject(i)
          if (project.exists) {
            const [screeningVotes, hasVoted] = await Promise.all([
              infinifundContract.getScreeningVotes(i),
              infinifundContract.hasVotedScreening(i, userAddress),
            ])

            projects.push({
              ...project,
              screeningVotes,
              hasVoted,
            })
          }
        } catch (error) {
          console.error(`Error loading project ${i}:`, error)
        }
      }

      // Separate pending and approved projects
      const pending = projects.filter((p) => !p.approvedForFunding && !p.fundingExpired)
      const approved = projects.filter((p) => p.approvedForFunding)

      setPendingProjects(pending)
      setApprovedProjects(approved)
    } catch (error) {
      console.error("Error loading voting data:", error)
      toast.error("Failed to load voting data")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (projectId: number, approve: boolean) => {
    setVotingProject(projectId)
    try {
      toast.info(`Submitting ${approve ? "approval" : "rejection"} vote...`)
      const tx = await infinifundContract.voteScreening(projectId, approve)
      await tx.wait()
      toast.success(`Vote ${approve ? "approved" : "rejected"} successfully!`)
      await loadVotingData()
    } catch (error: any) {
      toast.error("Failed to vote: " + error.message)
    } finally {
      setVotingProject(null)
    }
  }

  const formatEther = (wei: string) => {
    try {
      return Number.parseFloat(ethers.formatEther(wei)).toFixed(4)
    } catch {
      return "0.0000"
    }
  }

  const getApprovalRate = (votes: { votesFor: number; votesAgainst: number }) => {
    const total = votes.votesFor + votes.votesAgainst
    return total > 0 ? Math.round((votes.votesFor / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Voting Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-700 p-8 text-center max-w-md">
          <Vote className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">Connect your wallet to participate in project voting</p>
          <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700 w-full">
            Connect Wallet
          </Button>
        </Card>
      </div>
    )
  }

  if (!isCitizen) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-yellow-500/30 p-8 text-center max-w-md">
          <Users className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Citizenship Required</h2>
          <p className="text-gray-300 mb-6">Only citizens can vote on project proposals</p>
          <Link href="/citizenship">
            <Button className="bg-yellow-600 hover:bg-yellow-700 w-full">Apply for Citizenship</Button>
          </Link>
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Vote className="h-8 w-8 text-blue-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                Project Voting
              </h1>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-xl text-blue-300 mb-2">Community-Driven Project Approval</p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Help decide which projects deserve community funding by casting your vote
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{pendingProjects.length}</div>
                <div className="text-sm text-gray-300">Pending Approval</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{approvedProjects.length}</div>
                <div className="text-sm text-gray-300">Approved Projects</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Vote className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{pendingProjects.filter((p) => !p.hasVoted).length}</div>
                <div className="text-sm text-gray-300">Available to Vote</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Voting Interface */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-700">
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                <TabsTrigger value="approved">Approved Projects</TabsTrigger>
              </TabsList>

              {/* Pending Projects Tab */}
              <TabsContent value="pending" className="space-y-6">
                {pendingProjects.length === 0 ? (
                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardContent className="p-8 text-center">
                      <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Pending Projects</h3>
                      <p className="text-gray-400">All projects have been reviewed</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-gray-900/50 border-gray-700/50 hover:border-blue-500/50 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.details}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>
                                  by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                                </span>
                                <span>{project.milestoneCount} milestones</span>
                              </div>
                            </div>
                            {project.banner && (
                              <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-800 ml-4">
                                <Image
                                  src={
                                    project.banner.startsWith("ipfs://")
                                      ? `https://gateway.pinata.cloud/ipfs/${project.banner.replace("ipfs://", "")}`
                                      : project.banner
                                  }
                                  alt={project.name}
                                  width={80}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>

                          {/* Voting Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-black/30 rounded-lg">
                            <div className="text-center">
                              <div className="text-green-400 font-semibold">{project.screeningVotes.votesFor}</div>
                              <div className="text-xs text-gray-400">For</div>
                            </div>
                            <div className="text-center">
                              <div className="text-red-400 font-semibold">{project.screeningVotes.votesAgainst}</div>
                              <div className="text-xs text-gray-400">Against</div>
                            </div>
                            <div className="text-center">
                              <div className="text-blue-400 font-semibold">
                                {getApprovalRate(project.screeningVotes)}%
                              </div>
                              <div className="text-xs text-gray-400">Approval</div>
                            </div>
                          </div>

                          {/* Voting Buttons */}
                          <div className="flex gap-3">
                            {project.hasVoted ? (
                              <div className="flex-1 text-center py-2">
                                <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-1" />
                                <span className="text-green-400 text-sm font-semibold">Vote Cast</span>
                              </div>
                            ) : (
                              <>
                                <Button
                                  onClick={() => handleVote(project.id, true)}
                                  disabled={votingProject === project.id}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  {votingProject === project.id ? (
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleVote(project.id, false)}
                                  disabled={votingProject === project.id}
                                  variant="outline"
                                  className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                                >
                                  {votingProject === project.id ? (
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Reject
                                </Button>
                              </>
                            )}
                            <Link href={`/projects/${project.id}`}>
                              <Button size="sm" variant="outline" className="border-gray-600">
                                View
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Approved Projects Tab */}
              <TabsContent value="approved" className="space-y-6">
                {approvedProjects.length === 0 ? (
                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Approved Projects</h3>
                      <p className="text-gray-400">No projects have been approved for funding yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {approvedProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-gray-900/50 border-green-500/30 hover:border-green-500/50 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Approved</Badge>
                          </div>

                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.details}</p>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-400" />
                              <span className="text-white">{formatEther(project.totalFunds)} ETH</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-400" />
                              <span className="text-white">
                                {project.currentMilestone}/{project.milestoneCount}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/projects/${project.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full border-gray-600">
                                View Details
                              </Button>
                            </Link>
                            <Link href={`/projects/${project.id}`} className="flex-1">
                              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                Fund Project
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
