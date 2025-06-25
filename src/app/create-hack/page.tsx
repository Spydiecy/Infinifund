"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PinataSDK } from "pinata";
import Web3 from "web3"
import { FileUpload } from "../components/file-upload"
import { TraitInput } from "../components/trait-input"
import ABI from "../ABI.json";
import { AbiItem } from 'web3-utils';
import { TypewriterEffectSmoothDemo } from "./effect"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation";
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

interface Prize {
  id: string
  amount: string
}

interface FormData {
  collection: string
  name: string
  supply: number
  description: string
  externalLink: string
  startDate: string
  endDate: string
  mode: "online" | "irl"
  prizePool: string
  totalPrizes: number
}

const initialFormData: FormData = {
  collection: "",
  name: "",
  supply: 1,
  description: "",
  externalLink: "",
  startDate: "",
  endDate: "",
  mode: "online",
  prizePool: "0",
  totalPrizes: 0,
}

export default function CreateNFT() {
  const [file, setFile] = useState<File | null>(null)
  const [traits, setTraits] = useState<Trait[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([{ id: "0", amount: "0" }])
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router=useRouter();
  
  useEffect(() => {
    const totalPrizes = formData.totalPrizes
    setPrizes((prevPrizes) => {
      const newPrizes = Array(totalPrizes)
        .fill(null)
        .map((_, index) => ({
          id: index.toString(),
          amount: prevPrizes[index]?.amount || "0",
        }))
      return newPrizes
    })
  }, [formData.totalPrizes])

  const handleAddTrait = () => {
    setTraits([...traits, { id: Math.random().toString(), type: "", value: "" }])
  }

  const handleRemoveTrait = (id: string) => {
    setTraits(traits.filter((trait) => trait.id !== id))
  }

  const handleTraitChange = (id: string, field: "type" | "value", value: string) => {
    setTraits(traits.map((trait) => (trait.id === id ? { ...trait, [field]: value } : trait)))
  }

  const handlePrizeChange = (id: string, amount: string) => {
    setPrizes(prizes.map((prize) => (prize.id === id ? { ...prize, amount } : prize)))
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

    // if (!formData.name || !formData.description || !file) {
    //   toast.error("Please fill in all required fields")
    //   return
    // }

    setIsSubmitting(true)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      const userAddress = accounts[0]
      console.log("My User Address is::::"+userAddress);
      
      // Convert prize amounts to wei
      console.log("My formdata prize pool is::::",formData.prizePool);
      
      const prizePoolWei = web3.utils.toWei(formData.prizePool.toString(), "ether");
      const prizePoolArray = prizes.map((prize) =>web3.utils.toWei(prize.amount.toString(), "ether"))
      console.log("My FormData is::::::",formData);
      console.log(prizePoolWei);
      console.log(prizePoolArray);
      console.log(typeof formData.totalPrizes);
      const totalPrizePool = prizePoolArray.reduce(
        (a:any, b:any) => web3.utils.toBN(a).add(web3.utils.toBN(b)), 
        web3.utils.toBN("0")
      );
      
      // Verify total matches prize pool
      if (!totalPrizePool.eq(web3.utils.toBN(prizePoolWei))) {
        throw new Error("Total of individual prizes must equal the prize pool");
      }
      console.log("My Prize pool wei is:::",prizePoolWei);
      console.log("My Prize pool wei is:::",prizePoolArray);
      let imageUrl="";
      let pinataHash={cid:""};
      if (file!=null) {
        
        imageUrl = URL.createObjectURL(file)
        pinataHash=await pinata.upload.file(file);
      }
      // console.log("My Pinata hash is:::::::",pinataHash.cid);
      
      // Call contract function
      const tx = await contract.methods
        .registerHackathon(
          formData.name,
          pinataHash.cid,
          formData.description,
          prizePoolWei,
          formData.startDate,
          formData.endDate,
          formData.mode,
          Number(formData.totalPrizes),
          prizePoolArray
        )
        .send({
          from: userAddress,
           
          value: prizePoolWei,
          gasLimit: 3000000,
        })

      toast.success("Hackathon registered successfully!")
      router.push('/hackathons')
      console.log("Transaction:", tx)
    } catch (err: any) {
      toast.error(err.message || "Error registering hackathon")
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
            Once your hackathon is minted you will not be able to change any of its information.
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
              </div>......
              {/* Form Fields */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">
                  Hackathon Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hackathon title"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">
                  Prize Pool (We have to pass value in ether) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prizePool}
                  onChange={(e) => handleInputChange("prizePool", e.target.value)}
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total prize pool in XRP"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full h-32 bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hackathon description"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Demo Link</label>
                <input
                  type="text"
                  value={formData.externalLink}
                  onChange={(e) => handleInputChange("externalLink", e.target.value)}
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://hackathon.io/event/123"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => handleInputChange("mode", e.target.value as "online" | "irl")}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="online">Online</option>
                  <option value="irl">IRL</option>
                </select>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block mb-2">Number of Prizes</label>
                <input
                  type="number"
                  value={formData.totalPrizes}
                  onChange={(e) => handleInputChange("totalPrizes", Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </motion.div>

              {/* Prize Distribution */}
              {prizes.map((prize, index) => (
                <motion.div key={prize.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block mb-2">Prize {index + 1} Amount (ETH)</label>
                  <input
                    type="text"
                    value={prize.amount}
                    onChange={(e) => handlePrizeChange(prize.id, e.target.value)}
                    placeholder={`Enter amount for prize ${index + 1}`}
                    className="w-full bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                className="w-full text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm shadow-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Hackathon..." : "Create Hackathon NFT"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}