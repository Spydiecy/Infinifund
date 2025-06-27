import { ethers } from 'ethers'
import contractABI from './abi.json'
import { toast } from 'sonner'

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"

// Type definitions based on the smart contract
export interface ProjectView {
  project_id: number
  name: string
  creator: string
  approvedForFunding: boolean
  totalFunds: string
  currentMilestone: number
  milestoneCount: number
  fundingExpired: boolean
}

export interface ProjectDetails {
  project_id: number
  name: string
  icon: string
  banner: string
  details: string
  creator: string
  approvedForFunding: boolean
  exists: boolean
  totalFunds: string
  currentMilestone: number
  fundingDeadline: number
  milestoneCount: number
  fundingExpired: boolean
  investors: string[]
  milestones: MilestoneDetails[]
}

export interface MilestoneDetails {
  description: string
  completed: boolean
  fundsReleased: string
  reportSubmitted: boolean
  votesFor: number
  votesAgainst: number
}

export interface CitizenshipRequest {
  address: string
  timestamp: number
}

export interface ProjectData {
  name: string
  icon: string
  banner: string
  details: string
  milestoneDescriptions: string[]
  fundingDuration: number
}

// Contract interaction class
class InfinifundContract {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum)
    }
  }

  // Initialize the contract
  private async initContract() {
    if (!this.provider) {
      throw new Error('No web3 provider found')
    }

    try {
      this.signer = await this.provider.getSigner()
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.signer)
      return this.contract
    } catch (error) {
      console.error('Error initializing contract:', error)
      throw error
    }
  }

  // Get read-only contract
  private async getReadOnlyContract() {
    if (!this.provider) {
      throw new Error('No web3 provider found')
    }

    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
  }

  // Connect wallet
  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('No wallet found')
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      const address = await this.signer.getAddress()
      return address
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  // Check if user is connected
  async isConnected(): Promise<boolean> {
    if (!window.ethereum) return false
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      return accounts.length > 0
    } catch {
      return false
    }
  }

  // Get user address
  async getUserAddress(): Promise<string> {
    if (!this.provider) {
      throw new Error('No provider available')
    }

    try {
      const signer = await this.provider.getSigner()
      return await signer.getAddress()
    } catch (error) {
      console.error('Error getting user address:', error)
      throw error
    }
  }

  // Check if user is a citizen
  async isCitizen(address: string): Promise<boolean> {
    try {
      const contract = await this.getReadOnlyContract()
      return await contract.isCitizen(address)
    } catch (error) {
      console.error('Error checking citizenship:', error)
      return false
    }
  }

  // Check if user is an admin
  async isAdmin(address: string): Promise<boolean> {
    try {
      const contract = await this.getReadOnlyContract()
      const isMainAdmin = await contract.admin() === address
      const isSubAdmin = await contract.isAdmin(address)
      return isMainAdmin || isSubAdmin
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Get main admin address
  async getAdmin(): Promise<string> {
    try {
      const contract = await this.getReadOnlyContract()
      return await contract.admin()
    } catch (error) {
      console.error('Error getting admin address:', error)
      throw error
    }
  }

  // Check citizenship status
  async getCitizenshipStatus(address: string): Promise<{
    isCitizen: boolean
    isPending: boolean
    isRejected: boolean
  }> {
    try {
      const contract = await this.getReadOnlyContract()
      const [isCitizen, isPending, isRejected] = await Promise.all([
        contract.isCitizen(address),
        contract.citizenshipPending(address),
        contract.citizenshipRejected(address)
      ])
      
      return { isCitizen, isPending, isRejected }
    } catch (error) {
      console.error('Error getting citizenship status:', error)
      return { isCitizen: false, isPending: false, isRejected: false }
    }
  }

  // Request citizenship
  async requestCitizenship(): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.requestCitizenship()
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error requesting citizenship:', error)
      throw error
    }
  }

  // Approve citizenship (admin only)
  async approveCitizenship(userAddress: string): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.approveCitizenship(userAddress)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error approving citizenship:', error)
      throw error
    }
  }

  // Reject citizenship (admin only)
  async rejectCitizenship(userAddress: string): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.rejectCitizenship(userAddress)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error rejecting citizenship:', error)
      throw error
    }
  }

  // Revoke citizenship (admin only)
  async revokeCitizenship(userAddress: string): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.revokeCitizenship(userAddress)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error revoking citizenship:', error)
      throw error
    }
  }

  // Add admin (main admin only)
  async addAdmin(adminAddress: string): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.addAdmin(adminAddress)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error adding admin:', error)
      throw error
    }
  }

  // Remove admin (main admin only)
  async removeAdmin(adminAddress: string): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.removeAdmin(adminAddress)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error removing admin:', error)
      throw error
    }
  }

  // Submit project (citizens only)
  async submitProject(projectData: ProjectData): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.submitProject(
        projectData.name,
        projectData.icon,
        projectData.banner,
        projectData.details,
        projectData.milestoneDescriptions,
        projectData.fundingDuration
      )
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error submitting project:', error)
      throw error
    }
  }

  // Get all projects
  async getAllProjects(): Promise<ProjectView[]> {
    try {
      const contract = await this.getReadOnlyContract()
      const projects = await contract.getAllProjects()
      
      return projects.map((project: any) => ({
        project_id: Number(project.project_id),
        name: project.name,
        creator: project.creator,
        approvedForFunding: project.approvedForFunding,
        totalFunds: project.totalFunds.toString(),
        currentMilestone: Number(project.currentMilestone),
        milestoneCount: Number(project.milestoneCount),
        fundingExpired: project.fundingExpired
      }))
    } catch (error) {
      console.error('Error getting all projects:', error)
      return []
    }
  }

  // Get project by ID
  async getProjectById(projectId: number): Promise<ProjectView | null> {
    try {
      const contract = await this.getReadOnlyContract()
      const project = await contract.getProjectById(projectId)
      
      return {
        project_id: Number(project.project_id),
        name: project.name,
        creator: project.creator,
        approvedForFunding: project.approvedForFunding,
        totalFunds: project.totalFunds.toString(),
        currentMilestone: Number(project.currentMilestone),
        milestoneCount: Number(project.milestoneCount),
        fundingExpired: project.fundingExpired
      }
    } catch (error) {
      console.error('Error getting project by ID:', error)
      return null
    }
  }

  // Get detailed project information
  async getProjectDetails(projectId: number): Promise<ProjectDetails | null> {
    try {
      const contract = await this.getReadOnlyContract()
      const project = await contract.projects(projectId)
      
      // Get milestones - Note: Due to Solidity mapping limitations, 
      // milestone details may need to be fetched differently or stored in events
      const milestones: MilestoneDetails[] = []
      for (let i = 0; i < Number(project.milestoneCount); i++) {
        // For now, create placeholder milestones since direct mapping access is complex
        milestones.push({
          description: `Milestone ${i + 1}`,
          completed: i < Number(project.currentMilestone),
          fundsReleased: i < Number(project.currentMilestone) ? (Number(project.totalFunds) / Number(project.milestoneCount)).toString() : "0",
          reportSubmitted: i < Number(project.currentMilestone),
          votesFor: 0,
          votesAgainst: 0
        })
      }

      return {
        project_id: Number(project.project_id),
        name: project.name,
        icon: project.icon,
        banner: project.banner,
        details: project.details,
        creator: project.creator,
        approvedForFunding: project.approvedForFunding,
        exists: project.exists,
        totalFunds: project.totalFunds.toString(),
        currentMilestone: Number(project.currentMilestone),
        fundingDeadline: Number(project.fundingDeadline),
        milestoneCount: Number(project.milestoneCount),
        fundingExpired: project.fundingExpired,
        investors: project.investors || [],
        milestones
      }
    } catch (error) {
      console.error('Error getting project details:', error)
      return null
    }
  }

  // Vote for project screening (citizens only)
  async voteScreening(projectId: number, approve: boolean): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.voteScreening(projectId, approve)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error voting for screening:', error)
      throw error
    }
  }

  // Finalize screening (admin only)
  async finalizeScreening(projectId: number): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.finalizeScreening(projectId)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error finalizing screening:', error)
      throw error
    }
  }

  // Fund project
  async fundProject(projectId: number, amount: string): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.fundProject(projectId, {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error funding project:', error)
      throw error
    }
  }

  // Submit milestone report (project creator only)
  async submitMilestoneReport(projectId: number): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.submitMilestoneReport(projectId)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error submitting milestone report:', error)
      throw error
    }
  }

  // Vote on milestone (investors only)
  async voteMilestone(projectId: number, approve: boolean): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.voteMilestone(projectId, approve)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error voting on milestone:', error)
      throw error
    }
  }

  // Finalize milestone
  async finalizeMilestone(projectId: number): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.finalizeMilestone(projectId)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error finalizing milestone:', error)
      throw error
    }
  }

  // Request bailout (investors only)
  async requestBailout(projectId: number): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.requestBailout(projectId)
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error requesting bailout:', error)
      throw error
    }
  }

  // Get user's projects
  async getUserProjects(userAddress: string): Promise<number[]> {
    try {
      const contract = await this.getReadOnlyContract()
      const projectIds = await contract.getUserProjects(userAddress)
      return projectIds.map((id: any) => Number(id))
    } catch (error) {
      console.error('Error getting user projects:', error)
      return []
    }
  }

  // Get user's investments
  async getUserInvestments(userAddress: string): Promise<number[]> {
    try {
      const contract = await this.getReadOnlyContract()
      const projectIds = await contract.getUserInvestments(userAddress)
      return projectIds.map((id: any) => Number(id))
    } catch (error) {
      console.error('Error getting user investments:', error)
      return []
    }
  }

  // Get screening votes for a project
  async getScreeningVotes(projectId: number): Promise<{ votesFor: number; votesAgainst: number }> {
    try {
      const contract = await this.getReadOnlyContract()
      const [votesFor, votesAgainst] = await Promise.all([
        contract.screeningVotesFor(projectId),
        contract.screeningVotesAgainst(projectId)
      ])
      
      return {
        votesFor: Number(votesFor),
        votesAgainst: Number(votesAgainst)
      }
    } catch (error) {
      console.error('Error getting screening votes:', error)
      return { votesFor: 0, votesAgainst: 0 }
    }
  }

  // Check if user has voted for screening
  async hasVotedScreening(projectId: number, userAddress: string): Promise<boolean> {
    try {
      const contract = await this.getReadOnlyContract()
      return await contract.screeningVotes(projectId, userAddress)
    } catch (error) {
      console.error('Error checking screening vote:', error)
      return false
    }
  }

  // Check if user has voted for milestone
  async hasVotedMilestone(projectId: number, milestoneId: number, userAddress: string): Promise<boolean> {
    try {
      const contract = await this.getReadOnlyContract()
      return await contract.milestoneInvestorVoted(projectId, milestoneId, userAddress)
    } catch (error) {
      console.error('Error checking milestone vote:', error)
      return false
    }
  }

  // Get pending citizenship requests (admin only)
  async getPendingCitizenshipRequests(): Promise<CitizenshipRequest[]> {
    try {
      // This would require events or additional contract storage
      // For now, return empty array as the contract doesn't have this functionality
      // In a real implementation, you'd listen to CitizenshipRequested events
      return []
    } catch (error) {
      console.error('Error getting pending requests:', error)
      return []
    }
  }

  // Get contract balance
  async getContractBalance(): Promise<string> {
    try {
      const contract = await this.getReadOnlyContract()
      const balance = await contract.getContractBalance()
      return balance.toString()
    } catch (error) {
      console.error('Error getting contract balance:', error)
      return "0"
    }
  }

  // Emergency withdraw (admin only)
  async emergencyWithdraw(): Promise<boolean> {
    try {
      const contract = await this.initContract()
      const tx = await contract.emergencyWithdraw()
      await tx.wait()
      return true
    } catch (error) {
      console.error('Error with emergency withdraw:', error)
      throw error
    }
  }
}

// Export singleton instance
export const infinifundContract = new InfinifundContract()
export default infinifundContract
