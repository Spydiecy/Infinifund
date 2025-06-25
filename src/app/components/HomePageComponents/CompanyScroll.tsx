"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const companies = [
  { name: "Versatile", logo: "https://static-files.risein.com/Homepage-Sui.png" },
  { name: "Circle", logo: "https://static-files.risein.com/Circle.png" },
  { name: "Paribuhub", logo: "https://static-files.risein.com/Homepage-SolanaFoundation.png" },
  { name: "Edu Chain", logo: "https://static-files.risein.com/animoca.png" },
  { name: "Aptos", logo: "https://static-files.risein.com/Homepage-Sui.png" },
]

// Duplicate the companies for smooth looping
const scrollingCompanies = [...companies, ...companies]

export function CompanyScroll() {
  return (
    <div className="absloute w-full overflow-hidden bg-transparent  top">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-100%" }} // Move fully left
        transition={{
          duration: 15, // Adjust speed
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className="flex gap-16 whitespace-nowrap"
      >
        {scrollingCompanies.map((company, idx) => (
          <div key={idx} className="flex items-center justify-center w-[200px] h-20">
            <Image
              src={company.logo || "/placeholder.svg"}
              alt={company.name}
              width={120}
              height={40}
              className="object-contain brightness-200 hover:brightness-100 transition-all duration-300"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
