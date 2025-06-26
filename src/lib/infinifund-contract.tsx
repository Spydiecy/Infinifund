import { ethers } from "ethers"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xbc29335737795E7E6839882D1aF663e21Db0E736"
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
  private readOnlyProvider: ethers.JsonRpcProvider

  constructor() {
    // Initialize read-only provider for view functions only
    this.readOnlyProvider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org')
  }

  // Create a contract instance with read-only provider for view operations
  private getReadContract(): ethers.Contract {
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
  }

  // Note: All write functions are now handled by the useInfinifundContract hook using wagmi's writeContract
  // This class only handles read operations now

  async getAllProjects(): Promise<ProjectView[]> {
    // Use read-only provider for view functions
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
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
    // Use read-only provider for view functions
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
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
    // Use read-only provider for view functions
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
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

  // Write functions are now handled by wagmi hooks in useInfinifundContract, not here

  // View functions
  async isCitizen(address: string): Promise<boolean> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    return await contract.isCitizen(address)
  }

  async citizenshipPending(address: string): Promise<boolean> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    return await contract.citizenshipPending(address)
  }

  async citizenshipRejected(address: string): Promise<boolean> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    return await contract.citizenshipRejected(address)
  }

  async isAdmin(address: string): Promise<boolean> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    return await contract.isAdmin(address)
  }

  async getAdmin(): Promise<string> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    return await contract.admin()
  }

  async getProjectCount(): Promise<number> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    const count = await contract.projectCount()
    return Number(count)
  }

  async getScreeningVotes(projectId: number): Promise<{ votesFor: number; votesAgainst: number }> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
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
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    return await contract.screeningVotes(projectId, address)
  }

  async hasVotedMilestone(projectId: number, milestoneId: number, address: string): Promise<boolean> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    return await contract.milestoneInvestorVoted(projectId, milestoneId, address)
  }

  async getUserProjects(address: string): Promise<number[]> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    const projects = await contract.getUserProjects(address)
    return projects.map((p: any) => Number(p))
  }

  async getUserInvestments(address: string): Promise<number[]> {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    const investments = await contract.getUserInvestments(address)
    return investments.map((p: any) => Number(p))
  }

  async getTopProjects(topN: number): Promise<number[]> {
    // Use read-only provider for view functions
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
    const projects = await contract.getTopProjects(topN)
    return projects.map((p: any) => Number(p))
  }

  async getProject(projectId: number): Promise<Project> {
    // Use read-only provider for view functions
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)
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
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.readOnlyProvider)

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
            const block = await this.readOnlyProvider.getBlock(event.blockNumber)
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

  // Event listeners - these would need to be implemented with a different approach
  // using wagmi's useWatchContractEvent hook in React components
}

export const infinifundContract: InfinifundContract = new InfinifundContract()
