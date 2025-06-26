"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, DollarSign, Trophy, Users, Crown, Medal, Award, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { infinifundContract } from "@/lib/infinifund-contract"
import { toast } from "sonner"
import { ethers } from "ethers"
import Link from "next/link"

interface InvestorData {
  address: string
  totalInvested: string
  projectsInvested: number
  rank: number
}

export default function InvestorsLeaderboardPage() {
  const [investors, setInvestors] = useState<InvestorData[]>([])
  const [loading, setLoading] = useState(true)
  const [userAddress, setUserAddress] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    checkConnection()
    loadInvestorsData()
  }, [])

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

  const loadInvestorsData = async () => {
    try {
      setLoading(true)

      // Get all projects to analyze investor data
      const allProjects = await infinifundContract.getAllProjects()
      const investorMap = new Map<string, { totalInvested: bigint; projectsInvested: number }>()

      // Aggregate investor data from all projects
      for (const project of allProjects) {
        try {
          const projectDetails = await infinifundContract.getProjectDetails(project.project_id)

          // Get investor data for this project (this would need to be implemented in contract)
          // For now, we'll simulate some data based on project funding
          if (Number(project.totalFunds) > 0) {
            // Simulate some investors for demonstration
            const simulatedInvestors = generateSimulatedInvestors(project)

            for (const investor of simulatedInvestors) {
              const existing = investorMap.get(investor.address) || { totalInvested: 0n, projectsInvested: 0 }
              investorMap.set(investor.address, {
                totalInvested: existing.totalInvested + BigInt(investor.amount),
                projectsInvested: existing.projectsInvested + 1,
              })
            }
          }
        } catch (error) {
          console.error(`Error processing project ${project.project_id}:`, error)
        }
      }

      // Convert to array and sort by total invested
      const investorsArray: InvestorData[] = Array.from(investorMap.entries())
        .map(([address, data], index) => ({
          address,
          totalInvested: data.totalInvested.toString(),
          projectsInvested: data.projectsInvested,
          rank: index + 1,
        }))
        .sort((a, b) => Number(b.totalInvested) - Number(a.totalInvested))
        .map((investor, index) => ({ ...investor, rank: index + 1 }))

      setInvestors(investorsArray)

      // Find user rank if connected
      if (userAddress) {
        const userInvestor = investorsArray.find((inv) => inv.address.toLowerCase() === userAddress.toLowerCase())
        setUserRank(userInvestor?.rank || null)
      }
    } catch (error) {
      console.error("Error loading investors data:", error)
      toast.error("Failed to load investors data")
    } finally {
      setLoading(false)
    }
  }

  // Simulate investor data for demonstration
  const generateSimulatedInvestors = (project: any) => {
    const investors = []
    const fundingAmount = Number(project.totalFunds)
    const numInvestors = Math.min(Math.floor(fundingAmount / 1e17) + 1, 5) // 1-5 investors based on funding

    for (let i = 0; i < numInvestors; i++) {
      investors.push({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        amount: Math.floor(fundingAmount / numInvestors).toString(),
      })
    }

    return investors
  }

  const formatEther = (wei: string) => {
    try {
      return Number.parseFloat(ethers.formatEther(wei)).toFixed(4)
    } catch {
      return "0.0000"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-400" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-300" />
      case 3:
        return <Award className="h-8 w-8 text-orange-400" />
      default:
        return <Star className="h-8 w-8 text-blue-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-yellow-600"
      case 2:
        return "from-gray-300 to-gray-500"
      case 3:
        return "from-orange-400 to-orange-600"
      default:
        return "from-blue-500 to-purple-500"
    }
  }

  const getTotalInvestment = () => {
    return investors.reduce((total, investor) => total + Number(investor.totalInvested), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Investor Leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-black to-orange-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Investor Leaderboard
              </h1>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-xl text-yellow-300 mb-2">Top Contributors to Infinita City Innovation</p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Recognize the visionary investors funding breakthrough technologies
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{investors.length}</div>
                  <div className="text-sm text-gray-300">Total Investors</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-green-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{formatEther(getTotalInvestment().toString())}</div>
                  <div className="text-sm text-gray-300">ETH Total Invested</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-orange-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {investors.length > 0 ? formatEther(investors[0].totalInvested) : "0"}
                  </div>
                  <div className="text-sm text-gray-300">Top Investment</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{userRank || "N/A"}</div>
                  <div className="text-sm text-gray-300">Your Rank</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Connection Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-4 h-4 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`}
                    />
                    <span className="text-white font-medium">
                      {isConnected
                        ? `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
                        : "Connect to see your rank"}
                    </span>
                    {userRank && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Rank #{userRank}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {!isConnected && (
                      <Button onClick={connectWallet} className="bg-yellow-600 hover:bg-yellow-700">
                        Connect Wallet
                      </Button>
                    )}
                    <Link href="/projects">
                      <Button variant="outline" className="border-gray-600 text-gray-300">
                        Browse Projects
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {investors.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-700/50">
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Investors Yet</h3>
                  <p className="text-gray-400 mb-6">Be the first to invest in breakthrough innovations</p>
                  <Link href="/projects">
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Start Investing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {investors.map((investor, index) => (
                  <motion.div
                    key={investor.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                        investor.rank <= 3
                          ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                          : "border-gray-700/50 hover:border-yellow-500/30"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          {/* Rank Badge */}
                          <div className="flex-shrink-0">
                            <div
                              className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRankColor(
                                investor.rank,
                              )} flex items-center justify-center text-2xl font-bold ${
                                investor.rank <= 3 ? "text-black" : "text-white"
                              }`}
                            >
                              #{investor.rank}
                            </div>
                          </div>

                          {/* Investor Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getRankIcon(investor.rank)}
                              <div>
                                <h3 className="text-xl font-bold text-white">
                                  {investor.address.slice(0, 6)}...{investor.address.slice(-4)}
                                </h3>
                                <p className="text-gray-400">
                                  {investor.address.toLowerCase() === userAddress.toLowerCase() && (
                                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mr-2">You</Badge>
                                  )}
                                  Investor
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex gap-8 text-center">
                            <div>
                              <div className="text-2xl font-bold text-green-400">
                                {formatEther(investor.totalInvested)}
                              </div>
                              <div className="text-sm text-gray-400">ETH Invested</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-400">{investor.projectsInvested}</div>
                              <div className="text-sm text-gray-400">Projects</div>
                            </div>
                          </div>

                          {/* Special Badges */}
                          <div className="flex flex-col gap-2">
                            {investor.rank === 1 && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
                                🏆 Top Investor
                              </Badge>
                            )}
                            {investor.rank <= 3 && (
                              <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white">🔥 Elite</Badge>
                            )}
                            {investor.projectsInvested >= 5 && (
                              <Badge className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                                🌟 Diversified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Call to Action */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500/30">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Join the Elite Investors</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Invest in breakthrough technologies and climb the leaderboard while supporting the future of human
                  longevity
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/projects">
                    <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Start Investing
                    </Button>
                  </Link>
                  <Link href="/top-projects">
                    <Button variant="outline" className="border-gray-600 text-gray-300">
                      View Top Projects
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
