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
  investments: { [address: string]: string }
}

export interface Milestone {
  description: string
  completed: boolean
  fundsReleased: string
  reportSubmitted: boolean
  votesFor: number
  votesAgainst: number
}

export class InfinifundContract {
  private contract: ethers.Contract | null = null
  private signer: ethers.Signer | null = null
  private provider: ethers.BrowserProvider | null = null

  constructor() {
    this.initializeProvider()
  }

  private async initializeProvider() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum)
    }
  }

  async connect(): Promise<string> {
    console.log("Connect Function Running.........");
    
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

  // Project functions
  async submitProject(projectData: ProjectData): Promise<ethers.ContractTransactionResponse> {
    await this.connect()
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

  async getProject(projectId: number): Promise<Project> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    const project = await contract.projects(projectId)

    return {
      id: projectId,
      name: project[0],
      icon: project[1],
      banner: project[2],
      details: project[3],
      creator: project[4],
      approvedForFunding: project[5],
      exists: project[6],
      totalFunds: project[7].toString(),
      currentMilestone: Number(project[8]),
      fundingDeadline: Number(project[9]),
      milestoneCount: Number(project[10]),
      fundingExpired: project[11],
      investors: [],
      investments: {},
    }
  }

  async getMilestone(projectId: number, milestoneId: number): Promise<Milestone> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
    // Note: This would require a getter function in the contract for milestones
    // For now, we'll return a placeholder structure
    return {
      description: "",
      completed: false,
      fundsReleased: "0",
      reportSubmitted: false,
      votesFor: 0,
      votesAgainst: 0,
    }
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

export const infinifundContract = new InfinifundContract()
