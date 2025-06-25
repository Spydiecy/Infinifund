"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

const drops = [
  {
    id: 1,
    title: "Felly - Sweet Unknowns",
    image: "/placeholder.svg?height=400&width=400",
    minting: "Now",
    price: "0.25 ETH",
    isOnchain: true,
  },
  {
    id: 2,
    title: "RXALITI",
    image: "/placeholder.svg?height=400&width=400",
    minting: "Now",
    price: "0.25 ETH",
  },
  {
    id: 3,
    title: "Characters",
    image: "/placeholder.svg?height=400&width=400",
    minting: "Now",
    price: "0.0125 ETH",
  },
  {
    id: 4,
    title: "Chromatic Flux",
    image: "/placeholder.svg?height=400&width=400",
    minting: "Now",
    price: "0.01 ETH",
  },
  {
    id: 5,
    title: "History of brick",
    image: "/placeholder.svg?height=400&width=400",
    minting: "Now",
    price: "0.007 ETH",
  },
  {
    id: 6,
    title: "Espresso Expressions",
    image: "/placeholder.svg?height=400&width=400",
    minting: "Now",
    price: "0.01 ETH",
  },
]

export default function DropsPage() {
  const [activeTab, setActiveTab] = useState("active")

  return (
    <div className="min-h-screen bg-[#04111d] text-white p-8">
      <h1 className="text-5xl font-bold mb-8">Drops</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === "active" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Active & upcoming
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === "past" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Past
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drops.map((drop) => (
          <motion.div
            key={drop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
          >
            {/* Image */}
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={drop.image || "/placeholder.svg"}
                alt={drop.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {drop.isOnchain && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-300" />
                  Onchain Daily
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-4">{drop.title}</h3>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-400">Minting</p>
                  <p className="font-medium">{drop.minting}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="font-medium">{drop.price}</p>
                </div>
              </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
              <motion.button
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                className="bg-white text-black font-semibold px-6 py-2 rounded-lg"
              >
                View Drop
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

