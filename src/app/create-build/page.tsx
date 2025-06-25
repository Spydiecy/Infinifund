"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Web3 from "web3"
import { PinataSDK } from "pinata";
import { FileUpload } from "../components/file-upload"
import { TraitInput } from "../components/trait-input"
import ABI from "../ABI.json"
import { TypewriterEffectSmoothDemo } from "./effect"
import toast from "react-hot-toast"
import { FaGithub, FaEthereum } from "react-icons/fa"
import Image from "next/image"
import { AbiItem } from 'web3-utils';
import fetchContract from "../components/fetchContract";
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_KEY,
  pinataGateway: "example-gateway.mypinata.cloud",
});
let  contract=fetchContract();
let web3;
if (typeof window !== "undefined") {
  web3 = new Web3(window.ethereum)
}


interface Trait {
  id: string
  type: string
  value: string
}

interface TeamMember {
  id: string
  address: string
}

interface FormData {
  collection: string
  name: string
  description: string
  techStack: string
  mode: string
  projectGithub: string
  teamMembers: number
}

const initialFormData: FormData = {
  collection: "",
  name: "",
  description: "",
  techStack: "",
  mode: "YES",
  projectGithub: "",
  teamMembers: 1
}

export default function CreateNFT() {
  const [file, setFile] = useState<File | null>(null)
  const [traits, setTraits] = useState<Trait[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ id: "0", address: "" }])
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const totalMembers = formData.teamMembers
    setTeamMembers((prevMembers) => {
      const newMembers = Array(totalMembers)
        .fill(null)
        .map((_, index) => ({
          id: index.toString(),
          address: prevMembers[index]?.address || "",
        }))
      return newMembers
    })
  }, [formData.teamMembers])

  const handleAddTrait = () => {
    setTraits([...traits, { id: Math.random().toString(), type: "", value: "" }])
  }

  const handleRemoveTrait = (id: string) => {
    setTraits(traits.filter((trait) => trait.id !== id))
  }

  const handleTraitChange = (id: string, field: "type" | "value", value: string) => {
    setTraits(traits.map((trait) => (trait.id === id ? { ...trait, [field]: value } : trait)))
  }

  const handleTeamMemberChange = (id: string, address: string) => {
    setTeamMembers(teamMembers.map((member) => (member.id === id ? { ...member, address } : member)))
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask to continue")
      return
    }

    if (!formData.name || !formData.description || !file) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      const userAddress = accounts[0]
      
      const imageUrl = URL.createObjectURL(file)
      const pinataHash=await pinata.upload.file(file);
      const tx = await contract.methods
        .createBuild(
          formData.name,
          formData.techStack,
          formData.description,
          pinataHash.cid,
          formData.projectGithub,
          teamMembers.map(member => member.address)
        )
        .send({
          from: userAddress,
          gasLimit: 3000000,
        })

      toast.success("Build Created successfully!")
      console.log("Transaction:", tx)
    } catch (err: any) {
      toast.error(err.message || "Error creating build")
      console.error("Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex bg-[#04111d]">
      <div className="w-[50vw] mt-40 px-6">
        <TypewriterEffectSmoothDemo />
        <FileUpload onFileSelect={setFile} />
      </div>
      <div className="min-h-screen text-white p-8 mt-16 w-[50vw]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <p className="text-gray-400 mb-8">
            Once your build is minted you will not be able to change any of its information.
          </p>
          <div className="grid gap-8">
            <div className="space-y-6">
              <div>
                <label className="block mb-2">
                  Collection <span className="text-red-500">(Feature To Be Implemented Soon)</span>
                </label>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-lg">+</span>
                  Create a new collection
                </motion.button>
              </div>
    
              {/* Form Fields */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">
                  Build Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Build Name"
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">
                  Tech Stack Used<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => handleInputChange("techStack", e.target.value)}
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mention The Tech Stack "
                />
              </motion.div>
        
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full h-32 bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter build description"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Project Github URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.projectGithub}
                    onChange={(e) => handleInputChange("projectGithub", e.target.value)}
                    className="w-full bg-white/5 border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/repository"
                  />
                  <FaGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Completely On Blockchain</label>
                <select
                  onChange={(e) => handleInputChange("mode", e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Number of Team Members</label>
                <input
                  type="number"
                  value={formData.teamMembers}
                  onChange={(e) => handleInputChange("teamMembers", Math.max(1, Math.min(3, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="3"
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>

              {/* Team Members */}
              {teamMembers.map((member, index) => (
                <motion.div key={member.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block mb-2">Team Member {index + 1} (MetaMask Address)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={member.address}
                      onChange={(e) => handleTeamMemberChange(member.id, e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-white/5 border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaEthereum className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </motion.div>
              ))}

              <TraitInput
                traits={traits}
                onAdd={handleAddTrait}
                onRemove={handleRemoveTrait}
                onChange={handleTraitChange}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg  disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Build..." : "Create Your Build"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
