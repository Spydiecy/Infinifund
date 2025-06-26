"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import one from "../.../../../../../public/sponsor-images/1.png";
import two from "../.../../../../../public/sponsor-images/2.png";
import three from "../.../../../../../public/sponsor-images/3.png";
import four from "../.../../../../../public/sponsor-images/4.png";
import five from "../.../../../../../public/sponsor-images/5.png";
import six from "../.../../../../../public/sponsor-images/6.png";

const companies = [
  { name: "Versatile", logo:one.src },
  { name: "Circle", logo: two.src },
  { name: "Paribuhub", logo: three.src },
  { name: "Edu Chain", logo: four.src },
  { name: "Aptos", logo: five.src },
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
