"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { UserCheck, Clock, XCircle, CheckCircle, AlertCircle, Zap, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { infinifundContract } from "@/lib/infinifund-contract"
import { toast } from "sonner"

export default function CitizenshipPage() {
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isCitizen, setIsCitizen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isRejected, setIsRejected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  useEffect(() => {
    if (isConnected && userAddress) {
      checkCitizenshipStatus()
    }
  }, [isConnected, userAddress])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setUserAddress(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }

  const connectWallet = async () => {
    try {
      const address = await infinifundContract.connect()
      setUserAddress(address)
      setIsConnected(true)
      toast.success("Wallet connected successfully!")
    } catch (error: any) {
      toast.error("Failed to connect wallet: " + error.message)
    }
  }

  const checkCitizenshipStatus = async () => {
    if (!userAddress) return

    setIsLoading(true)
    try {
      const [citizen, pending, rejected] = await Promise.all([
        infinifundContract.isCitizen(userAddress),
        infinifundContract.citizenshipPending(userAddress),
        infinifundContract.citizenshipRejected(userAddress)
      ])

      setIsCitizen(citizen)
      setIsPending(pending)
      setIsRejected(rejected)
    } catch (error) {
      console.error("Error checking citizenship status:", error)
      toast.error("Failed to check citizenship status")
    } finally {
      setIsLoading(false)
    }
  }

  const requestCitizenship = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsRequesting(true)
    try {
      toast.info("Submitting citizenship request...")
      const tx = await infinifundContract.requestCitizenship()
      
      toast.info("Transaction submitted. Waiting for confirmation...")
      await tx.wait()
      
      toast.success("Citizenship request submitted successfully!")
      await checkCitizenshipStatus()
    } catch (error: any) {
      console.error("Error requesting citizenship:", error)
      toast.error(error.message || "Failed to request citizenship")
    } finally {
      setIsRequesting(false)
    }
  }

  const getStatusBadge = () => {
    if (isCitizen) {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">✓ Citizen</Badge>
    }
    if (isPending) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">⏳ Pending</Badge>
    }
    if (isRejected) {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">✗ Rejected</Badge>
    }
    return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Not Applied</Badge>
  }

  const getStatusIcon = () => {
    if (isCitizen) return <CheckCircle className="h-16 w-16 text-green-400" />
    if (isPending) return <Clock className="h-16 w-16 text-yellow-400" />
    if (isRejected) return <XCircle className="h-16 w-16 text-red-400" />
    return <UserCheck className="h-16 w-16 text-blue-400" />
  }

  const getStatusMessage = () => {
    if (isCitizen) {
      return {
        title: "Welcome, Infinita Citizen!",
        description: "You are now a verified citizen of Infinita City. You can submit projects, vote on proposals, and participate in the ecosystem.",
        color: "text-green-300"
      }
    }
    if (isPending) {
      return {
        title: "Application Under Review",
        description: "Your citizenship request is being reviewed by the Infinita City administrators. Please wait for approval.",
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
    return {
      title: "Apply for Citizenship",
      description: "Join the Infinita City community by applying for citizenship. Citizens can submit projects and participate in governance.",
      color: "text-blue-300"
    }
  }

  const status = getStatusMessage()

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-blue-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                Infinita Citizenship
              </h1>
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-xl text-blue-300 mb-2">"The City That Never Dies"</p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Become a verified citizen of Infinita City and join the frontier of human longevity and technological advancement
            </p>
          </motion.div>

          {/* Connection Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                    <span className="text-white font-medium">
                      {isConnected ? `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "Not Connected"}
                    </span>
                    {isConnected && getStatusBadge()}
                  </div>
                  {!isConnected && (
                    <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Status Card */}
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    {getStatusIcon()}
                  </div>
                  
                  <div>
                    <h2 className={`text-3xl font-bold mb-2 ${status.color}`}>
                      {status.title}
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                      {status.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  {!isCitizen && !isPending && isConnected && (
                    <Button
                      onClick={requestCitizenship}
                      disabled={isRequesting || isRejected}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50"
                      size="lg"
                    >
                      {isRequesting ? (
                        <>
                          <Clock className="h-5 w-5 mr-2 animate-spin" />
                          Requesting Citizenship...
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-5 w-5 mr-2" />
                          Request Citizenship
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Information Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                    Citizen Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>Submit breakthrough projects for funding</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>Vote on project proposals and governance</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>Access to exclusive Infinita City events</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>Participate in longevity research initiatives</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-purple-400" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span>Valid Ethereum wallet address</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span>Commitment to Infinita City values</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span>Interest in longevity and frontier tech</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span>Admin approval required</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {isRejected && (
              <Alert className="border-red-500/30 bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  Your citizenship application was rejected. You may need to wait before applying again or contact an administrator for more information.
                </AlertDescription>
              </Alert>
            )}

            {isPending && (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <Clock className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  Your citizenship application is under review. Administrators will process your request soon.
                </AlertDescription>
              </Alert>
            )}

            {isCitizen && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  Welcome to Infinita City! You can now participate fully in our ecosystem of longevity and frontier technology.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
