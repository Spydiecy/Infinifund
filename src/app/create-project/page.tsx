"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Calendar, Users, Target, Sparkles, CheckCircle, XCircle, Brain, Rocket, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "@/components/file-upload"
import { MilestoneInput } from "@/components/milestone-input"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { ProjectData } from "@/lib/infinifund-contract"
import { PinataSDK } from "pinata"
import { toast } from "sonner"
import { ethers } from "ethers"
import { infinifundContract } from "@/lib/infinifund-contract"
import { useInfinifundContract } from "@/hooks/use-infinifund-contract"
import { reviewProjectWithAI } from "@/lib/gemini-ai"

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_KEY,
  pinataGateway: "example-gateway.mypinata.cloud",
})

// const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY" })

interface Milestone {
  id: string
  description: string
}

interface FormData {
  name: string
  details: string
  fundingDuration: number
}

interface AIReviewResult {
  approved: boolean
  feedback: string
  score: number
  suggestions: string[]
}

const initialFormData: FormData = {
  name: "",
  details: "",
  fundingDuration: 30,
}

// Remove this line:
// const DUMMY_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"

// const INFINITA_CITY_PROMPT = `
// You are an AI reviewer for Infinita City - "The City That Never Dies" - a pioneering network city in Próspera, Roatán, Honduras, dedicated to advancing human longevity and frontier technology.

// INFINITA CITY MISSION:
// - Accelerate breakthroughs in Biotechnology and Longevity Science
// - Advance Computational Science and AI
// - Pioneer Cybernetics and Human Enhancement
// - Foster Decentralized Science (DeSci) and Web3
// - Extend healthy human lifespan and redefine civilization's future

// EVALUATION CRITERIA:
// 1. Alignment with longevity/biotech/AI/Web3/cybernetics themes
// 2. Innovation potential and scientific merit
// 3. Feasibility and realistic milestones
// 4. Potential impact on human flourishing
// 5. Fit with Infinita City's vision of technological acceleration

// RESPONSE FORMAT (JSON):
// {
//   "approved": boolean,
//   "feedback": "Detailed explanation of decision",
//   "score": number (1-100),
//   "suggestions": ["improvement suggestion 1", "suggestion 2", "suggestion 3"]
// }

// PROJECT TO REVIEW:
// Name: {projectName}
// Description: {projectDetails}
// Milestones: {milestones}

// Provide your evaluation as JSON only.
// `

