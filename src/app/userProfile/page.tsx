"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { 
  User, 
  Crown, 
  Wallet, 
  FolderOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useInfinifundContract } from "@/hooks/use-infinifund-contract"

interface UserProject {
  project_id: number
  name: string
  creator: string
  approvedForFunding: boolean
  totalFunds: string
  currentMilestone: number
  milestoneCount: number
  fundingExpired: boolean
}

interface UserInvestment {
  projectId: number
  projectTitle: string
  amount: bigint
  timestamp: number
  status: 'Active' | 'Completed' | 'Cancelled'
}

export default function UserProfile() {
  const { address, isConnected } = useAccount()
  const { 
    getUserProjects, 
    getUserInvestments, 
    isCitizen, 
    isAdmin, 
    getCitizenshipApplication,
    applyCitizenship,
    getUserApplications,
    loading: isLoading
  } = useInfinifundContract()

  const [userProjects, setUserProjects] = useState<UserProject[]>([])
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([])
  const [citizenshipStatus, setCitizenshipStatus] = useState<'citizen' | 'non-citizen' | 'pending' | 'expired'>('non-citizen')
  const [adminStatus, setAdminStatus] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Load citizenship and admin status
        const [citizenStatus, adminStatus] = await Promise.all([
          isCitizen(address),
          isAdmin(address)
        ])
        
        setCitizenshipStatus(citizenStatus ? 'citizen' : 'non-citizen')
        setAdminStatus(adminStatus)

        // Load citizenship application if not a citizen
        if (!citizenStatus) {
          try {
            const application = await getCitizenshipApplication(address)
            if (application && application.applicant !== '0x0000000000000000000000000000000000000000') {
              setApplicationStatus(application)
              setCitizenshipStatus('pending')
            }
          } catch (error) {
            console.log('No citizenship application found')
          }
        }

        // Load user projects and investments
        const [projects, investments] = await Promise.all([
          getUserProjects(address),
          getUserInvestments(address)
        ])

        console.log("Loaded projects:", projects)
        console.log("Loaded investments:", investments)

        setUserProjects(projects)
        setUserInvestments(investments)
        
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [address, isConnected])

  const handleApplyCitizenship = async () => {
    if (!address) return
    
    try {
      await applyCitizenship()
      // Refresh application status
      const application = await getCitizenshipApplication(address)
      setApplicationStatus(application)
      setCitizenshipStatus('pending')
    } catch (error) {
      console.error('Error applying for citizenship:', error)
    }
  }

  const getCitizenshipStatusColor = (status: string) => {
    switch (status) {
      case 'citizen': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'expired': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getCitizenshipStatusIcon = (status: string) => {
    switch (status) {
      case 'citizen': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'expired': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white p-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="bg-black border-white/10 max-w-md w-full">
              <CardContent className="p-8 text-center">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-white/60" />
                <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
                <p className="text-white/60 mb-4">
                  Please connect your wallet to view your profile
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-white text-black hover:bg-white/90"
                >
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
    <div className="min-h-screen bg-black text-white p-8 mt-16">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">User Profile</h1>
          <p className="text-white/60">Manage your account, projects, and investments</p>
        </motion.div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Wallet Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-black border-white/10 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="w-5 h-5" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-white/60">Address</p>
                    <p className="font-mono text-sm">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(address || '')}
                      className="border-white/20 text-white hover:bg-white/5"
                    >
                      Copy Address
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://explorer.xrpl.org/accounts/${address}`, '_blank')}
                      className="border-white/20 text-white hover:bg-white/5"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Info */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-black border-white/10 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getCitizenshipStatusColor(citizenshipStatus)} font-normal text-xs`}>
                      {getCitizenshipStatusIcon(citizenshipStatus)}
                      <span className="ml-1 capitalize">{citizenshipStatus}</span>
                    </Badge>
                  </div>
                  
                  {adminStatus && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-normal text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    </div>
                  )}

                  {citizenshipStatus === 'non-citizen' && (
                    <Button
                      onClick={handleApplyCitizenship}
                      disabled={isLoading}
                      className="w-full bg-white text-black hover:bg-white/90 mt-4"
                      size="sm"
                    >
                      Apply for Citizenship
                    </Button>
                  )}

                  {citizenshipStatus === 'pending' && applicationStatus && (
                    <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs text-yellow-400">
                        Application submitted. Awaiting approval.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-black border-white/10 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Projects</span>
                    <span className="font-semibold">{userProjects.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Investments</span>
                    <span className="font-semibold">{userInvestments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Total Invested</span>
                    <span className="font-semibold">
                      {userInvestments.reduce((total, inv) => total + Number(inv.amount) / 1e18, 0).toFixed(2)} FLOW
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Projects and Investments */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* My Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-black border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  My Projects ({userProjects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
                    <p className="text-white/60 mb-4">No projects created yet</p>
                    <Button 
                      onClick={() => window.location.href = '/create-project'}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      Create Your First Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {userProjects.map((project) => (
                      <div key={project.project_id} className="p-4 border border-white/10 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{project.name}</h4>
                          <Badge className={`text-xs ${
                            !project.fundingExpired && project.approvedForFunding
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : project.fundingExpired
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {project.fundingExpired ? 'Expired' : project.approvedForFunding ? 'Active' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="text-sm text-white/60 mb-3">
                          <p>Creator: {project.creator.slice(0, 6)}...{project.creator.slice(-4)}</p>
                          <p>Total Funds: {parseFloat(project.totalFunds) / 1e18} FLOW</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Milestones Progress</span>
                            <span>{project.currentMilestone} / {project.milestoneCount}</span>
                          </div>
                          <Progress 
                            value={(project.currentMilestone / project.milestoneCount) * 100} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-2">
                            {project.approvedForFunding && (
                              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/projects/${project.project_id}`}
                            className="border-white/20 text-white hover:bg-white/5"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* My Investments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-black border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  My Investments ({userInvestments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userInvestments.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-white/20" />
                    <p className="text-white/60 mb-4">No investments made yet</p>
                    <Button 
                      onClick={() => window.location.href = '/projects'}
                      className="bg-white text-black hover:bg-white/90"
                    >
                      Explore Projects
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {userInvestments.map((investment, index) => (
                      <div key={index} className="p-4 border border-white/10 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{investment.projectTitle}</h4>
                          <Badge className={`text-xs ${
                            investment.status === 'Active' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : investment.status === 'Completed'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {investment.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-white/60">Investment Amount</p>
                            <p className="font-semibold">{Number(investment.amount) / 1e18} FLOW</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white/60">Date</p>
                            <p className="text-sm">{new Date(investment.timestamp * 1000).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/projects/${investment.projectId}`}
                          className="w-full mt-3 border-white/20 text-white hover:bg-white/5"
                        >
                          View Project
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-black border border-white/20 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Loading profile data...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

