"use client"

import { motion } from "framer-motion"
import { Heart, Eye, Share2, MoreHorizontal, Check, EclipseIcon as Ethereum, Github } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Web3 from "web3"
import { CardHoverEffectDemo } from "../../CardHoverEffectDemo"
import ABI from "../../../../ABI.json"
import { useParams, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { CarouselDemo } from "../../carouse."
import fetchImageUrl from "@/app/components/fetchImageUrl"
import Link from "next/link"
import { Loader } from "../../../../components/ui/loader"

let web3
import { AbiItem } from 'web3-utils';
import fetchContract from "@/app/components/fetchContract"
let  contract=fetchContract();
if (typeof window !== "undefined") { 
  web3 = new Web3(window.ethereum)
}

interface BuildDetails {
  upvotes: number
  name: string
  techStack: string
  desc: string
  video_url: string
  github_id: string
  team: string[]
  github_url: string
}

export default function NFTDetails() {
  const searchParams = useParams()
  const router=useRouter();
  const [imgUrl, setImgUrl] = useState(
    "https://images.unsplash.com/photo-1639322537228-f710d846310a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmxvY2tjaGFpbnxlbnwwfHwwfHx8MA%3D%3D",
  )
  const [hackDetails, setHackDetails] = useState<BuildDetails>({
    upvotes: 0,
    name: "NeoxLifeChain",
    techStack: "Next React BERN",
    desc: "NeoxLifeChain is a revolutionary blockchain-based healthcare management system that securely stores and manages patient records, streamlines medical processes, and enhances data interoperability among healthcare providers.",
    video_url: "",
    github_id: "",
    team: ["0x1234...5678", "0x5678...9ABC", "0x9ABC...DEF0"],
    github_url: "",
  })
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    fetchBuild()
    setImageLoading(true)
  }, [])

  const fetchBuild = async () => {
    try {
      const project_id = Number(searchParams.project_id)
      const build_data = await contract.methods.fetch_build(project_id).call()

      setImgUrl(await fetchImageUrl(build_data.video_url))
      console.log("My Build Data Running is:::::::", build_data)
      setHackDetails({
        ...build_data,
        github_url: build_data.github_id, // Assuming github_id is the GitHub URL
      })
    } catch (error) {
      console.log("ERror is :::", error)

      toast.error("Error fetching build details")
    }
  }
  const upvoteProjects = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      const userAddress = accounts[0]
      const hack_id = Number(searchParams.hack_id)
      const project_id = Number(searchParams.project_id)
      const tx = await contract.methods.upvoteProject(hack_id, project_id).send({
        from: userAddress,
        value: 2,
        gasLimit: 3000000,
      })
      toast.success("Project upvoted successfully!")
      router.refresh();
    } catch (error) {
      toast.error("Error upvoting project")
    }
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  const glowEffect = {
    initial: { boxShadow: "0 0 0 rgba(59, 130, 246, 0)" },
    animate: {
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.3)",
        "0 0 40px rgba(168, 85, 247, 0.4)",
        "0 0 20px rgba(59, 130, 246, 0.3)",
      ],
    },
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
    },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <motion.div {...fadeIn} className="rounded-2xl overflow-hidden border border-gray-800 relative">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <Loader className="w-8 h-8 text-blue-500" />
            </div>
          )}
          <Image
            src={imgUrl || "/placeholder.svg"}
            alt={hackDetails.name}
            width={1000}
            height={1000}
            className="w-full h-auto transition-all duration-300 hover:scale-95 hover:opacity-80"
            onLoadingComplete={() => setImageLoading(false)}
          />
        </motion.div>

        {/* Right Column - Details */}
        <motion.div {...fadeIn} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{hackDetails.name}</h1>
              <div className="flex items-center gap-4 text-gray-400 mt-2">
                <span className="flex items-center gap-1">
                  <Heart size={16} />
                  {hackDetails.upvotes} upvotes
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                <Share2 size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              >
                <MoreHorizontal size={20} />
              </motion.button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300">{hackDetails.desc}</p>

          {/* Technologies Used */}
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Technologies Used</h2>
            <div className="flex flex-wrap gap-2">
              {hackDetails.techStack.split(" ").map((tech, index) => (
                <span key={index} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Project Links */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-600">Project Links</h2>
            <div className="flex flex-wrap gap-4">
              <Link href={hackDetails.github_url} target="_blank" rel="noopener noreferrer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                  <Github size={20} />
                  <span>GitHub Repository</span>
                </motion.button>
              </Link>
              <Link href={hackDetails.video_url} target="_blank" rel="noopener noreferrer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                  <Eye size={20} />
                  <span>Watch Demo Video</span>
                </motion.button>
              </Link>
            </div>
          </div>

          {/* GitHub Div */}
          {/* Team Members */}
          <motion.div className="bg-gray-900 rounded-xl p-6 border border-gray-800" {...fadeIn}>
            <h2 className="text-xl font-bold mb-4">Team Members</h2>
            <div className="space-y-4">
              {hackDetails.team.map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ethereum className="text-blue-500" />
                    <span>{member}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">Verified</span>
                    <Check className="text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.button
            
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={upvoteProjects}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold relative overflow-hidden"
          >
            <span className="relative z-10">Upvote Project (2 Wei)</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-50"
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            />
          </motion.button>
          {/* Upvote Button */}
         
        </motion.div>
      </div>

      {/* Latest Builds Section */}
      <div className="mt-16">
        <h2 className="text-5xl font-bold text-center mb-8">
          Explore More<span className="text-blue-600">Hacks</span>
        </h2>
        <CarouselDemo></CarouselDemo>
      </div>
    </div>
  )
}