export default function CreateProject() {
  const { submitProject, isConnected, userAddress, isCitizen, loading } = useInfinifundContract()
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([{ id: "1", description: "" }])
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [aiReview, setAiReview] = useState<AIReviewResult | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Remove old wallet connection logic - now handled by the hook

  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      id: Math.random().toString(),
      description: "",
    }
    setMilestones([...milestones, newMilestone])
  }

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((milestone) => milestone.id !== id))
  }

  const handleMilestoneChange = (id: string, description: string) => {
    setMilestones(milestones.map((milestone) => (milestone.id === id ? { ...milestone, description } : milestone)))
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Replace the reviewWithAI function with:
  const handleAIReview = async () => {
    if (!formData.name.trim() || !formData.details.trim() || milestones.some((m) => !m.description.trim())) {
      toast.error("Please fill in all required fields before review")
      return
    }

    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions")
      return
    }

    setIsReviewing(true)
    toast.info("🧠 AI is reviewing your project for Infinita City alignment...")

    try {
      const review = await reviewProjectWithAI({
        projectName: formData.name,
        projectDetails: formData.details,
        milestones: milestones.map((m) => m.description),
      })
      setAiReview(review)
      setShowReviewModal(true)
    } catch (error) {
      toast.error("Failed to review project. Please try again.")
    } finally {
      setIsReviewing(false)
    }
  }

  // const reviewWithAI = async (): Promise<AIReviewResult> => {
  //   const prompt = INFINITA_CITY_PROMPT.replace("{projectName}", formData.name)
  //     .replace("{projectDetails}", formData.details)
  //     .replace("{milestones}", milestones.map((m) => m.description).join("; "))

  //   try {
  //     const model = ai.getGenerativeModel({ model: "gemini-pro" })
  //     const result = await model.generateContent(prompt)
  //     const response = await result.response
  //     const text = response.text()

  //     // Parse JSON response
  //     const jsonMatch = text.match(/\{[\s\S]*\}/)
  //     if (jsonMatch) {
  //       return JSON.parse(jsonMatch[0])
  //     }

  //     // Fallback if no JSON found
  //     return {
  //       approved: text.toLowerCase().includes("approved") || text.toLowerCase().includes("pass"),
  //       feedback: text,
  //       score: 75,
  //       suggestions: ["Consider adding more technical details"],
  //     }
  //   } catch (error) {
  //     console.error("AI Review Error:", error)
  //     throw new Error("Failed to review project with AI. Please try again.")
  //   }
  // }

  // const handleAIReview = async () => {
  //   if (!formData.name.trim() || !formData.details.trim() || milestones.some((m) => !m.description.trim())) {
  //     toast.error("Please fill in all required fields before review")
  //     return
  //   }

  //   if (!acceptedTerms) {
  //     toast.error("Please accept the terms and conditions")
  //     return
  //   }

  //   setIsReviewing(true)
  //   toast.info("🧠 AI is reviewing your project for Infinita City alignment...")

  //   try {
  //     const review = await reviewWithAI()
  //     setAiReview(review)
  //     setShowReviewModal(true)
  //   } catch (error) {
  //     toast.error("Failed to review project. Please try again.")
  //   } finally {
  //     setIsReviewing(false)
  //   }
  // }

  const handleFinalSubmit = async () => {
    // Validation checks
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (loading) {
      toast.error("Loading wallet information, please wait...")
      return
    }

    if (!isCitizen) {
      toast.error("Only citizens can submit projects. Please apply for citizenship first.")
      return
    }

    if (!aiReview || aiReview.score < 50) {
      toast.error("Your project must score at least 50% on the AI review to be eligible for submission.")
      return
    }

    if (!formData.name.trim() || !formData.details.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (milestones.some((m) => !m.description.trim())) {
      toast.error("Please fill in all milestone descriptions")
      return
    }

    setIsSubmitting(true)

    try {
      toast.info("📤 Uploading files to IPFS...")

      let iconHash = ""
      let bannerHash = ""

      if (iconFile) {
        const iconUpload = await pinata.upload.file(iconFile)
        iconHash = `ipfs://${iconUpload.cid}`
        toast.info("✅ Icon uploaded to IPFS")
      }

      if (bannerFile) {
        const bannerUpload = await pinata.upload.file(bannerFile)
        bannerHash = `ipfs://${bannerUpload.cid}`
        toast.info("✅ Banner uploaded to IPFS")
      }

      const projectData: any = {
        name: formData.name,
        icon: iconHash,
        banner: bannerHash,
        details: formData.details,
        milestoneDescriptions: milestones.map((m) => m.description),
        fundingDuration: formData.fundingDuration * 24 * 60 * 60, // Convert days to seconds
      }
      
      console.log("Project data prepared:", projectData)
      toast.info("🚀 Submitting to blockchain...")

      // Submit to blockchain using wagmi hook
      const success = await submitProject(projectData)
      
      if (success) {
        toast.success("🎉 Project submitted successfully!")
        
        // Reset form on successful submission
        setFormData(initialFormData)
        setIconFile(null)
        setBannerFile(null)
        setMilestones([{ id: "1", description: "" }])
        setShowReviewModal(false)
        setAiReview(null)
        setAcceptedTerms(false)
      } else {
        toast.error("Failed to submit project. Please try again.")
      }
    } catch (error: any) {
      console.error("Error submitting project:", error)
      toast.error(error.message || "Failed to submit project. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Create Project</h1>
            <p className="text-gray-400">Submit your project to the Infinifund platform</p>
          </motion.div>

          {/* Connection Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 bg-black border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <span className="text-white font-medium">
                      {isConnected
                        ? `Connected: ${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`
                        : "Not Connected"}
                    </span>
                    {isConnected && (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          isCitizen 
                            ? "bg-green-900 text-green-300 border border-green-800" 
                            : "bg-yellow-900 text-yellow-300 border border-yellow-800"
                        }`}>
                          {isCitizen ? "✓ Citizen" : "⏳ Pending"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {!isConnected && (
                      <ConnectButton />
                    )}
                  </div>
                </div>
                
                {/* Citizenship requirement notice */}
                {isConnected && !isCitizen && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-400 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-yellow-200 font-medium text-sm">Citizenship Required</p>
                        <p className="text-yellow-300/80 text-xs">
                          Only verified citizens can submit projects. Complete the citizenship application to unlock project submission.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card className="bg-black border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="h-5 w-5 text-white" />
                    Project Assets
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload your project visuals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FileUpload onFileSelect={setIconFile} label="Project Icon *" accept="image/*" />
                  <FileUpload onFileSelect={setBannerFile} label="Banner Image" accept="image/*" />
                </CardContent>
              </Card>

              <Card className="bg-black border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-white" />
                    Funding Timeline
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Set your project's funding duration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label className="text-gray-300">Duration (Days)</Label>
                  <Select
                    value={formData.fundingDuration.toString()}
                    onValueChange={(value) => handleInputChange("fundingDuration", Number.parseInt(value))}
                  >
                    <SelectTrigger className="bg-black border-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-800">
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card className="bg-black border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-white" />
                    Project Details
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Describe your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Project Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter project name"
                      className="bg-black border-gray-800 text-white placeholder-gray-500 focus:border-gray-600"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Project Description *</Label>
                    <Textarea
                      value={formData.details}
                      onChange={(e) => handleInputChange("details", e.target.value)}
                      placeholder="Describe your project..."
                      className="bg-black border-gray-800 text-white placeholder-gray-500 min-h-[120px] focus:border-gray-600"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-white" />
                    Development Milestones
                  </CardTitle>
                  <CardDescription className="text-gray-400">Define your project's phases</CardDescription>
                </CardHeader>
                <CardContent>
                  <MilestoneInput
                    milestones={milestones}
                    onAdd={handleAddMilestone}
                    onRemove={handleRemoveMilestone}
                    onChange={handleMilestoneChange}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Terms and Conditions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="bg-black border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    className="border-gray-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <div className="text-sm text-gray-300">
                    <label htmlFor="terms" className="cursor-pointer">
                      I agree to the{" "}
                      <span className="text-white hover:underline">Terms of Service</span> and{" "}
                      <span className="text-white hover:underline">Privacy Policy</span>. I understand that my
                      project will be reviewed before being listed on the platform.
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center space-y-4"
          >
            <Button
              onClick={handleAIReview}
              disabled={isReviewing || !acceptedTerms}
              className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold disabled:opacity-50 mr-4"
              size="lg"
            >
              {isReviewing ? (
                <>
                  <Brain className="h-5 w-5 mr-2 animate-spin" />
                  AI Reviewing...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5 mr-2" />
                  Review with AI
                </>
              )}
            </Button>

            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              Our AI will evaluate your project before submission to ensure quality and platform alignment.
              <br />
              <span className="text-yellow-400 font-medium">Minimum score of 50% required for submission.</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* AI Review Modal */}
      <AnimatePresence>
        {showReviewModal && aiReview && (
          <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
            <DialogContent className="bg-black border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-800">
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  {aiReview.approved ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <span className="text-white">Project Approved!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-500" />
                      <span className="text-red-400">Needs Improvement</span>
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-lg">
                  {aiReview.approved
                    ? "🎉 Congratulations! Your project has passed our AI review."
                    : "Your project needs some improvements before submission."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {/* Score */}
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${aiReview.score >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {aiReview.score}/100
                  </div>
                  <div className="text-gray-400">Quality Score</div>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Minimum required: </span>
                    <span className="text-white font-medium">50/100</span>
                  </div>
                  {aiReview.score < 50 && (
                    <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded">
                      <p className="text-red-300 text-sm">
                        ⚠️ Your project scored below the minimum requirement of 50%. Please improve your project based on the suggestions below and try again.
                      </p>
                    </div>
                  )}
                </div>

                {/* Feedback */}
                <div className="bg-gray-900 p-4 rounded border border-gray-800">
                  <h4 className="font-semibold text-white mb-2">AI Feedback:</h4>
                  <p className="text-gray-300">{aiReview.feedback}</p>
                </div>

                {/* Suggestions */}
                {aiReview.suggestions.length > 0 && (
                  <div className="bg-gray-900 p-4 rounded border border-gray-800">
                    <h4 className="font-semibold text-white mb-2">Suggestions for Improvement:</h4>
                    <ul className="space-y-1">
                      {aiReview.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-gray-300 flex items-start gap-2">
                          <span className="text-white mt-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || !isConnected || !isCitizen || aiReview.score < 50}
                    className="bg-white text-black hover:bg-gray-200 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Rocket className="h-4 w-4 mr-2 animate-bounce" />
                        Submitting...
                      </>
                    ) : !isConnected ? (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Connect Wallet First
                      </>
                    ) : !isCitizen ? (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Citizenship Required
                      </>
                    ) : aiReview.score < 50 ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Score Too Low (50% Required)
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Submit Project
                      </>
                    )}
                  </Button>
                  
                  {aiReview.score < 50 && (
                    <Button
                      onClick={() => {
                        setShowReviewModal(false)
                        setAiReview(null)
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Improve & Review Again
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => setShowReviewModal(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2"
                  >
                    Close Review
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
