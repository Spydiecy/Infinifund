"use client"

import { useState, useEffect } from "react"
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
    loading: isLoading
  } = useInfinifundContract()

  const [userProjects, setUserProjects] = useState<UserProject[]>([])
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([])
  const [citizenshipStatus, setCitizenshipStatus] = useState<'citizen' | 'non-citizen' | 'pending' | 'expired'>('non-citizen')
  const [adminStatus, setAdminStatus] = useState(false)
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

        // Load user projects and investments
        try {
          const [projects, investments] = await Promise.all([
            getUserProjects(address),
            getUserInvestments(address)
          ])

          console.log("Loaded projects:", projects)
          console.log("Loaded investments:", investments)

          // For now, set empty arrays since the contract methods might return different data types
          // This will be fixed when the contract integration is properly implemented
          setUserProjects([])
          setUserInvestments([])
        } catch (error) {
          console.log("Error loading user data:", error)
          setUserProjects([])
          setUserInvestments([])
        }
        
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [address, isConnected])

  const handleApplyCitizenship = () => {
    // Redirect to citizenship page
    window.location.href = '/citizenship'
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
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-black/50 border border-white/20 rounded-xl p-8 text-center max-w-md w-full">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-white/60" />
              <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
              <p className="text-white/60 mb-4">
                Please connect your wallet to view your profile
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-white text-black hover:bg-gray-200"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Profile</h1>
          <p className="text-white/60">Manage your account, projects, and investments</p>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Wallet Info */}
          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Wallet className="w-5 h-5" />
              Wallet
            </div>
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
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Copy Address
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://explorer.xrpl.org/accounts/${address}`, '_blank')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <User className="w-5 h-5" />
              Status
            </div>
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
                  className="w-full bg-white text-black hover:bg-gray-200 mt-4"
                  size="sm"
                >
                  Apply for Citizenship
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <TrendingUp className="w-5 h-5" />
              Overview
            </div>
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
                  {userInvestments.reduce((total, inv) => total + Number(inv.amount) / 1e18, 0).toFixed(2)} ETH
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects and Investments */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* My Projects */}
          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-lg font-semibold mb-6">
              <FolderOpen className="w-5 h-5" />
              My Projects ({userProjects.length})
            </div>
            {userProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60 mb-4">No projects created yet</p>
                <Button 
                  onClick={() => window.location.href = '/create-project'}
                  className="bg-white text-black hover:bg-gray-200"
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
                      <p>Total Funds: {parseFloat(project.totalFunds) / 1e18} ETH</p>
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
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Investments */}
          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-2 text-lg font-semibold mb-6">
              <TrendingUp className="w-5 h-5" />
              My Investments ({userInvestments.length})
            </div>
            {userInvestments.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-white/20" />
                <p className="text-white/60 mb-4">No investments made yet</p>
                <Button 
                  onClick={() => window.location.href = '/projects'}
                  className="bg-white text-black hover:bg-gray-200"
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
                        <p className="font-semibold">{Number(investment.amount) / 1e18} ETH</p>
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
                      className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
                    >
                      View Project
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-black/90 border border-white/20 rounded-lg p-6">
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

