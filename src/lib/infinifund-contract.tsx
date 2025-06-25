import { ethers } from "ethers"

// Replace with your actual deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890"

// Import your actual ABI
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
    if (!this.provider) {
      throw new Error("No ethereum provider found. Please install MetaMask.")
    }

    await this.provider.send("eth_requestAccounts", [])
    this.signer = await this.provider.getSigner()
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.signer)

    return await this.signer.getAddress()
  }

  async submitProject(projectData: ProjectData): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) {
      throw new Error("Contract not initialized. Call connect() first.")
    }

    const tx = await this.contract.submitProject(
      projectData.name,
      projectData.icon,
      projectData.banner,
      projectData.details,
      projectData.milestoneDescriptions,
      projectData.fundingDuration,
    )

    return tx
  }

  async requestCitizenship(): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) {
      throw new Error("Contract not initialized. Call connect() first.")
    }

    return await this.contract.requestCitizenship()
  }

  async isCitizen(address: string): Promise<boolean> {
    if (!this.contract) {
      // Create read-only contract for view functions
      if (!this.provider) {
        throw new Error("No provider available")
      }
      const readOnlyContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)
      return await readOnlyContract.isCitizen(address)
    }

    return await this.contract.isCitizen(address)
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
    }
  }

  async getProjectCount(): Promise<number> {
    const contract = this.contract || new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.provider)

    const count = await contract.projectCount()
    return Number(count)
  }

  async getAllProjects(): Promise<Project[]> {
    const projectCount = await this.getProjectCount()
    const projects: Project[] = []

    for (let i = 1; i <= projectCount; i++) {
      try {
        const project = await this.getProject(i)
        if (project.exists) {
          projects.push(project)
        }
      } catch (error) {
        console.error(`Error fetching project ${i}:`, error)
      }
    }

    return projects
  }

  async voteScreening(projectId: number, approve: boolean): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) {
      throw new Error("Contract not initialized. Call connect() first.")
    }

    return await this.contract.voteScreening(projectId, approve)
  }

  async fundProject(projectId: number, amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) {
      throw new Error("Contract not initialized. Call connect() first.")
    }

    return await this.contract.fundProject(projectId, {
      value: ethers.parseEther(amount),
    })
  }

  // Event listeners
  onProjectSubmitted(callback: (projectId: number, creator: string) => void) {
    if (!this.contract) return

    this.contract.on("ProjectSubmitted", (projectId, creator) => {
      callback(Number(projectId), creator)
    })
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners()
    }
  }
}

// Singleton instance
export const infinifundContract = new InfinifundContract()
