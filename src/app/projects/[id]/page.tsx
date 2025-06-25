"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Vote,
  TrendingUp,
  Calendar,
  User,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { infinifundContract, type Project } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import { ethers } from "ethers"
import Link from "next/link"
import Image from "next/image"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = Number(params.id)

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isCitizen, setIsCitizen] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [screeningVotes, setScreeningVotes] = useState({ votesFor: 0, votesAgainst: 0 })
  const [fundingAmount, setFundingAmount] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [isFunding, setIsFunding] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId, userAddress])

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

  const loadProjectData = async () => {
    try {
      setLoading(true)
      const projectData = await infinifundContract.getProject(projectId)

      if (!projectData.exists) {
        toast.error("Project not found")
        return
      }

      setProject(projectData)

      if (userAddress) {
        const [citizenStatus, votedStatus, votes] = await Promise.all([
          infinifundContract.isCitizen(userAddress),
          infinifundContract.hasVotedScreening(projectId, userAddress),
          infinifundContract.getScreeningVotes(projectId),
        ])

        setIsCitizen(citizenStatus)
        setHasVoted(votedStatus)
        setScreeningVotes(votes)
      }
    } catch (error) {
      console.error("Error loading project:", error)
      toast.error("Failed to load project data")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (approve: boolean) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to vote")
      return
    }

    if (!isCitizen) {
      toast.error("Only citizens can vote")
      return
    }

    setIsVoting(true)
    try {
      toast.info(`Submitting ${approve ? "approval" : "rejection"} vote...`)
      const tx = await infinifundContract.voteScreening(projectId, approve)
      await tx.wait()
      toast.success(`Vote ${approve ? "approved" : "rejected"} successfully!`)
      await loadProjectData()
    } catch (error: any) {
      toast.error("Failed to vote: " + error.message)
    } finally {
      setIsVoting(false)
    }
  }

  const handleFunding = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to fund")
      return
    }

    if (!fundingAmount || Number.parseFloat(fundingAmount) <= 0) {
      toast.error("Please enter a valid funding amount")
      return
    }

    setIsFunding(true)
    try {
      toast.info("Processing funding transaction...")
      const tx = await infinifundContract.fundProject(projectId, fundingAmount)
      await tx.wait()
      toast.success(`Successfully funded ${fundingAmount} ETH!`)
      setFundingAmount("")
      await loadProjectData()
    } catch (error: any) {
      toast.error("Failed to fund project: " + error.message)
    } finally {
      setIsFunding(false)
    }
  }

  const formatEther = (wei: string) => {
    try {
      return Number.parseFloat(ethers.formatEther(wei)).toFixed(4)
    } catch {
      return "0.0000"
    }
  }

  const getProjectStatus = () => {
    if (!project) return { text: "Unknown", color: "bg-gray-500/20 text-gray-300" }
    if (project.fundingExpired) return { text: "Expired", color: "bg-red-500/20 text-red-300" }
    if (project.approvedForFunding) return { text: "Approved", color: "bg-green-500/20 text-green-300" }
    return { text: "Pending Approval", color: "bg-yellow-500/20 text-yellow-300" }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-red-500/30 p-8 text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-4">Project Not Found</h2>
          <p className="text-gray-300 mb-6">The requested project does not exist or has been removed.</p>
          <Link href="/projects">
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Projects</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const status = getProjectStatus()
  const progress = project.milestoneCount > 0 ? (project.currentMilestone / project.milestoneCount) * 100 : 0
  const totalVotes = screeningVotes.votesFor + screeningVotes.votesAgainst
  const approvalRate = totalVotes > 0 ? (screeningVotes.votesFor / totalVotes) * 100 : 0

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/projects">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <Badge className={status.color}>{status.text}</Badge>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{project.name}</h1>
                <p className="text-gray-300 text-lg mb-4">{project.details}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>
                      by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {new Date(project.fundingDeadline * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {project.banner && (
                <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-800 ml-6">
                  <Image
                    src={
                      project.banner.startsWith("ipfs://")
                        ? `https://gateway.pinata.cloud/ipfs/${project.banner.replace("ipfs://", "")}`
                        : project.banner
                    }
                    alt={project.name}
                    width={192}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="bg-gray-900/50 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{formatEther(project.totalFunds)}</p>
                    <p className="text-sm text-gray-400">ETH Funded</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {project.currentMilestone}/{project.milestoneCount}
                    </p>
                    <p className="text-sm text-gray-400">Milestones</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Vote className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{screeningVotes.votesFor}</p>
                    <p className="text-sm text-gray-400">Approval Votes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{Math.round(approvalRate)}%</p>
                    <p className="text-sm text-gray-400">Approval Rate</p>
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
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="voting">Voting</TabsTrigger>
                <TabsTrigger value="funding">Funding</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">Project Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 leading-relaxed">{project.details}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Milestone Progress</span>
                            <span className="text-white">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          <p className="text-sm text-gray-400">
                            {project.currentMilestone} of {project.milestoneCount} milestones completed
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">Creator</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-mono text-sm">{project.creator}</p>
                            <p className="text-gray-400 text-xs">Project Creator</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Funding Deadline</span>
                            <span className="text-white text-sm">
                              {new Date(project.fundingDeadline * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status</span>
                            <Badge className={status.color}>{status.text}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Milestones Tab */}
              <TabsContent value="milestones" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Project Milestones</CardTitle>
                    <CardDescription className="text-gray-300">
                      Track the progress of this project through its defined milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.from({ length: project.milestoneCount }, (_, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border ${
                            i < project.currentMilestone
                              ? "border-green-500/30 bg-green-500/10"
                              : i === project.currentMilestone
                                ? "border-blue-500/30 bg-blue-500/10"
                                : "border-gray-700 bg-gray-800/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {i < project.currentMilestone ? (
                                <CheckCircle className="h-6 w-6 text-green-400" />
                              ) : i === project.currentMilestone ? (
                                <Clock className="h-6 w-6 text-blue-400" />
                              ) : (
                                <div className="h-6 w-6 rounded-full border-2 border-gray-600" />
                              )}
                              <div>
                                <h3 className="text-white font-semibold">Milestone {i + 1}</h3>
                                <p className="text-gray-400 text-sm">
                                  {i < project.currentMilestone
                                    ? "Completed"
                                    : i === project.currentMilestone
                                      ? "In Progress"
                                      : "Pending"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voting Tab */}
              <TabsContent value="voting" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Screening Votes</CardTitle>
                      <CardDescription className="text-gray-300">
                        Community voting to approve this project for funding
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Approval Votes</span>
                          <span className="text-green-400 font-semibold">{screeningVotes.votesFor}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Rejection Votes</span>
                          <span className="text-red-400 font-semibold">{screeningVotes.votesAgainst}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Approval Rate</span>
                          <span className="text-white font-semibold">{Math.round(approvalRate)}%</span>
                        </div>
                        <Progress value={approvalRate} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Cast Your Vote</CardTitle>
                      <CardDescription className="text-gray-300">
                        Help decide if this project should receive funding
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isConnected ? (
                        <div className="text-center">
                          <p className="text-gray-400 mb-4">Connect your wallet to vote</p>
                          <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
                            Connect Wallet
                          </Button>
                        </div>
                      ) : !isCitizen ? (
                        <div className="text-center">
                          <p className="text-gray-400 mb-4">Only citizens can vote on projects</p>
                          <Link href="/citizenship">
                            <Button className="bg-blue-600 hover:bg-blue-700">Apply for Citizenship</Button>
                          </Link>
                        </div>
                      ) : hasVoted ? (
                        <div className="text-center">
                          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                          <p className="text-green-400 font-semibold">You have already voted on this project</p>
                        </div>
                      ) : project.approvedForFunding ? (
                        <div className="text-center">
                          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                          <p className="text-green-400 font-semibold">This project has been approved for funding</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-gray-300 text-sm">
                            Vote to approve or reject this project for community funding
                          </p>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleVote(true)}
                              disabled={isVoting}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {isVoting ? (
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleVote(false)}
                              disabled={isVoting}
                              variant="outline"
                              className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                            >
                              {isVoting ? (
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Funding Tab */}
              <TabsContent value="funding" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Fund This Project</CardTitle>
                      <CardDescription className="text-gray-300">
                        Support this project by contributing ETH
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isConnected ? (
                        <div className="text-center">
                          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 mb-4">Connect your wallet to fund this project</p>
                          <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
                            Connect Wallet
                          </Button>
                        </div>
                      ) : !project.approvedForFunding ? (
                        <div className="text-center">
                          <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                          <p className="text-yellow-400 font-semibold">Project pending approval</p>
                          <p className="text-gray-400 text-sm">
                            This project must be approved before it can receive funding
                          </p>
                        </div>
                      ) : project.fundingExpired ? (
                        <div className="text-center">
                          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                          <p className="text-red-400 font-semibold">Funding period expired</p>
                          <p className="text-gray-400 text-sm">This project is no longer accepting funding</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300">Funding Amount (ETH)</Label>
                            <Input
                              type="number"
                              step="0.001"
                              min="0"
                              value={fundingAmount}
                              onChange={(e) => setFundingAmount(e.target.value)}
                              placeholder="0.1"
                              className="bg-black/50 border-gray-600 text-white"
                            />
                          </div>
                          <Button
                            onClick={handleFunding}
                            disabled={isFunding || !fundingAmount}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {isFunding ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Fund Project
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-gray-400 text-center">
                            Funds will be released to the creator as milestones are completed
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white">Funding Statistics</CardTitle>
                      <CardDescription className="text-gray-300">
                        Current funding status and investor information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Raised</span>
                          <span className="text-white font-semibold">{formatEther(project.totalFunds)} ETH</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Number of Investors</span>
                          <span className="text-white font-semibold">{project.investors.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Funding Deadline</span>
                          <span className="text-white font-semibold">
                            {new Date(project.fundingDeadline * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Days Remaining</span>
                          <span className="text-white font-semibold">
                            {Math.max(
                              0,
                              Math.ceil((project.fundingDeadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)),
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
