"use client"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseEther } from "viem"
import { infinifundContract, type ProjectData, type ProjectView, type ProjectDetails, type CitizenshipRequest } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import { baseSepolia } from "@/lib/rainbowkit-config"
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
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({
    hash,
  })
  
  const [state, setState] = useState<ContractState>({
    isConnected: false,
    userAddress: "",
    isCitizen: false,
    isAdmin: false,
    loading: true,
  })

  // Read contract data using wagmi hooks
  const { data: isCitizenData, refetch: refetchCitizen } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: contractABI,
    functionName: 'isCitizen',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: isAdminData, refetch: refetchAdmin } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: contractABI,
    functionName: 'isAdmin',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: projectCountData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: contractABI,
    functionName: 'projectCount',
  })

  const { data: mainAdminData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: contractABI,
    functionName: 'admin',
  })

  // Update state when wallet connects/disconnects
  useEffect(() => {
    if (isConnected && address) {
      setState(prev => ({
        ...prev,
        isConnected: true,
        userAddress: address,
        isCitizen: !!isCitizenData,
        isAdmin: !!isAdminData,
        loading: false,
      }))
    } else {
      setState({
        isConnected: false,
        userAddress: "",
        isCitizen: false,
        isAdmin: false,
        loading: false,
      })
    }
  }, [isConnected, address, isCitizenData, isAdminData])

  // Handle transaction confirmations
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed!")
      // Refetch user status
      refetchCitizen()
      refetchAdmin()
    }
  }, [isConfirmed, refetchCitizen, refetchAdmin])

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error("Write error:", writeError)
      toast.error(writeError.message || "Transaction failed")
    }
  }, [writeError])

  useEffect(() => {
    if (confirmError) {
      console.error("Confirmation error:", confirmError)
      toast.error("Transaction confirmation failed")
    }
  }, [confirmError])

  // Contract interaction functions
  const requestCitizenship = async () => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return false
      }

      toast.info("Submitting citizenship request...")
      
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'requestCitizenship',
        account: address!,
        chain: baseSepolia,
      })

      return true
    } catch (error: any) {
      console.error("Error requesting citizenship:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to request citizenship"
      toast.error(errorMessage)
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
      toast.info("Submitting project...")
      
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
          BigInt(projectData.fundingDuration),
        ],
        account: address!,
        chain: baseSepolia,
      })

      return true
    } catch (error: any) {
      console.error("Error submitting project:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to submit project"
      toast.error(errorMessage)
      throw error
    }
  }

  // Admin functions
  const approveCitizenship = async (userAddress: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return false
      }

      // Check admin status dynamically
      const adminStatus = await isAdmin(address!)
      if (!adminStatus) {
        toast.error("Only admins can approve citizenship")
        return false
      }

      console.log("Submitting approveCitizenship transaction...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'approveCitizenship',
        args: [userAddress],
        account: address!,
        chain: baseSepolia,
      })

      return true
    } catch (error: any) {
      console.error("Error approving citizenship:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to approve citizenship"
      toast.error(errorMessage)
      toast.error(errorMessage)
      throw error
    }
  }

  const rejectCitizenship = async (userAddress: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return false
      }

      if (!state.isAdmin) {
        toast.error("Only admins can reject citizenship")
        return false
      }

      toast.info("Submitting rejection transaction...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'rejectCitizenship',
        args: [userAddress],
        account: address!,
        chain: baseSepolia,
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
        return false
      }

      if (!state.isAdmin) {
        toast.error("Only admins can revoke citizenship")
        return false
      }

      toast.info("Submitting revocation transaction...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'revokeCitizenship',
        args: [userAddress],
        account: address!,
        chain: baseSepolia,
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
        return false
      }

      toast.info("Submitting add admin transaction...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'addAdmin',
        args: [adminAddress],
        account: address!,
        chain: baseSepolia,
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
        return false
      }

      toast.info("Submitting remove admin transaction...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'removeAdmin',
        args: [adminAddress],
        account: address!,
        chain: baseSepolia,
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
        return false
      }

      // Check admin status dynamically
      const adminStatus = await isAdmin(address!)
      if (!adminStatus) {
        toast.error("Only admins can finalize screening")
        return false
      }

      console.log("Submitting finalizeScreening transaction...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'finalizeScreening',
        args: [BigInt(projectId)],
        account: address!,
        chain: baseSepolia,
      })

      return true
    } catch (error: any) {
      console.error("Error finalizing screening:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to finalize screening"
      toast.error(errorMessage)
      throw error
    }
  }

  const fundProject = async (projectId: number, amount: string) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return false
      }

      if (!state.isCitizen) {
        toast.error("Only citizens can fund projects")
        return false
      }

      // Convert ETH amount to wei using parseEther for precision
      const amountInWei = parseEther(amount)
      console.log("Funding amount:", amount, "ETH =", amountInWei.toString(), "wei")

      toast.info("Submitting funding transaction...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'fundProject',
        args: [BigInt(projectId)],
        value: amountInWei,
        account: address!,
        chain: baseSepolia,
      })

      return true
    } catch (error: any) {
      console.error("Error funding project:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to fund project"
      toast.error(errorMessage)
      throw error
    }
  }

  const voteForScreening = async (projectId: number, support: boolean) => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return false
      }

      if (!state.isCitizen) {
        toast.error("Only citizens can vote on projects")
        return false
      }

      toast.info("Submitting vote...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'voteForScreening',
        args: [BigInt(projectId), support],
        account: address!,
        chain: baseSepolia,
      })

      return true
    } catch (error: any) {
      console.error("Error voting:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to vote"
      toast.error(errorMessage)
      throw error
    }
  }

  // Read functions - these use the contract class for better error handling
  const getAllProjects = async () => {
    try {
      console.log("Hook: Getting all projects...")
      const result = await infinifundContract.getAllProjects()
      console.log("Hook: Projects result:", result)
      return result
    } catch (error) {
      console.error("Hook: Error getting projects:", error)
      throw error
    }
  }
  
  const getPendingCitizenshipRequests = async () => {
    try {
      console.log("Hook: Getting pending citizenship requests...")
      const result = await infinifundContract.getPendingCitizenshipRequests()
      console.log("Hook: Citizenship requests result:", result)
      return result
    } catch (error) {
      console.error("Hook: Error getting citizenship requests:", error)
      throw error
    }
  }
  const getProjectDetails = (projectId: number) => infinifundContract.getProjectDetails(projectId)
  const getUserProjects = (userAddress: string) => infinifundContract.getUserProjects(userAddress)
  const getUserInvestments = (userAddress: string) => infinifundContract.getUserInvestments(userAddress)
  const getScreeningVotes = (projectId: number) => infinifundContract.getScreeningVotes(projectId)

  // Additional read functions for user profile
  const isCitizen = async (userAddress: string): Promise<boolean> => {
    try {
      return await infinifundContract.isCitizen(userAddress)
    } catch (error) {
      console.error("Error checking citizen status:", error)
      return false
    }
  }

  const isAdmin = async (userAddress: string): Promise<boolean> => {
    try {
      return await infinifundContract.isAdmin(userAddress)
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

  const applyCitizenship = async () => {
    try {
      if (!isConnected) {
        toast.error("Please connect your wallet first")
        return false
      }

      toast.info("Submitting citizenship application...")

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: contractABI,
        functionName: 'requestCitizenship',
        args: [],
        account: address!,
        chain: baseSepolia,
      })

      return true
    } catch (error: any) {
      console.error("Error applying for citizenship:", error)
      const errorMessage = error?.message || error?.cause?.message || "Failed to apply for citizenship"
      toast.error(errorMessage)
      throw error
    }
  }

  return {
    // State
    ...state,
    loading: state.loading || isWritePending || isConfirming,
    
    // Write functions
    requestCitizenship,
    submitProject,
    approveCitizenship,
    rejectCitizenship,
    revokeCitizenship,
    addAdmin,
    removeAdmin,
    finalizeScreening,
    fundProject,
    voteForScreening,
    applyCitizenship,
    
    // Read functions
    getAllProjects,
    getPendingCitizenshipRequests,
    getProjectDetails,
    getUserProjects,
    getUserInvestments,
    getScreeningVotes,
    isCitizen,
    isAdmin,
    
    // Contract data
    projectCount: projectCountData ? Number(projectCountData) : 0,
    mainAdmin: mainAdminData as string,
    
    // Transaction state
    isWritePending,
    isConfirming,
    isConfirmed,
    transactionHash: hash,
  }
}
