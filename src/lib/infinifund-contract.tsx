import { ethers } from "ethers"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890"
import contractABI from "./abi.json"

export interface ProjectData {
  name: string
  icon: string
  banner: string
  details: string
  milestoneDescriptions: string[]
  fundingDuration: number
}

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
}

export interface Milestone {
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

export interface Project {
  id: number
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
  milestones: Milestone[]
}

export class InfinifundContract {
  private contract: ethers.Contract | null = null
  private signer: ethers.Signer | null = null
  private provider: ethers.BrowserProvider | null = null

  constructor() {
    // Provider will be set via setProvider method from wallet context
  }

  private async initializeProvider() {
    // Provider will be initialized from wallet context, not window.ethereum
  }

  // New method to initialize with external provider and signer
  initializeWithProvider(provider: ethers.BrowserProvider, signer: ethers.Signer) {
    this.provider = provider
    this.signer = signer
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)
  }

  async connect(): Promise<string> {
    if (!this.provider) {
      throw new Error("No ethereum provider found. Please install MetaMask.")
    }

    await this.provider.send("eth_requestAccounts", [])
    this.signer = await this.provider.getSigner()
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.signer)

    return await this.signer.getAddress()
  }

  // Citizenship functions
  async requestCitizenship(): Promise<ethers.ContractTransactionResponse> {
    await this.connect();
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.requestCitizenship()
  }

  async approveCitizenship(userAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.approveCitizenship(userAddress)
  }

  async rejectCitizenship(userAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.rejectCitizenship(userAddress)
  }

  async revokeCitizenship(userAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.revokeCitizenship(userAddress)
  }

  async addAdmin(newAdminAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.addAdmin(newAdminAddress)
  }

  async removeAdmin(adminAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.removeAdmin(adminAddress)
  }

  // Project functions
  async submitProject(projectData: any) {
    await this.connect();
    console.log("My proejct data is;:::::::::::::",projectData);

    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.submitProject(
      projectData.name,
      projectData.icon,
      projectData.banner,
      projectData.details,
      projectData.milestoneDescriptions,
      
      projectData.fundingDuration,
    )
  }

  async getAllProjects(): Promise<ProjectView[]> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const projectCount = Number(await contract.projectCount())
    const projects: ProjectView[] = []

    for (let i = 1; i <= projectCount; i++) {
      try {
        const project = await contract.projects(i)
        projects.push({
          project_id: i,
          name: project.name,
          creator: project.creator,
          approvedForFunding: project.approvedForFunding,
          totalFunds: project.totalFunds.toString(),
          currentMilestone: Number(project.currentMilestone),
          milestoneCount: Number(project.milestoneCount),
          fundingExpired: project.fundingExpired,
        })
      } catch (error) {
        console.error(`Error fetching project ${i}:`, error)
      }
    }

    return projects
  }

  async getProjectById(projectId: number): Promise<ProjectView> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const project = await contract.projects(projectId)

    return {
      project_id: projectId,
      name: project.name,
      creator: project.creator,
      approvedForFunding: project.approvedForFunding,
      totalFunds: project.totalFunds.toString(),
      currentMilestone: Number(project.currentMilestone),
      milestoneCount: Number(project.milestoneCount),
      fundingExpired: project.fundingExpired,
    }
  }

  async getProjectDetails(projectId: number): Promise<ProjectDetails> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const project = await contract.projects(projectId)

    return {
      project_id: projectId,
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
      investors: [],
    }
  }

  async voteScreening(projectId: number, approve: boolean): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.voteScreening(projectId, approve)
  }

  async finalizeScreening(projectId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.finalizeScreening(projectId)
  }

  async fundProject(projectId: number, amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.fundProject(projectId, {
      value: ethers.parseEther(amount),
    })
  }

  // Milestone functions
  async submitMilestoneReport(projectId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.submitMilestoneReport(projectId)
  }

  async voteMilestone(projectId: number, approve: boolean): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.voteMilestone(projectId, approve)
  }

  async finalizeMilestone(projectId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.finalizeMilestone(projectId)
  }

  async requestBailout(projectId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.requestBailout(projectId)
  }

  // View functions
  async isCitizen(address: string): Promise<boolean> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    return await contract.isCitizen(address)
  }

  async citizenshipPending(address: string): Promise<boolean> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    return await contract.citizenshipPending(address)
  }

  async citizenshipRejected(address: string): Promise<boolean> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    return await contract.citizenshipRejected(address)
  }

  async isAdmin(address: string): Promise<boolean> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    return await contract.isAdmin(address)
  }

  async getAdmin(): Promise<string> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    return await contract.admin()
  }

  async getProjectCount(): Promise<number> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const count = await contract.projectCount()
    return Number(count)
  }

  async getScreeningVotes(projectId: number): Promise<{ votesFor: number; votesAgainst: number }> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const [votesFor, votesAgainst] = await Promise.all([
      contract.screeningVotesFor(projectId),
      contract.screeningVotesAgainst(projectId),
    ])
    return {
      votesFor: Number(votesFor),
      votesAgainst: Number(votesAgainst),
    }
  }

  async hasVotedScreening(projectId: number, address: string): Promise<boolean> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    return await contract.screeningVotes(projectId, address)
  }

  async hasVotedMilestone(projectId: number, milestoneId: number, address: string): Promise<boolean> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    return await contract.milestoneInvestorVoted(projectId, milestoneId, address)
  }

  async getUserProjects(address: string): Promise<number[]> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const projects = await contract.getUserProjects(address)
    return projects.map((p: any) => Number(p))
  }

  async getUserInvestments(address: string): Promise<number[]> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const investments = await contract.getUserInvestments(address)
    return investments.map((p: any) => Number(p))
  }

  async getTopProjects(topN: number): Promise<number[]> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const projects = await contract.getTopProjects(topN)
    return projects.map((p: any) => Number(p))
  }

  async getProject(projectId: number): Promise<Project> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const project = await contract.projects(projectId)

    const milestoneCount = Number(project.milestoneCount)
    const milestones: Milestone[] = []
    for (let i = 0; i < milestoneCount; i++) {
      const milestone = await contract.milestones(projectId, i)
      milestones.push({
        description: milestone.description,
        completed: milestone.completed,
        fundsReleased: milestone.fundsReleased.toString(),
        reportSubmitted: milestone.reportSubmitted,
        votesFor: Number(milestone.votesFor),
        votesAgainst: Number(milestone.votesAgainst),
      })
    }

    return {
      id: projectId,
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
      investors: [], // Implement fetching investors if needed
      milestones: milestones,
    }
  }

  // Get pending citizenship requests from events
  async getPendingCitizenshipRequests(): Promise<CitizenshipRequest[]> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)

    try {
      // Get all CitizenshipRequested events
      const filter = contract.filters.CitizenshipRequested()
      const events:any = await contract.queryFilter(filter, -10000) // Last 10k blocks

      const requests: CitizenshipRequest[] = []

      for (const event of events) {
        const userAddress = event.args?.[0]
        if (userAddress) {
          // Check if still pending
          const isPending = await this.citizenshipPending(userAddress)
          if (isPending) {
            const block = await this.provider?.getBlock(event.blockNumber)
            requests.push({
              address: userAddress,
              timestamp: block?.timestamp ? block.timestamp * 1000 : Date.now(),
            })
          }
        }
      }

      return requests
    } catch (error) {
      console.error("Error fetching citizenship requests:", error)
      return []
    }
  }

  // Event listeners
  onProjectSubmitted(callback: (projectId: number, creator: string) => void) {
    if (!this.contract) return
    this.contract.on("ProjectSubmitted", (projectId, creator) => {
      callback(Number(projectId), creator)
    })
  }

  onCitizenshipRequested(callback: (user: string) => void) {
    if (!this.contract) return
    this.contract.on("CitizenshipRequested", callback)
  }

  onProjectApproved(callback: (projectId: number) => void) {
    if (!this.contract) return
    this.contract.on("ProjectApproved", (projectId) => {
      callback(Number(projectId))
    })
  }

  onProjectFunded(callback: (projectId: number, investor: string, amount: string) => void) {
    if (!this.contract) return
    this.contract.on("ProjectFunded", (projectId, investor, amount) => {
      callback(Number(projectId), investor, amount.toString())
    })
  }

  onMilestoneReportSubmitted(callback: (projectId: number, milestoneId: number) => void) {
    if (!this.contract) return
    this.contract.on("MilestoneReportSubmitted", (projectId, milestoneId) => {
      callback(Number(projectId), Number(milestoneId))
    })
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners()
    }
  }
}

export const infinifundContract:any = new InfinifundContract()
