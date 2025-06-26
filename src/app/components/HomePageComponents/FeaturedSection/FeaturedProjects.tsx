"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Rocket, TrendingUp, Users, DollarSign, Star, Award } from "lucide-react"
import { infinifundContract, type ProjectView } from "@/lib/infinifund-contract"
import Link from "next/link"

export function FeaturedProjects() {
  const [featuredProjects, setFeaturedProjects] = useState<ProjectView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProjects()
  }, [])

  const loadFeaturedProjects = async () => {
    try {
      setLoading(true)
      const allProjects = await infinifundContract.getAllProjects()
      
      // Get top 3 featured projects based on funding amount and approval status
      const approvedProjects = allProjects.filter(project => project.approvedForFunding)
      const topProjects = approvedProjects
        .sort((a, b) => Number(b.totalFunds) - Number(a.totalFunds))
        .slice(0, 3)
      
      setFeaturedProjects(topProjects)
    } catch (error) {
      console.error("Error loading featured projects:", error)
      // Set mock data if contract fails
      setFeaturedProjects([
        {
          project_id: 1,
          name: "LifeExtend Research",
          creator: "0x1234567890123456789012345678901234567890",
          approvedForFunding: true,
          totalFunds: "750000000000000000000", // 750 ETH
          currentMilestone: 0,
          milestoneCount: 5,
          fundingExpired: false,
        },
        {
          project_id: 2,
          name: "Neural Regeneration Protocol",
          creator: "0x2345678901234567890123456789012345678901",
          approvedForFunding: true,
          totalFunds: "650000000000000000000", // 650 ETH
          currentMilestone: 1,
          milestoneCount: 4,
          fundingExpired: false,
        },
        {
          project_id: 3,
          name: "Genetic Optimization Lab",
          creator: "0x3456789012345678901234567890123456789012",
          approvedForFunding: true,
          totalFunds: "480000000000000000000", // 480 ETH
          currentMilestone: 0,
          milestoneCount: 6,
          fundingExpired: false,
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatEther = (wei: string) => {
    return (Number(wei) / 1e18).toFixed(2)
  }

  const getProgressPercentage = (current: string) => {
    // Mock funding goal for display purposes (1000 ETH)
    const mockGoal = 1000000000000000000000
    return Math.min((Number(current) / mockGoal) * 100, 100)
  }

  const getProjectDescription = (name: string) => {
    const descriptions: { [key: string]: string } = {
      "LifeExtend Research": "Revolutionary longevity research focused on cellular regeneration and anti-aging therapeutics",
      "Neural Regeneration Protocol": "Advanced biotech platform for neural tissue regeneration and brain health optimization",
      "Genetic Optimization Lab": "Cutting-edge gene therapy research for enhanced human longevity and disease resistance"
    }
    return descriptions[name] || "Innovative research project advancing human longevity and biotech solutions"
  }

  if (loading) {
    return (
      <div className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-300">Loading featured longevity projects...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-lg h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 bg-black relative overflow-hidden">
      {/* Background starry effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-8 w-8 text-blue-400" />
              <h2 className="text-4xl font-bold text-white">Featured Projects</h2>
              <Star className="h-8 w-8 text-blue-400" />
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover groundbreaking longevity research projects that are shaping the future of human health and extending healthy lifespan
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.project_id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 group h-full backdrop-blur-sm">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-blue-400" />
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        Featured
                      </Badge>
                    </div>
                    <Award className="h-5 w-5 text-yellow-400" />
                  </div>
                  
                  <div>
                    <CardTitle className="text-white group-hover:text-blue-300 transition-colors">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-2 line-clamp-3">
                      {getProjectDescription(project.name)}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">
                        {getProgressPercentage(project.totalFunds).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(project.totalFunds)} 
                      className="h-2 bg-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-gray-400">Raised</div>
                      <div className="text-white font-semibold flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        {formatEther(project.totalFunds)} ETH
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400">Milestone</div>
                      <div className="text-white font-semibold flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        {project.currentMilestone + 1}/{project.milestoneCount}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>Active Project</span>
                    </div>
                    <Link href={`/projects/${project.project_id}`}>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                      >
                        View Project
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/projects">
            <Button 
              variant="outline" 
              size="lg"
              className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
            >
              View All Projects
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
