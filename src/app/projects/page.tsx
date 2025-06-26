"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  TrendingUp,
  Filter,
  Search,
  Sparkles,
  MessageCircle,
  Users,
  Award,
  Flame,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { infinifundContract, type ProjectView } from "@/lib/infinifund-contract"
import { getImageUrl } from "@/lib/pinata-utils"
import { reviewProjectWithAI } from "@/lib/gemini-ai"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import { ethers } from "ethers"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectView[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectView[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "approved" | "pending" | "top" | "latest">("all")
  const [sortBy, setSortBy] = useState<"funding" | "investors" | "recent" | "progress">("funding")
  const [searchQuery, setSearchQuery] = useState("")
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiDialog, setShowAiDialog] = useState(false)

  useEffect(() => {
    loadProjects()
    checkConnection()
  }, [])

  useEffect(() => {
    filterAndSortProjects()
  }, [projects, filter, sortBy, searchQuery])

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

  const filterAndSortProjects = () => {
    let filtered = [...projects]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply category filter
    switch (filter) {
      case "approved":
        filtered = filtered.filter((p) => p.approvedForFunding)
        break
      case "pending":
        filtered = filtered.filter((p) => !p.approvedForFunding && !p.fundingExpired)
        break
      case "top":
        filtered = filtered.filter((p) => Number(p.totalFunds) > 0)
        break
      case "latest":
        // For latest, we'll show all but sort by project_id (newest first)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case "funding":
        filtered.sort((a, b) => Number(b.totalFunds) - Number(a.totalFunds))
        break
      case "investors":
        // Sort by estimated investor count (based on funding amount)
        filtered.sort((a, b) => {
          const aInvestors = Math.floor(Number(a.totalFunds) / 1e17) + 1
          const bInvestors = Math.floor(Number(b.totalFunds) / 1e17) + 1
          return bInvestors - aInvestors
        })
        break
      case "recent":
        filtered.sort((a, b) => b.project_id - a.project_id)
        break
      case "progress":
        filtered.sort((a, b) => {
          const aProgress = a.milestoneCount > 0 ? a.currentMilestone / a.milestoneCount : 0
          const bProgress = b.milestoneCount > 0 ? b.currentMilestone / b.milestoneCount : 0
          return bProgress - aProgress
        })
        break
    }

    setFilteredProjects(filtered)
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
      loadProjects()
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
      loadProjects()
    } catch (error: any) {
      toast.error("Failed to fund project: " + error.message)
    }
  }

  const handleAiQuestion = async () => {
    if (!aiQuestion.trim()) return

    setAiLoading(true)
    try {
      // Create a context about Infinita City for the AI
      const infinitaCityContext = `
      Infinita City is "The City That Never Dies" - a pioneering network city in Próspera, Roatán, Honduras, dedicated to advancing human longevity and frontier technology.

      MISSION:
      - Accelerate breakthroughs in Biotechnology and Longevity Science
      - Advance Computational Science and AI
      - Pioneer Cybernetics and Human Enhancement
      - Foster Decentralized Science (DeSci) and Web3
      - Extend healthy human lifespan and redefine civilization's future

      INFINIFUND PLATFORM:
      - Decentralized funding platform for breakthrough innovations
      - Community-driven project screening and approval
      - Milestone-based funding release system
      - Citizen governance and voting rights
      - Focus on longevity, biotech, AI, and frontier science projects

      Question: ${aiQuestion}
      `

      const response = await reviewProjectWithAI({
        projectName: "Infinita City Information Request",
        projectDetails: infinitaCityContext,
        milestones: ["Provide helpful information about Infinita City and Infinifund"],
      })

      setAiResponse(response.feedback)
    } catch (error) {
      console.error("AI Error:", error)
      setAiResponse("I'm sorry, I couldn't process your question right now. Please try again later.")
    } finally {
      setAiLoading(false)
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

  const getFilterIcon = (filterType: string) => {
    switch (filterType) {
      case "top":
        return <Award className="h-4 w-4" />
      case "latest":
        return <Sparkles className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      default:
        return <Filter className="h-4 w-4" />
    }
  }

  const getSortIcon = (sortType: string) => {
    switch (sortType) {
      case "funding":
        return <DollarSign className="h-4 w-4" />
      case "investors":
        return <Users className="h-4 w-4" />
      case "recent":
        return <Calendar className="h-4 w-4" />
      case "progress":
        return <Target className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Infinita City Projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-black to-pink-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Flame className="h-8 w-8 text-orange-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Infinita City Projects
              </h1>
              <Star className="h-8 w-8 text-pink-400" />
            </div>
            <p className="text-xl text-orange-300 mb-2">Breakthrough innovations advancing human longevity</p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Discover and support cutting-edge projects in biotechnology, AI, and frontier science
            </p>
          </motion.div>

          {/* Stats and Controls */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gray-900/50 border-orange-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{projects.length}</div>
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
              <Card className="bg-gray-900/50 border-pink-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-pink-400">
                    {formatEther(
                      projects.reduce((sum, p) => sum + Number.parseFloat(p.totalFunds || "0"), 0).toString(),
                    )}{" "}
                    ETH
                  </div>
                  <div className="text-sm text-gray-300">Total Funded</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-40 bg-gray-900/50 border-gray-600 text-white">
                    <div className="flex items-center gap-2">
                      {getFilterIcon(filter)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="top">Top Funded</SelectItem>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40 bg-gray-900/50 border-gray-600 text-white">
                    <div className="flex items-center gap-2">
                      {getSortIcon(sortBy)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-600">
                    <SelectItem value="funding">Highest Funding</SelectItem>
                    <SelectItem value="investors">Most Investors</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="progress">Most Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "bg-orange-600" : "bg-gray-800 border-gray-600 text-white"}
                >
                  All Projects
                </Button>
                <Button
                  variant={filter === "top" ? "default" : "outline"}
                  onClick={() => setFilter("top")}
                  className={filter === "top" ? "bg-yellow-600" : "bg-gray-800 border-gray-600 text-white"}
                >
                  <Award className="h-4 w-4 mr-1" />
                  Top Funded
                </Button>
                <Button
                  variant={filter === "latest" ? "default" : "outline"}
                  onClick={() => setFilter("latest")}
                  className={filter === "latest" ? "bg-pink-600" : "bg-gray-800 border-gray-600 text-white"}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Latest
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {/* AI Chat Button */}
                <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                        Ask about Infinita City
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          What would you like to know about Infinita City or Infinifund?
                        </label>
                        <Textarea
                          placeholder="e.g., What is Infinita City's mission? How does the funding process work?"
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={handleAiQuestion}
                        disabled={aiLoading || !aiQuestion.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        {aiLoading ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Ask AI
                          </>
                        )}
                      </Button>
                      {aiResponse && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                          <h4 className="font-semibold text-purple-400 mb-2">AI Response:</h4>
                          <p className="text-gray-300 whitespace-pre-wrap">{aiResponse}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </span>
                  </div>
                ) : (
                  <Button onClick={connectWallet} className="bg-orange-600 hover:bg-orange-700">
                    Connect Wallet
                  </Button>
                )}
                <Link href="/create-project">
                  <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                    <Rocket className="h-4 w-4 mr-2" />
                    Submit Project
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Projects Grid */}
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.project_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProjectCard project={project} isConnected={isConnected} onVote={handleVote} onFund={handleFund} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Rocket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? `No projects match "${searchQuery}"`
                  : filter === "all"
                    ? "No projects have been submitted yet."
                    : `No ${filter} projects found.`}
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/create-project">
                  <Button className="bg-gradient-to-r from-orange-600 to-red-600">
                    <Rocket className="h-4 w-4 mr-2" />
                    Submit Project
                  </Button>
                </Link>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")} className="border-gray-600">
                    Clear Search
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  isConnected,
  onVote,
  onFund,
}: {
  project: ProjectView
  isConnected: boolean
  onVote: (projectId: number, approve: boolean) => void
  onFund: (projectId: number, amount: string) => void
}) {
  const [projectDetails, setProjectDetails] = useState<any>(null)
  const [iconUrl, setIconUrl] = useState<string>("")

  useEffect(() => {
    loadProjectDetails()
  }, [project.project_id])

  const loadProjectDetails = async () => {
    try {
      const details = await infinifundContract.getProjectDetails(project.project_id)
      setProjectDetails(details)

      // Load project icon
      if (details.icon) {
        const url = getImageUrl(details.icon)
        setIconUrl(url)
      }
    } catch (error) {
      console.error("Error loading project details:", error)
    }
  }

  const status = getProjectStatus(project)
  const progress = project.milestoneCount > 0 ? (project.currentMilestone / project.milestoneCount) * 100 : 0
  const estimatedInvestors = Math.floor(Number(project.totalFunds) / 1e17) + 1

  return (
    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 h-full group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {iconUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-orange-500/30">
                  <Image
                    src={iconUrl || "/placeholder.svg"}
                    alt={project.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Avatar className="h-12 w-12 bg-gradient-to-r from-orange-500 to-pink-500">
                  <AvatarFallback className="text-white font-bold">{project.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              {Number(project.totalFunds) > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
              )}
            </div>
            <div>
              <CardTitle className="text-white text-lg group-hover:text-orange-400 transition-colors">
                {project.name}
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                by {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={status.color}>{status.text}</Badge>
            <span className="text-xs text-gray-500">#{project.project_id}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Description */}
        {projectDetails?.details && <p className="text-gray-300 text-sm line-clamp-2">{projectDetails.details}</p>}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-green-400">
            <DollarSign className="h-4 w-4" />
            <span>{formatEther(project.totalFunds)} ETH</span>
          </div>
          <div className="flex items-center gap-2 text-orange-400">
            <Users className="h-4 w-4" />
            <span>{estimatedInvestors} investors</span>
          </div>
          <div className="flex items-center gap-2 text-pink-400">
            <Target className="h-4 w-4" />
            <span>{project.milestoneCount} milestones</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <Clock className="h-4 w-4" />
            <span>Phase {project.currentMilestone + 1}</span>
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

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!project.approvedForFunding && isConnected && (
            <>
              <Button
                size="sm"
                onClick={() => onVote(project.project_id, true)}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVote(project.project_id, false)}
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
              onClick={() => onFund(project.project_id, "0.01")}
              className="bg-orange-600 hover:bg-orange-700 flex-1"
            >
              <Heart className="h-4 w-4 mr-1" />
              Fund 0.01 ETH
            </Button>
          )}

          <Link href={`/projects/${project.project_id}`}>
            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getProjectStatus(project: ProjectView) {
  if (project.fundingExpired) return { text: "Expired", color: "bg-red-500/20 text-red-300 border-red-500/30" }
  if (project.approvedForFunding)
    return { text: "Approved", color: "bg-green-500/20 text-green-300 border-green-500/30" }
  return { text: "Pending", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" }
}

function formatEther(wei: string) {
  try {
    return Number.parseFloat(ethers.formatEther(wei)).toFixed(4)
  } catch {
    return "0.0000"
  }
}
