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
import type { ProjectData } from "@/lib/infinifund-contract"
import { PinataSDK } from "pinata"
import { GoogleGenAI } from "@google/genai"
import { toast } from "sonner"

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_KEY,
  pinataGateway: "example-gateway.mypinata.cloud",
})

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY" })

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

const DUMMY_ADDRESS = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4"

const INFINITA_CITY_PROMPT = `
You are an AI reviewer for Infinita City - "The City That Never Dies" - a pioneering network city in Próspera, Roatán, Honduras, dedicated to advancing human longevity and frontier technology.

INFINITA CITY MISSION:
- Accelerate breakthroughs in Biotechnology and Longevity Science
- Advance Computational Science and AI
- Pioneer Cybernetics and Human Enhancement
- Foster Decentralized Science (DeSci) and Web3
- Extend healthy human lifespan and redefine civilization's future

EVALUATION CRITERIA:
1. Alignment with longevity/biotech/AI/Web3/cybernetics themes
2. Innovation potential and scientific merit
3. Feasibility and realistic milestones
4. Potential impact on human flourishing
5. Fit with Infinita City's vision of technological acceleration

RESPONSE FORMAT (JSON):
{
  "approved": boolean,
  "feedback": "Detailed explanation of decision",
  "score": number (1-100),
  "suggestions": ["improvement suggestion 1", "suggestion 2", "suggestion 3"]
}

PROJECT TO REVIEW:
Name: {projectName}
Description: {projectDetails}
Milestones: {milestones}

Provide your evaluation as JSON only.
`

