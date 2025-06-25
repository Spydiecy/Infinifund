"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import { LogOut, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UserProfile() {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
    const router=useRouter();
  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" })
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setAddress(address)

          const balance = await provider.getBalance(address)
          setBalance(ethers.formatEther(balance))
        } catch (error) {
          console.error("Error connecting to MetaMask", error)
        }
      }
    }

    connectWallet()
  }, [])

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logged out")
    window.location.reload();
    
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          User Profile
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/2048px-MetaMask_Fox.svg.png" alt="MetaMask" className="w-8 h-8 mr-2" />
              <h2 className="text-2xl font-semibold">MetaMask Info</h2>
            </div>
            <p className="mb-2">
              <span className="font-semibold">Address:</span>{" "}
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
            </p>
            <p>
              <span className="font-semibold">Balance:</span>{" "}
              {balance ? `${Number.parseFloat(balance).toFixed(4)} XRP` : "N/A"}
            </p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Profile</h2>
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4"></div>
            <button onClick={handleLogout} className="w-full bg-white/20 hover:bg-white/30 transition-colors duration-300 rounded-lg py-2 px-4">
              Update MetaMask Address
            </button>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Terms and Conditions</h2>
          <p className="text-sm text-gray-300 mb-4">
            By using this service, you agree to our Terms of Service and Privacy Policy. Please read these documents
            carefully.
          </p>
          <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-300 flex items-center">
            Read full terms <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <button
            onClick={handleLogout}
            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-bold rounded-lg"
          >
            <span className="absolute inset-0 w-full h-full transition duration-300 ease-out opacity-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 group-hover:opacity-100"></span>
            <span className="absolute top-0 left-0 w-full bg-gradient-to-b from-white to-transparent opacity-5 h-1/3"></span>
            <span className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white to-transparent opacity-5"></span>
            <span className="absolute bottom-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent opacity-5"></span>
            <span className="absolute bottom-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent opacity-5"></span>
            <span className="absolute inset-0 w-full h-full border border-white rounded-lg opacity-10"></span>
            <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-5"></span>
            <span className="relative flex items-center">
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

