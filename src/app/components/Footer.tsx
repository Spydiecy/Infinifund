"use client"

import { motion } from "framer-motion"
import { Bitcoin, Instagram, Linkedin, Twitter, Github } from "lucide-react"
import Link from "next/link"

const footerSections = {
  marketplace: {
    title: "Hackathons",
    items: [
      { name: "View Hacks", href: "/hackathons" },
      { name: "Create Hacks", href: "/create-hack" },
      { name: "Latest Hacks", href: "/hackathons/0" },
    ],
  },
  myAccount: {
    title: "Builds",
    items: [
      { name: "My Builds", href: "/my-builds" },
      { name: "Create Build", href: "/create-build" },
      { name: "Submit Build", href: "/hackathons/0" },
    ],
  },
  resources: {
    title: "About",
    items: [
      { name: "About", href: "/about" },
      { name: "Terms & Conditions", href: "/termsAndConditions" },
      { name: "User Profile", href: "/userProfile" },
    ],
  },
}

const socialLinks = [
  { icon: Instagram, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Linkedin, href: "#" },
  { icon: Github, href: "https://github.com/namanbansal102/NeuraSkill" },
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
            <Bitcoin className="w-8 h-8" />
            <span className="text-xl font-bold">NeuraSkill</span>
          </Link>
          <p className="text-gray-400 mb-6">
          NeurAKill is a revolutionary blockchain-based hackathon management platform built on the Flow chain
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
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
      </motion.div>

      {/* Copyright */}
      <motion.div
        variants={itemVariants}
        className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center text-gray-400"
      >
        <p>© 2025 NeuraSkill. All rights reserved</p>
      </motion.div>
    </footer>
  )
}

