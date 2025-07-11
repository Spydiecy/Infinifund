"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"
import { useAccount } from "wagmi"
import {
  ArrowLeft,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Vote,
  Calendar,
  User,
  Wallet,
  AlertTriangle,
  Zap,
  Award,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { infinifundContract, type ProjectView, type ProjectDetails } from "@/lib/infinifund-contract"
import { getImageUrl,fetchImageUrl } from "@/lib/pinata-utils"
import { toast } from "sonner"
import { ethers } from "ethers"
import Link from "next/link"
import Image from "next/image"

export default function ProjectDetailPage() {
  const params = useParams()
  const { address, isConnected } = useAccount()
  const projectId = Number(params.id)

  const [project, setProject] = useState<ProjectView | null>(null)
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCitizen, setIsCitizen] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [screeningVotes, setScreeningVotes] = useState({ votesFor: 0, votesAgainst: 0 })
  const [fundingAmount, setFundingAmount] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [isFunding, setIsFunding] = useState(false)
  const [iconUrl, setIconUrl] = useState<string>("")
  const [bannerUrl, setBannerUrl] = useState<string>("")

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId, address])

  const loadProjectData = async () => {
    try {
      setLoading(true)

      // Get basic project data
      const projectData = await infinifundContract.getProjectById(projectId)
      setProject(projectData)

      // Get detailed project data
      const detailsData = await infinifundContract.getProjectDetails(projectId)
      setProjectDetails(detailsData)
      
      // Load project images
      if (detailsData?.icon) {
        const iconImageUrl = await fetchImageUrl(detailsData.icon)
        setIconUrl(iconImageUrl)
      }

      if (detailsData?.banner) {
        const bannerImageUrl = await fetchImageUrl(detailsData.banner)
        setBannerUrl(bannerImageUrl)
      }
      
      // Set milestones from project details
      if (detailsData?.milestones) {
        setMilestones(detailsData.milestones)
      }

      if (address && isConnected) {
        const [citizenStatus, votedStatus, votes] = await Promise.all([
          infinifundContract.isCitizen(address),
          infinifundContract.hasVotedScreening(projectId, address),
          infinifundContract.getScreeningVotes(projectId),
        ])

        setIsCitizen(citizenStatus)
        setHasVoted(votedStatus)
        setScreeningVotes(votes)
      } else {
        // Get votes even without wallet connection
        const votes = await infinifundContract.getScreeningVotes(projectId)
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
      await infinifundContract.voteScreening(projectId, approve)
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
      await infinifundContract.fundProject(projectId, fundingAmount)
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

  const getDaysRemaining = () => {
    if (!projectDetails) return 0
    return Math.max(0, Math.ceil((projectDetails.fundingDeadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Project...</p>
        </div>
      </div>
    )
  }

  if (!project || !projectDetails) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-black/50 border-white/20 p-8 text-center max-w-md w-full">
          <XCircle className="h-16 w-16 text-white/60 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-white/60 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Link href="/projects">
            <Button className="bg-white/80 text-black hover:bg-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const status = getProjectStatus()
  const progress = project.milestoneCount > 0 ? (project.currentMilestone / project.milestoneCount) * 100 : 0
  const daysRemaining = getDaysRemaining()

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/projects">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/5">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              <Badge className={status.color}>{status.text}</Badge>
              <Badge variant="outline" className="border-white/20 text-white/80">
                Project #{project.project_id}
              </Badge>
            </div>

            {/* Banner Image */}
            {bannerUrl && (
              <div className="w-full h-64 rounded-lg overflow-hidden mb-6 border border-white/10">
                <Image
                  src={bannerUrl || "/placeholder.svg"}
                  alt={`${project.name} banner`}
                  width={1200}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Project Header */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {iconUrl ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-black/50 border-4 border-white/20">
                    <Image
                      src={iconUrl || "/placeholder.svg"}
                      alt={project.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-3xl font-bold text-white">
                    {project.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{project.name}</h1>
                <div className="flex items-center gap-4 text-white/60 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{daysRemaining} days remaining</span>
                  </div>
                </div>
                <p className="text-white/80 text-lg leading-relaxed">{projectDetails.details}</p>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="text-3xl font-bold text-white mb-1">{formatEther(project.totalFunds)} ETH</div>
                <div className="text-sm text-white/60">Total Funded</div>
                <div className="text-xs text-white/40 mt-2">
                  ~{Math.max(1, Math.floor(Number(formatEther(project.totalFunds)) / 0.1))} investors
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-white/10">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">Overview</TabsTrigger>
                  <TabsTrigger value="milestones" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">Milestones</TabsTrigger>
                  <TabsTrigger value="voting" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">Voting</TabsTrigger>
                  <TabsTrigger value="funding" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">Funding</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-black/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-white" />
                          <div>
                            <div className="text-sm text-white/60">Milestones</div>
                            <div className="text-lg font-semibold text-white">{project.milestoneCount}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-white" />
                          <div>
                            <div className="text-sm text-white/60">Current Phase</div>
                            <div className="text-lg font-semibold text-white">{project.currentMilestone + 1}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Progress</span>
                          <span className="text-white">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`bg-black/50 border-white/10 ${
                          milestone.completed
                            ? "border-green-500/30"
                            : index === project.currentMilestone
                              ? "border-white/30"
                              : ""
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {milestone.completed ? (
                                <CheckCircle className="h-8 w-8 text-green-500" />
                              ) : index === project.currentMilestone ? (
                                <Clock className="h-8 w-8 text-white animate-pulse" />
                              ) : (
                                <div className="h-8 w-8 rounded-full border-2 border-white/30 flex items-center justify-center text-white/60 text-sm font-bold">
                                  {index + 1}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-2">
                                Milestone {index + 1}
                                {milestone.completed && (
                                  <Badge className="ml-2 bg-green-500/10 text-green-400 border border-green-500/30">Completed</Badge>
                                )}
                                {index === project.currentMilestone && !milestone.completed && (
                                  <Badge className="ml-2 bg-white/10 text-white border border-white/30">Current</Badge>
                                )}
                              </h3>
                              <p className="text-white/80 mb-4">{milestone.description}</p>

                              {milestone.reportSubmitted && (
                                <div className="bg-black/30 p-4 rounded-lg mb-4 border border-white/10">
                                  <h4 className="text-sm font-semibold text-white mb-2">Report Submitted</h4>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-green-400">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>{milestone.votesFor} Approve</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-400">
                                      <XCircle className="h-4 w-4" />
                                      <span>{milestone.votesAgainst} Reject</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {milestone.completed && (
                                <div className="text-sm text-green-400">
                                  ✅ Funds Released: {formatEther(milestone.fundsReleased.toString())} ETH
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="voting" className="space-y-6">
                  <Card className="bg-black/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Vote className="h-5 w-5" />
                        Project Screening
                      </CardTitle>
                      <CardDescription className="text-white/60">Citizens vote to approve or reject projects for funding</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Voting Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-500/10 p-4 rounded border border-green-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="text-green-400 font-semibold">Approve</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{screeningVotes.votesFor}</div>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded border border-red-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-5 w-5 text-red-400" />
                            <span className="text-red-400 font-semibold">Reject</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{screeningVotes.votesAgainst}</div>
                        </div>
                      </div>

                      {/* Voting Actions */}
                      {!isConnected ? (
                        <Alert className="border-white/20 bg-black/30">
                          <Wallet className="h-4 w-4" />
                          <AlertDescription className="text-white">Connect your wallet to participate in voting</AlertDescription>
                        </Alert>
                      ) : !isCitizen ? (
                        <Alert className="border-yellow-500/30 bg-yellow-500/10">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-yellow-200">
                            Only citizens can vote on project screening. Apply for citizenship first.
                          </AlertDescription>
                        </Alert>
                      ) : hasVoted ? (
                        <Alert className="border-green-500/30 bg-green-500/10">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-green-200">You have already voted on this project.</AlertDescription>
                        </Alert>
                      ) : project.approvedForFunding ? (
                        <Alert className="border-green-500/30 bg-green-500/10">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-green-200">This project has already been approved for funding.</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="flex gap-4">
                          <Button
                            onClick={() => handleVote(true)}
                            disabled={isVoting}
                            className="bg-white/80 text-black hover:bg-white flex-1"
                          >
                            {isVoting ? (
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve Project
                          </Button>
                          <Button
                            onClick={() => handleVote(false)}
                            disabled={isVoting}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/5 flex-1"
                          >
                            {isVoting ? (
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject Project
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="funding" className="space-y-6">
                  <Card className="bg-black/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Fund This Project
                      </CardTitle>
                      <CardDescription className="text-white/60">Support innovation with your investment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!project.approvedForFunding ? (
                        <Alert className="border-yellow-500/30 bg-yellow-500/10">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-yellow-200">
                            This project must be approved by citizens before it can receive funding.
                          </AlertDescription>
                        </Alert>
                      ) : project.fundingExpired ? (
                        <Alert className="border-red-500/30 bg-red-500/10">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription className="text-red-200">The funding period for this project has expired.</AlertDescription>
                        </Alert>
                      ) : !isConnected ? (
                        <Alert className="border-white/20 bg-black/30">
                          <Wallet className="h-4 w-4" />
                          <AlertDescription className="text-white">Connect your wallet to fund this project</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="funding-amount" className="text-white">
                              Funding Amount (ETH)
                            </Label>
                            <Input
                              id="funding-amount"
                              type="number"
                              step="0.001"
                              min="0"
                              placeholder="0.01"
                              value={fundingAmount}
                              onChange={(e) => setFundingAmount(e.target.value)}
                              className="bg-black/50 border-white/20 text-white mt-2 focus:border-white/40"
                            />
                          </div>
                          <Button
                            onClick={handleFunding}
                            disabled={isFunding || !fundingAmount}
                            className="w-full bg-white/80 text-black hover:bg-white"
                          >
                            {isFunding ? (
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 mr-2" />
                            )}
                            Fund Project
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Project Stats */}
              <Card className="bg-black/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Project Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Total Funding</span>
                    <span className="text-white font-semibold">{formatEther(project.totalFunds)} ETH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Milestones</span>
                    <span className="text-white">
                      {project.currentMilestone} / {project.milestoneCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Progress</span>
                    <span className="text-white">{Math.round(progress)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Days Left</span>
                    <span className="text-white">{daysRemaining} days</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
