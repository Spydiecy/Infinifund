"use client"

import { motion } from "framer-motion"
import { Bitcoin, Instagram, Linkedin, Twitter, Github } from "lucide-react"
import Link from "next/link"
import logo from "./logo.jpg"

const footerSections = {
  projects: {
    title: "Projects",
    items: [
      { name: "Browse Projects", href: "/projects" },
      { name: "Submit Project", href: "/create-project" },
    ],
  },
  community: {
    title: "Community",
    items: [
      { name: "My Projects", href: "/my-projects" },
      { name: "Investors", href: "/investors" },
      { name: "Apply Citizenship", href: "/citizenship" },
    ],
  },
  about: {
    title: "About",
    items: [
      { name: "Infinita City", href: "/about" },
      { name: "Terms & Conditions", href: "/termsAndConditions" },
      { name: "User Profile", href: "/userProfile" },
    ],
  },
}

const socialLinks = [
  { icon: Twitter, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Github, href: "https://github.com/your-username/Infinifund" },
]

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <footer className="bg-black text-white py-16 px-6">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <img src={logo.src || "/favicon.ico"} alt="InfiniFund" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold">InfiniFund</span>
          </Link>
          <p className="text-gray-400">
          Infinifund is a revolutionary blockchain-based project funding platform powering breakthrough research in longevity, biotech, and frontier science in Infinita City.
          </p>
        </motion.div>

        {/* Footer Sections */}
        {Object.entries(footerSections).map(([key, section]) => (
          <motion.div key={key} variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            <ul className="space-y-2">
              {section.items.map((item, index) => (
                <motion.li key={index} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Social Links Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-lg font-semibold">Follow Us</h3>
          <div className="flex flex-col gap-3">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-colors group"
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  {social.icon === Instagram ? 'Instagram' : 
                   social.icon === Twitter ? 'Twitter' : 
                   social.icon === Linkedin ? 'LinkedIn' : 
                   social.icon === Github ? 'GitHub' : 'Social'}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Copyright */}
      <motion.div
        variants={itemVariants}
        className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center text-gray-400"
      >
        <p>© 2025 Infinifund. Advancing human longevity in Infinita City, Próspera. All rights reserved.</p>
      </motion.div>
    </footer>
  )
}

