"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rocket,
  Vote,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Users,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Wallet,
  Calendar,
  Award,
  Star,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useInfinifundContract } from "@/hooks/use-infinifund-contract"
import { infinifundContract, type ProjectView } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import Link from "next/link"
import { useAccount } from "wagmi"

type ProjectCategory = "all" | "prelisting" | "approved"
type SortOption = "funding" | "votes" | "recent" | "progress"

interface ProjectCardProps {
  project: ProjectView
  category: "prelisting" | "approved"
  isConnected: boolean
  isCitizen: boolean
  onVote: (projectId: number, approve: boolean) => void
  onFund: (projectId: number, amount: string) => void
  userVotes?: { [key: number]: boolean | null }
}

export default function ProjectsPage() {
  const { address, isConnected } = useAccount()
  const { 
    getAllProjects, 
    voteForScreening, 
    fundProject, 
    isCitizen, 
    getScreeningVotes,
    loading: contractLoading 
  } = useInfinifundContract()

  const [projects, setProjects] = useState<ProjectView[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectView[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<ProjectCategory>("all")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [searchQuery, setSearchQuery] = useState("")
  const [userCitizen, setUserCitizen] = useState(false)
  const [userVotes, setUserVotes] = useState<{ [key: number]: boolean | null }>({})
  const [projectVotes, setProjectVotes] = useState<{ [key: number]: { votesFor: number, votesAgainst: number } }>({})
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [address, isConnected])

  useEffect(() => {
    filterAndSortProjects()
  }, [projects, category, sortBy, searchQuery])

  const loadData = async () => {
    if (!isConnected || !address) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Load projects and user citizenship status
      const [allProjects, citizenStatus] = await Promise.all([
        getAllProjects(),
        isCitizen(address)
      ])
      
      setProjects(allProjects)
      setUserCitizen(citizenStatus)
      
      // Load voting data for each project
      await loadVotingData(allProjects)
      
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const loadVotingData = async (projectList: ProjectView[]) => {
    try {
      const votesData: { [key: number]: { votesFor: number, votesAgainst: number } } = {}
      
      for (const project of projectList) {
        try {
          const votes = await getScreeningVotes(project.project_id)
          votesData[project.project_id] = votes
        } catch (error) {
          console.error(`Error loading votes for project ${project.project_id}:`, error)
          votesData[project.project_id] = { votesFor: 0, votesAgainst: 0 }
        }
      }
      
      setProjectVotes(votesData)
    } catch (error) {
      console.error("Error loading voting data:", error)
    }
  }

  const filterAndSortProjects = () => {
    let filtered = [...projects]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((project) => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    switch (category) {
      case "prelisting":
        filtered = filtered.filter((p) => !p.approvedForFunding && !p.fundingExpired)
        break
      case "approved":
        filtered = filtered.filter((p) => p.approvedForFunding && !p.fundingExpired)
        break
      case "all":
      default:
        filtered = filtered.filter((p) => !p.fundingExpired)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case "funding":
        filtered.sort((a, b) => Number(b.totalFunds) - Number(a.totalFunds))
        break
      case "votes":
        filtered.sort((a, b) => {
          const aVotes = projectVotes[a.project_id]?.votesFor || 0
          const bVotes = projectVotes[b.project_id]?.votesFor || 0
          return bVotes - aVotes
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

  const handleVote = async (projectId: number, approve: boolean) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to vote")
      return
    }

    if (!userCitizen) {
      toast.error("Only citizens can vote on projects")
      return
    }

    try {
      toast.info("Submitting vote...")
      await voteForScreening(projectId, approve)
      
      // Update local voting state
      setUserVotes(prev => ({ ...prev, [projectId]: approve }))
      
      // Refresh voting data
      setTimeout(() => {
        loadVotingData([projects.find(p => p.project_id === projectId)!])
      }, 2000)
      
      toast.success(`Vote ${approve ? "for" : "against"} submitted successfully!`)
    } catch (error: any) {
      console.error("Error voting:", error)
      toast.error("Failed to vote: " + (error?.message || "Unknown error"))
    }
  }

  const handleFund = async (projectId: number, amount: string) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to fund")
      return
    }

    if (!userCitizen) {
      toast.error("Only citizens can fund projects")
      return
    }

    try {
      toast.info("Processing investment...")
      await fundProject(projectId, amount)
      
      // Refresh projects data
      setTimeout(() => {
        loadData()
      }, 3000)
      
      toast.success("Investment successful!")
    } catch (error: any) {
      console.error("Error funding:", error)
      toast.error("Failed to fund project: " + (error?.message || "Unknown error"))
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const prelistingProjects = filteredProjects.filter(p => !p.approvedForFunding)
  const approvedProjects = filteredProjects.filter(p => p.approvedForFunding)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white pt-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="bg-black/50 border-white/20 max-w-md w-full">
              <CardContent className="p-8 text-center">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-white/60" />
                <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                <p className="text-white/60 mb-4">
                  Connect your wallet to view and interact with projects
                </p>
                <Button className="bg-white/80 text-black hover:bg-white">
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Project Hub</h1>
              <p className="text-white/60 text-lg">
                Discover and support breakthrough research projects
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-black border-white/10">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/50 border-white/20 text-white"
                  />
                </div>

                {/* Category Filter */}
                <Select value={category} onValueChange={(value: ProjectCategory) => setCategory(value)}>
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="all" className="text-white">All Projects</SelectItem>
                    <SelectItem value="prelisting" className="text-white">Pre-listing (Vote)</SelectItem>
                    <SelectItem value="approved" className="text-white">Approved (Invest)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="recent" className="text-white">Most Recent</SelectItem>
                    <SelectItem value="funding" className="text-white">Most Funded</SelectItem>
                    <SelectItem value="votes" className="text-white">Most Votes</SelectItem>
                    <SelectItem value="progress" className="text-white">Progress</SelectItem>
                  </SelectContent>
                </Select>

                {/* Create Project */}
                <Link href="/create-project">
                  <Button className="w-full bg-white/80 text-black hover:bg-white">
                    <Rocket className="w-4 h-4 mr-2" />
                    Submit Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white/60">Loading projects...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Project Categories */}
            {category === "all" && (
              <>
                {/* Pre-listing Section */}
                {prelistingProjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-12"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Vote className="w-6 h-6" />
                      <h2 className="text-2xl font-bold">Pre-listing Projects</h2>
                      <Badge className="bg-white/10 text-white border-white/20">
                        Vote Required
                      </Badge>
                      <span className="text-white/60">({prelistingProjects.length})</span>
                    </div>
                    <p className="text-white/60 mb-6">
                      These projects are awaiting community approval. Citizens can vote to approve projects for funding.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {prelistingProjects.map((project) => (
                        <ProjectCard
                          key={project.project_id}
                          project={project}
                          category="prelisting"
                          isConnected={isConnected}
                          isCitizen={userCitizen}
                          onVote={handleVote}
                          onFund={handleFund}
                          userVotes={userVotes}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Approved Section */}
                {approvedProjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mb-12"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <DollarSign className="w-6 h-6" />
                      <h2 className="text-2xl font-bold">Approved for Funding</h2>
                      <Badge className="bg-white/10 text-white border-white/20">
                        Ready to Invest
                      </Badge>
                      <span className="text-white/60">({approvedProjects.length})</span>
                    </div>
                    <p className="text-white/60 mb-6">
                      These projects have been approved by the community and are ready for investment.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {approvedProjects.map((project) => (
                        <ProjectCard
                          key={project.project_id}
                          project={project}
                          category="approved"
                          isConnected={isConnected}
                          isCitizen={userCitizen}
                          onVote={handleVote}
                          onFund={handleFund}
                          userVotes={userVotes}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Single Category View */}
            {category !== "all" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  {category === "prelisting" ? <Vote className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
                  <h2 className="text-2xl font-bold">
                    {category === "prelisting" ? "Pre-listing Projects" : "Approved for Funding"}
                  </h2>
                  <span className="text-white/60">({filteredProjects.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.project_id}
                      project={project}
                      category={category as "prelisting" | "approved"}
                      isConnected={isConnected}
                      isCitizen={userCitizen}
                      onVote={handleVote}
                      onFund={handleFund}
                      userVotes={userVotes}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <Rocket className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
                <p className="text-white/60 mb-6">
                  {searchQuery 
                    ? "No projects match your search criteria." 
                    : "Be the first to submit a project!"
                  }
                </p>
                <Link href="/create-project">
                  <Button className="bg-white/80 text-black hover:bg-white">
                    Submit First Project
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Project Card Component
function ProjectCard({ 
  project, 
  category, 
  isConnected, 
  isCitizen, 
  onVote, 
  onFund, 
  userVotes 
}: ProjectCardProps) {
  const [fundAmount, setFundAmount] = useState("")
  const [showFundDialog, setShowFundDialog] = useState(false)
  
  const progress = project.milestoneCount > 0 ? (project.currentMilestone / project.milestoneCount) * 100 : 0
  const fundingAmount = Number(project.totalFunds) / 1e18
  const hasVoted = userVotes?.[project.project_id] !== undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="bg-black/50 border-white/20 hover:border-white/30 transition-all duration-300 h-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-3">
            <Badge className="bg-white/10 text-white border-white/20">
              {category === "prelisting" ? "Pre-listing" : "Approved"}
            </Badge>
            <div className="text-right">
              <div className="text-xs text-white/60">ID</div>
              <div className="text-sm font-mono">{project.project_id}</div>
            </div>
          </div>
          
          <CardTitle className="text-white group-hover:text-white/90 transition-colors line-clamp-2">
            {project.name}
          </CardTitle>
          
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Users className="w-4 h-4" />
            <span>{project.creator.slice(0, 6)}...{project.creator.slice(-4)}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Progress</span>
              <span className="text-white">{project.currentMilestone}/{project.milestoneCount} milestones</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Funding Info */}
          {category === "approved" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Total Funded</span>
                <span className="text-white font-semibold">{fundingAmount.toFixed(4)} FLOW</span>
              </div>
              <div className="text-xs text-white/40">
                Estimated {Math.max(1, Math.floor(fundingAmount / 0.1))} investors
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            
            {/* View Details */}
            <Link href={`/projects/${project.project_id}`} className="flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-white/20 text-white hover:bg-white/5"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Link>

            {/* Category-specific actions */}
            {category === "prelisting" && isCitizen && (
              <div className="flex gap-1 flex-1">
                <Button
                  size="sm"
                  onClick={() => onVote(project.project_id, true)}
                  disabled={hasVoted}
                  className="flex-1 bg-white/80 hover:bg-white text-black disabled:opacity-50 disabled:bg-white/20 disabled:text-white/60"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  For
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onVote(project.project_id, false)}
                  disabled={hasVoted}
                  className="flex-1 border-white/20 text-white hover:bg-white/5 disabled:opacity-50"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Against
                </Button>
              </div>
            )}

            {category === "approved" && isCitizen && (
              <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-white/80 hover:bg-white text-black"
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Invest
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-white/20">
                  <DialogHeader>
                    <DialogTitle className="text-white">Invest in {project.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-white/60 block mb-2">Investment Amount (FLOW)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="bg-black/50 border-white/20 text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowFundDialog(false)}
                        className="flex-1 border-white/20 text-white hover:bg-white/5"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (fundAmount && Number(fundAmount) > 0) {
                            onFund(project.project_id, fundAmount)
                            setShowFundDialog(false)
                            setFundAmount("")
                          }
                        }}
                        disabled={!fundAmount || Number(fundAmount) <= 0}
                        className="flex-1 bg-white/80 hover:bg-white text-black"
                      >
                        Invest {fundAmount} FLOW
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Voting Status */}
          {category === "prelisting" && (
            <div className="text-xs text-white/60 text-center pt-2 border-t border-white/10">
              {hasVoted ? (
                <span className="text-white">
                  ✓ You voted {userVotes?.[project.project_id] ? "for" : "against"} this project
                </span>
              ) : isCitizen ? (
                "Vote to help approve this project for funding"
              ) : (
                "Only citizens can vote on projects"
              )}
            </div>
          )}

          {category === "approved" && (
            <div className="text-xs text-white/60 text-center pt-2 border-t border-white/10">
              {isCitizen ? (
                "This project is approved for investment"
              ) : (
                "Only citizens can invest in projects"
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
