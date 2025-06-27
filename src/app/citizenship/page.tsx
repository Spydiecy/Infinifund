"use client"

import { useState, useEffect } from "react"
import { UserCheck, Clock, XCircle, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useInfinifundContract } from "@/hooks/use-infinifund-contract"
import { infinifundContract } from "@/lib/infinifund-contract"
import { toast } from "sonner"

export default function CitizenshipPage() {
  const { 
    isConnected, 
    userAddress, 
    isCitizen, 
    loading, 
    requestCitizenship: submitCitizenshipRequest 
  } = useInfinifundContract()
  
  const [isPending, setIsPending] = useState(false)
  const [isRejected, setIsRejected] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)
  const [actualCitizenStatus, setActualCitizenStatus] = useState(false)

  useEffect(() => {
    if (isConnected && userAddress) {
      checkCitizenshipStatus()
    }
  }, [isConnected, userAddress])

  const checkCitizenshipStatus = async () => {
    if (!userAddress) return

    try {
      // Reset states first
      setIsPending(false)
      setIsRejected(false)
      setActualCitizenStatus(false)
      
      const status = await infinifundContract.getCitizenshipStatus(userAddress)
      console.log("Citizenship status from contract:", status)
      
      // Use contract data as source of truth
      setActualCitizenStatus(status.isCitizen)
      setIsPending(status.isPending)
      setIsRejected(status.isRejected)
    } catch (error) {
      console.error("Error checking citizenship status:", error)
      toast.error("Failed to check citizenship status")
    }
  }

  const handleCitizenshipRequest = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsRequesting(true)
    try {
      await submitCitizenshipRequest()
      toast.success("Citizenship application submitted successfully! Your request is now under review.")
      await checkCitizenshipStatus()
    } catch (error: any) {
      console.error("Error requesting citizenship:", error)
      toast.error(error.message || "Failed to request citizenship")
    } finally {
      setIsRequesting(false)
    }
  }

  const getStatusBadge = () => {
    // Check pending first, then rejected, then citizen status
    if (isPending) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">⏳ Pending</Badge>
    }
    if (isRejected) {
      return <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">✗ Rejected</Badge>
    }
    if (actualCitizenStatus) {
      return <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">✓ Citizen</Badge>
    }
    return <Badge className="bg-white/20 text-gray-300 border border-white/30">Not Applied</Badge>
  }

  const getStatusIcon = () => {
    // Check pending first, then rejected, then citizen status
    if (isPending) return <Clock className="h-16 w-16 text-yellow-400" />
    if (isRejected) return <XCircle className="h-16 w-16 text-red-400" />
    if (actualCitizenStatus) return <CheckCircle className="h-16 w-16 text-green-400" />
    return <UserCheck className="h-16 w-16 text-white" />
  }

  const getStatusMessage = () => {
    // Check pending first, then rejected, then citizen status
    if (isPending) {
      return {
        title: "Application Under Review",
        description: "Your citizenship request is being reviewed by the administrators. Please wait for approval.",
        color: "text-yellow-300"
      }
    }
    if (isRejected) {
      return {
        title: "Application Rejected",
        description: "Your citizenship request was rejected. Please contact the administrators for more information.",
        color: "text-red-300"
      }
    }
    if (actualCitizenStatus) {
      return {
        title: "Welcome, Infinifund Citizen!",
        description: "You are now a verified citizen. You can submit projects, vote on proposals, and participate in the ecosystem.",
        color: "text-green-300"
      }
    }
    return {
      title: "Apply for Citizenship",
      description: "Join the Infinifund community by applying for citizenship. Citizens can submit projects and participate in governance.",
      color: "text-white"
    }
  }

  const status = getStatusMessage()

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              Infinifund Citizenship
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Become a verified citizen to submit projects, vote on proposals, and participate in the Infinifund ecosystem.
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-8">
          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
                <span className="text-white font-medium">
                  {isConnected ? `Connected: ${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}` : "Wallet Not Connected"}
                </span>
                {isConnected && getStatusBadge()}
              </div>
              {!isConnected && (
                <ConnectButton />
              )}
            </div>
          </div>
        </div>

        {/* Main Status Card */}
        <div className="mb-8">
          <div className="bg-black/50 border border-white/20 rounded-xl p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                {getStatusIcon()}
              </div>
              
              <div>
                <h2 className={`text-3xl font-bold mb-3 ${status.color}`}>
                  {status.title}
                </h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  {status.description}
                </p>
              </div>

              {/* Action Button */}
              {!actualCitizenStatus && !isPending && !isRejected && isConnected && (
                <Button
                  onClick={handleCitizenshipRequest}
                  disabled={isRequesting}
                  className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold disabled:opacity-50 transition-colors"
                  size="lg"
                >
                  {isRequesting ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-5 w-5 mr-2" />
                      Apply for Citizenship
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-white" />
              <h3 className="text-xl font-semibold text-white">Citizen Benefits</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Submit projects for community funding</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Vote on project proposals</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Participate in platform governance</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Access to funded project updates</span>
              </div>
            </div>
          </div>

          <div className="bg-black/50 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-white" />
              <h3 className="text-xl font-semibold text-white">Requirements</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Valid wallet connection</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Commitment to platform values</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>No previous rejections</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span>Admin approval required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alerts - Show only one based on priority */}
        <div className="space-y-4">
          {isPending && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 font-medium">Application Under Review</p>
                  <p className="text-yellow-300/80 text-sm mt-1">
                    Your citizenship application is being reviewed. Administrators will process your request soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isPending && isRejected && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-300 font-medium">Application Rejected</p>
                  <p className="text-red-300/80 text-sm mt-1">
                    Your citizenship application was rejected. You may need to wait before applying again or contact an administrator.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isPending && !isRejected && actualCitizenStatus && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-300 font-medium">Welcome, Citizen!</p>
                  <p className="text-green-300/80 text-sm mt-1">
                    You can now participate fully in the Infinifund ecosystem. Submit projects, vote, and help shape the future.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
