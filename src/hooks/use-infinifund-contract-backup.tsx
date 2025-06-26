"use client"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { infinifundContract, type ProjectData, type ProjectView, type ProjectDetails, type Project } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import { flowTestnet } from "@/lib/rainbowkit-config"
import contractABI from "@/lib/abi.json"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xbc29335737795E7E6839882D1aF663e21Db0E736"

export interface ContractState {
  isConnected: boolean
  userAddress: string
  isCitizen: boolean
  isAdmin: boolean
  loading: boolean
}

export function useInfinifundContract() {
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })
  
  const [state, setState] = useState<ContractState>({
    isConnected: false,
    userAddress: "",
    isCitizen: false,
    isAdmin: false,
    loading: true,
  })

  // Check user status when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkUserStatus(address)
    } else {
      setState(prev => ({
        ...prev,
        isConnected: false,
        userAddress: "",
        isCitizen: false,
        isAdmin: false,
        loading: false,
      }))
    }
  }, [isConnected, address])

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed!")
      // Refresh user status after successful transaction
      if (isConnected && address) {
        checkUserStatus(address)
      }
    }
  }, [isConfirmed, isConnected, address])

  const checkUserStatus = async (userAddress: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      console.log("Checking user status for:", userAddress)
      console.log("Contract address:", CONTRACT_ADDRESS)
      
      const [isCitizen, isAdmin] = await Promise.all([
        infinifundContract.isCitizen(userAddress),
        infinifundContract.isAdmin(userAddress),
      ])

      console.log("User status:", { isCitizen, isAdmin })

      setState({
        isConnected: true,
        userAddress,
        isCitizen,
        isAdmin,
        loading: false,
      })
    } catch (error) {
      console.error("Error checking user status:", error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  // Contract interaction functions
  const requestCitizenship = async () => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'requestCitizenship',
        account: address!,
        chain: flowTestnet,
      })

      toast.success("Citizenship request submitted!")
      
      return true
    } catch (error: any) {
      console.error("Error requesting citizenship:", error)
      toast.error(error.message || "Failed to request citizenship")
      throw error
    }
  }

  const submitProject = async (projectData: ProjectData): Promise<boolean> => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return false
      }

      if (!state.isCitizen) {
        toast.error("Only citizens can submit projects")
        return false
      }

      console.log("Submitting project with data:", projectData)
      
      // Submit transaction
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'submitProject',
        args: [
          projectData.name,
          projectData.icon,
          projectData.banner,
          projectData.details,
          projectData.milestoneDescriptions,
          projectData.fundingDuration,
        ],
        account: address!,
        chain: flowTestnet,
      })

      console.log("Transaction submitted")
      toast.info("Transaction submitted! Waiting for confirmation...")
      
      return true
    } catch (error: any) {
      console.error("Error submitting project:", error)
      toast.error(error.message || "Failed to submit project")
      throw error
    }
  }

  const fundProject = async (projectId: number, amount: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'fundProject',
        args: [projectId],
        value: BigInt(amount), // Assuming amount is in wei
        account: address!,
        chain: flowTestnet,
      })

      toast.success("Project funded successfully!")
      
      return true
    } catch (error: any) {
      console.error("Error funding project:", error)
      toast.error(error.message || "Failed to fund project")
      throw error
    }
  }

  const voteScreening = async (projectId: number, vote: boolean) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      if (!state.isCitizen) {
        toast.error("Only citizens can vote on project screening")
        return
      }

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'voteScreening',
        args: [projectId, vote],
        account: address!,
        chain: flowTestnet,
      })

      toast.success(`Vote ${vote ? 'for' : 'against'} submitted!`)
      
      return true
    } catch (error: any) {
      console.error("Error voting on screening:", error)
      toast.error(error.message || "Failed to submit vote")
      throw error
    }
  }

  // Admin functions
  const approveCitizenship = async (userAddress: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      if (!state.isAdmin) {
        toast.error("Only admins can approve citizenship")
        return
      }

      const txHash = writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'approveCitizenship',
        args: [userAddress],
        account: address!,
        chain: flowTestnet,
      })

      return true
    } catch (error: any) {
      console.error("Error approving citizenship:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to approve citizenship"
      toast.error(errorMessage)
      throw error
    }
  }

  const rejectCitizenship = async (userAddress: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      if (!state.isAdmin) {
        toast.error("Only admins can reject citizenship")
        return
      }

      const txHash = writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'rejectCitizenship',
        args: [userAddress],
        account: address!,
        chain: flowTestnet,
      })

      return true
    } catch (error: any) {
      console.error("Error rejecting citizenship:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to reject citizenship"
      toast.error(errorMessage)
      throw error
    }
  }

  const revokeCitizenship = async (userAddress: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      if (!state.isAdmin) {
        toast.error("Only admins can revoke citizenship")
        return
      }

      const txHash = writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'revokeCitizenship',
        args: [userAddress],
        account: address!,
        chain: flowTestnet,
      })

      return true
    } catch (error: any) {
      console.error("Error revoking citizenship:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to revoke citizenship"
      toast.error(errorMessage)
      throw error
    }
  }

  const addAdmin = async (adminAddress: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      const txHash = writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'addAdmin',
        args: [adminAddress],
        account: address!,
        chain: flowTestnet,
      })

      return true
    } catch (error: any) {
      console.error("Error adding admin:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to add admin"
      toast.error(errorMessage)
      throw error
    }
  }

  const removeAdmin = async (adminAddress: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      const txHash = writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'removeAdmin',
        args: [adminAddress],
        account: address!,
        chain: flowTestnet,
      })

      return true
    } catch (error: any) {
      console.error("Error removing admin:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to remove admin"
      toast.error(errorMessage)
      throw error
    }
  }

  const finalizeScreening = async (projectId: number) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return
      }

      if (!state.isAdmin) {
        toast.error("Only admins can finalize screening")
        return
      }

      const txHash = writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'finalizeScreening',
        args: [projectId],
        account: address!,
        chain: flowTestnet,
      })

      return true
    } catch (error: any) {
      console.error("Error finalizing screening:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to finalize screening"
      toast.error(errorMessage)
      throw error
    }
  }

  // Read-only functions (no signer needed)
  const getAllProjects = () => infinifundContract.getAllProjects()
  const getProjectById = (projectId: number) => infinifundContract.getProjectById(projectId)
  const getProjectDetails = (projectId: number) => infinifundContract.getProjectDetails(projectId)
  const getProject = (projectId: number) => infinifundContract.getProject(projectId)
  const getTopProjects = (topN: number) => infinifundContract.getTopProjects(topN)
  const getUserProjects = (address: string) => infinifundContract.getUserProjects(address)
  const getUserInvestments = (address: string) => infinifundContract.getUserInvestments(address)
  const getProjectCount = () => infinifundContract.getProjectCount()
  const getPendingCitizenshipRequests = () => infinifundContract.getPendingCitizenshipRequests()

  return {
    // State
    ...state,
    
    // Write functions
    requestCitizenship,
    submitProject,
    fundProject,
    voteScreening,
    approveCitizenship,
    rejectCitizenship,
    revokeCitizenship,
    addAdmin,
    removeAdmin,
    finalizeScreening,
    
    // Read functions
    getAllProjects,
    getProjectById,
    getProjectDetails,
    getProject,
    getTopProjects,
    getUserProjects,
    getUserInvestments,
    getProjectCount,
    getPendingCitizenshipRequests,
    
    // Transaction state
    isTransactionPending: isWritePending,
    isTransactionConfirming: isConfirming,
    isTransactionConfirmed: isConfirmed,
    transactionHash: hash,
    transactionError: writeError,
    
    // Utility
    checkUserStatus,
  }
}
