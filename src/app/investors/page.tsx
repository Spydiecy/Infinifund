"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Trophy, Users, Crown, Medal, Award, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
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
              const existing = investorMap.get(investor.address) || { totalInvested: BigInt(0), projectsInvested: 0 }
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
        return <Crown className="h-6 w-6 text-white" />
      case 2:
        return <Medal className="h-6 w-6 text-white" />
      case 3:
        return <Award className="h-6 w-6 text-white" />
      default:
        return <Star className="h-6 w-6 text-white" />
    }
  }

  const getRankColor = (rank: number) => {
    return "bg-white text-black"
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
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-white" />
            <h1 className="text-5xl font-bold text-white">
              Investor Leaderboard
            </h1>
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl text-white mb-2">Top Contributors to Breakthrough Innovation</p>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Recognize the visionary investors funding breakthrough technologies
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black border border-white p-6 text-center">
            <Users className="h-8 w-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{investors.length}</div>
            <div className="text-sm text-gray-400">Total Investors</div>
          </div>

          <div className="bg-black border border-white p-6 text-center">
            <DollarSign className="h-8 w-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatEther(getTotalInvestment().toString())}</div>
            <div className="text-sm text-gray-400">ETH Total Invested</div>
          </div>

          <div className="bg-black border border-white p-6 text-center">
            <Trophy className="h-8 w-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {investors.length > 0 ? formatEther(investors[0].totalInvested) : "0"}
            </div>
            <div className="text-sm text-gray-400">Top Investment</div>
          </div>

          <div className="bg-black border border-white p-6 text-center">
            <Star className="h-8 w-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userRank || "N/A"}</div>
            <div className="text-sm text-gray-400">Your Rank</div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-8 bg-black border border-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-4 h-4 rounded-full ${isConnected ? "bg-white" : "bg-gray-500"} animate-pulse`}
              />
              <span className="text-white font-medium">
                {isConnected
                  ? `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
                  : "Connect to see your rank"}
              </span>
              {userRank && (
                <Badge className="bg-white text-black border-white">Rank #{userRank}</Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              {!isConnected && (
                <Button onClick={connectWallet} className="bg-white text-black hover:bg-gray-200">
                  Connect Wallet
                </Button>
              )}
              <Link href="/projects">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  Browse Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {investors.length === 0 ? (
          <div className="bg-black border border-white p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Investors Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to invest in breakthrough innovations</p>
            <Link href="/projects">
              <Button className="bg-white text-black hover:bg-gray-200">
                <DollarSign className="h-4 w-4 mr-2" />
                Start Investing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {investors.map((investor, index) => (
              <div
                key={investor.address}
                className="bg-black border border-white p-6 hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl font-bold">
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
                            <Badge className="bg-white text-black border-white mr-2">You</Badge>
                          )}
                          Investor
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {formatEther(investor.totalInvested)}
                      </div>
                      <div className="text-sm text-gray-400">ETH Invested</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{investor.projectsInvested}</div>
                      <div className="text-sm text-gray-400">Projects</div>
                    </div>
                  </div>

                  {/* Special Badges */}
                  <div className="flex flex-col gap-2">
                    {investor.rank === 1 && (
                      <Badge className="bg-white text-black">
                        🏆 Top Investor
                      </Badge>
                    )}
                    {investor.rank <= 3 && (
                      <Badge className="bg-white text-black">🔥 Elite</Badge>
                    )}
                    {investor.projectsInvested >= 5 && (
                      <Badge className="bg-white text-black">
                        🌟 Diversified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-black border border-white p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Join the Elite Investors</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Invest in breakthrough technologies and climb the leaderboard while supporting the future of innovation
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/projects">
                <Button className="bg-white text-black hover:bg-gray-200">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Start Investing
                </Button>
              </Link>
              <Link href="/create-project">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  Submit Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
