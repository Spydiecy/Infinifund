"use client"

import { useState, useEffect } from "react"
import { infinifundContract } from "@/lib/infinifund-contract"
import { toast } from "sonner"

export interface ContractState {
  isConnected: boolean
  userAddress: string
  isCitizen: boolean
  isAdmin: boolean
  loading: boolean
}

export function useInfinifundContract() {
  const [state, setState] = useState<ContractState>({
    isConnected: false,
    userAddress: "",
    isCitizen: false,
    isAdmin: false,
    loading: true,
  })

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const address = accounts[0]
          const [citizenStatus, adminStatus] = await Promise.all([
            infinifundContract.isCitizen(address),
            infinifundContract.isAdmin(address),
          ])

          setState({
            isConnected: true,
            userAddress: address,
            isCitizen: citizenStatus,
            isAdmin: adminStatus,
            loading: false,
          })
        } else {
          setState((prev) => ({ ...prev, loading: false }))
        }
      } else {
        setState((prev) => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error("Error checking connection:", error)
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const connect = async () => {
    try {
      const address = await infinifundContract.connect()
      const [citizenStatus, adminStatus] = await Promise.all([
        infinifundContract.isCitizen(address),
        infinifundContract.isAdmin(address),
      ])

      setState({
        isConnected: true,
        userAddress: address,
        isCitizen: citizenStatus,
        isAdmin: adminStatus,
        loading: false,
      })

      toast.success("Wallet connected successfully!")
      return address
    } catch (error: any) {
      toast.error("Failed to connect wallet: " + error.message)
      throw error
    }
  }

  const disconnect = () => {
    setState({
      isConnected: false,
      userAddress: "",
      isCitizen: false,
      isAdmin: false,
      loading: false,
    })
  }

  // Contract interaction methods
  const requestCitizenship = async () => {
    try {
      const tx = await infinifundContract.requestCitizenship()
      await tx.wait()
      toast.success("Citizenship request submitted!")
      return tx
    } catch (error: any) {
      toast.error("Failed to request citizenship: " + error.message)
      throw error
    }
  }

  const submitProject = async (projectData:any) => {
    try {
      const tx = await infinifundContract.submitProject(
        projectData.name,
        projectData.icon,
        projectData.banner,
        projectData.details,
        projectData.milestones,
        projectData.fundingDuration,
      )
      await tx.wait()
      toast.success("Project submitted successfully!")
      return tx
    } catch (error: any) {
      toast.error("Failed to submit project: " + error.message)
      throw error
    }
  }

  const voteScreening = async (projectId: number, approve: boolean) => {
    try {
      const tx = await infinifundContract.voteScreening(projectId, approve)
      await tx.wait()
      toast.success(`Vote ${approve ? "approved" : "rejected"} successfully!`)
      return tx
    } catch (error: any) {
      toast.error("Failed to vote: " + error.message)
      throw error
    }
  }

  const fundProject = async (projectId: number, amount: string) => {
    try {
      const tx = await infinifundContract.fundProject(projectId, amount)
      await tx.wait()
      toast.success("Project funded successfully!")
      return tx
    } catch (error: any) {
      toast.error("Failed to fund project: " + error.message)
      throw error
    }
  }

  const finalizeScreening = async (projectId: number) => {
    try {
      const tx = await infinifundContract.finalizeScreening(projectId)
      await tx.wait()
      toast.success("Screening finalized!")
      return tx
    } catch (error: any) {
      toast.error("Failed to finalize screening: " + error.message)
      throw error
    }
  }

  const finalizeMilestone = async (projectId: number) => {
    try {
      const tx = await infinifundContract.finalizeMilestone(projectId)
      await tx.wait()
      toast.success("Milestone finalized!")
      return tx
    } catch (error: any) {
      toast.error("Failed to finalize milestone: " + error.message)
      throw error
    }
  }

  const approveCitizenship = async (userAddress: string) => {
    try {
      const tx = await infinifundContract.approveCitizenship(userAddress)
      await tx.wait()
      toast.success("Citizenship approved!")
      return tx
    } catch (error: any) {
      toast.error("Failed to approve citizenship: " + error.message)
      throw error
    }
  }

  const rejectCitizenship = async (userAddress: string) => {
    try {
      const tx = await infinifundContract.rejectCitizenship(userAddress)
      await tx.wait()
      toast.success("Citizenship rejected!")
      return tx
    } catch (error: any) {
      toast.error("Failed to reject citizenship: " + error.message)
      throw error
    }
  }

  return {
    ...state,
    connect,
    disconnect,
    requestCitizenship,
    submitProject,
    voteScreening,
    fundProject,
    finalizeScreening,
    finalizeMilestone,
    approveCitizenship,
    rejectCitizenship,
    refresh: checkConnection,
  }
}