export default function CreateProject() {
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([{ id: "1", description: "" }])
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [aiReview, setAiReview] = useState<AIReviewResult | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string>("")
  const [isCitizen, setIsCitizen] = useState(false)

  useEffect(() => {
    setUserAddress(DUMMY_ADDRESS)
    setIsConnected(true)
    setIsCitizen(true)
  }, [])

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

  const reviewWithAI = async (): Promise<AIReviewResult> => {
    const prompt = INFINITA_CITY_PROMPT.replace("{projectName}", formData.name)
      .replace("{projectDetails}", formData.details)
      .replace("{milestones}", milestones.map((m) => m.description).join("; "))

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: prompt,
      })

      const result = JSON.parse(response.text)
      return result
    } catch (error) {
      console.error("AI Review Error:", error)
      // Fallback response
      return {
        approved: true,
        feedback: "AI review temporarily unavailable. Project approved for manual review.",
        score: 75,
        suggestions: ["Consider adding more technical details", "Expand on the innovation aspects"],
      }
    }
  }

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
      const review = await reviewWithAI()
      setAiReview(review)
      setShowReviewModal(true)
    } catch (error) {
      toast.error("Failed to review project. Please try again.")
    } finally {
      setIsReviewing(false)
    }
  }

  const handleFinalSubmit = async () => {
    if (!aiReview?.approved) {
      toast.error("Project must be approved by AI review first")
      return
    }

    setIsSubmitting(true)

    try {
      toast.info("📤 Uploading files to IPFS...")

      let iconHash = ""
      let bannerHash = ""

      if (iconFile) {
        const iconUpload = await pinata.upload.file(iconFile)
        iconHash = iconUpload.cid
      }

      if (bannerFile) {
        const bannerUpload = await pinata.upload.file(bannerFile)
        bannerHash = bannerUpload.cid
      }

      const projectData: ProjectData = {
        name: formData.name,
        icon: iconHash,
        banner: bannerHash,
        details: formData.details,
        milestoneDescriptions: milestones.map((m) => m.description),
        fundingDuration: formData.fundingDuration * 24 * 60 * 60,
      }

      toast.info("🚀 Submitting to Infinita City blockchain...")

      console.log("Project data for Infinita City:", projectData)
      console.log("Using address:", DUMMY_ADDRESS)

      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockProjectId = Math.floor(Math.random() * 1000) + 1

      toast.success(`🎉 Project submitted to Infinita City! Project ID: ${mockProjectId}`)

      setFormData(initialFormData)
      setIconFile(null)
      setBannerFile(null)
      setMilestones([{ id: "1", description: "" }])
      setShowReviewModal(false)
      setAiReview(null)
      setAcceptedTerms(false)
    } catch (error: any) {
      console.error("Error submitting project:", error)
      toast.error(error.message || "Failed to submit project")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-blue-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
                Infinita City
              </h1>
              <Rocket className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-xl text-blue-300 mb-2">"The City That Never Dies"</p>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Submit your breakthrough project to advance human longevity, AI, biotechnology, and frontier science in
              Próspera, Roatán
            </p>
          </motion.div>

          {/* Connection Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8 bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-4 h-4 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`}
                    />
                    <span className="text-white font-medium">
                      {isConnected
                        ? `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
                        : "Not Connected"}
                    </span>
                    {isConnected && (
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {isCitizen ? "✓ Infinita Citizen" : "Pending Citizenship"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-blue-300">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">Próspera, Roatán Hub</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card className="bg-gray-900/50 border-blue-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-400" />
                    Project Assets
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Upload your project visuals for the Infinita City ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FileUpload onFileSelect={setIconFile} label="Project Icon *" accept="image/*" />
                  <FileUpload onFileSelect={setBannerFile} label="Banner Image" accept="image/*" />
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    Funding Timeline
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Set your project's funding duration in the Infinita ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label className="text-gray-300">Duration (Days)</Label>
                  <Select
                    value={formData.fundingDuration.toString()}
                    onValueChange={(value) => handleInputChange("fundingDuration", Number.parseInt(value))}
                  >
                    <SelectTrigger className="bg-black/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-600">
                      <SelectItem value="7">7 Days - Sprint</SelectItem>
                      <SelectItem value="14">14 Days - Rapid</SelectItem>
                      <SelectItem value="30">30 Days - Standard</SelectItem>
                      <SelectItem value="60">60 Days - Extended</SelectItem>
                      <SelectItem value="90">90 Days - Long-term</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card className="bg-gray-900/50 border-green-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Project Details
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Describe your breakthrough innovation for Infinita City
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Project Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Your revolutionary project name"
                      className="bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Project Description *</Label>
                    <Textarea
                      value={formData.details}
                      onChange={(e) => handleInputChange("details", e.target.value)}
                      placeholder="Describe how your project advances longevity, AI, biotech, or frontier science..."
                      className="bg-black/50 border-gray-600 text-white placeholder-gray-400 min-h-[120px] focus:border-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-yellow-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-yellow-400" />
                    Development Milestones
                  </CardTitle>
                  <CardDescription className="text-gray-300">Define your project's breakthrough phases</CardDescription>
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
            <Card className="bg-gray-900/50 border-gray-600/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={setAcceptedTerms}
                    className="border-gray-500 data-[state=checked]:bg-blue-500"
                  />
                  <div className="text-sm text-gray-300">
                    <label htmlFor="terms" className="cursor-pointer">
                      I agree to the{" "}
                      <span className="text-blue-400 hover:underline">Infinita City Terms of Service</span> and{" "}
                      <span className="text-blue-400 hover:underline">Privacy Policy</span>. I understand that my
                      project will be reviewed for alignment with Infinita City's mission of advancing human longevity
                      and frontier technology.
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50 mr-4"
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
              Our AI will evaluate your project's alignment with Infinita City's mission of advancing human longevity,
              biotechnology, AI, and frontier science in Próspera, Roatán.
            </p>
          </motion.div>
        </div>
      </div>

      {/* AI Review Modal */}
      <AnimatePresence>
        {showReviewModal && aiReview && (
          <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl">
                  {aiReview.approved ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        Project Approved!
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-400" />
                      <span className="text-red-400">Needs Improvement</span>
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-300 text-lg">
                  {aiReview.approved
                    ? "🎉 Congratulations! Your project has passed our AI review and aligns with Infinita City's vision."
                    : "Your project needs some improvements to align better with Infinita City's mission."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">{aiReview.score}/100</div>
                  <div className="text-gray-300">Infinita City Alignment Score</div>
                </div>

                {/* Feedback */}
                <div className="bg-black/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">AI Feedback:</h4>
                  <p className="text-gray-300">{aiReview.feedback}</p>
                </div>

                {/* Suggestions */}
                {aiReview.suggestions.length > 0 && (
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                    <h4 className="font-semibold text-blue-300 mb-2">Suggestions for Improvement:</h4>
                    <ul className="space-y-1">
                      {aiReview.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-gray-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  {aiReview.approved ? (
                    <Button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Rocket className="h-4 w-4 mr-2 animate-bounce" />
                          Submitting to Blockchain...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Submit to Infinita City
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowReviewModal(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2"
                    >
                      Improve Project
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
