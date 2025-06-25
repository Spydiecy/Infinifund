"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Award, Code, Users, Zap, DollarSign, Brain } from "lucide-react"
import Link from "next/link"
import type React from "react" // Import React
import { Sparkles } from "../components/HomePageComponents/sparkles"

export default function AboutUs() {
  return (
    <div className="min-h-screen pt-20 text-white p-8  z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-8 text-center">About NeurAKill</h1>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 shadow-xl">
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg mb-4">
            NeuraSKill is a revolutionary blockchain-based hackathon management platform build. We aim
            to transform the way hackathons are conducted, making them more transparent, fair, and rewarding for all
            participants.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <FeatureCard icon={<Award className="w-8 h-8" />} title="Prize Pool Hackathons">
            Host hackathons with customizable prize pools, attracting top talent from around the world.
          </FeatureCard>
          <FeatureCard icon={<Code className="w-8 h-8" />} title="Open Source Bidding">
            Unique bidding system for open-source projects, fostering collaboration and innovation.
          </FeatureCard>
          <FeatureCard icon={<Users className="w-8 h-8" />} title="Community-Driven">
            Users can create, submit, and upvote projects, ensuring the best ideas rise to the top.
          </FeatureCard>
          <FeatureCard icon={<Brain className="w-8 h-8" />} title="AI-Powered Reviews">
            Cutting-edge AI technology assists in reviewing and evaluating submitted projects.
          </FeatureCard>
          <FeatureCard icon={<Zap className="w-8 h-8" />} title="Automatic Rewards">
            Seamless distribution of rewards to winners' MetaMask wallets in XRP.
          </FeatureCard>
          <FeatureCard icon={<DollarSign className="w-8 h-8" />} title="Transparent Funding">
            Blockchain-based transactions ensure full transparency in prize distribution.
          </FeatureCard>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 shadow-xl">
          <h2 className="text-3xl font-semibold mb-4">Meet the Founder</h2>
          <div className="flex items-center space-x-4">
            <img src="https://avatars.githubusercontent.com/u/131576334?v=4" alt="Naman Bansal" className="w-24 h-24 rounded-full" />
            <div>
              <h3 className="text-2xl font-semibold">Naman Bansal</h3>
              <p className="text-lg mb-2">Visionary & Founder</p>
              <div className="flex space-x-2">
                <Link href="https://github.com/namanbansal102" className="hover:text-blue-300 transition-colors">
                  <Github className="w-6 h-6" />
                </Link>
                <Link href="https://www.linkedin.com/in/naman-bansal-b780b3255/" className="hover:text-blue-300 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="https://www.linkedin.com/in/naman-bansal-b780b3255/"
            className="inline-block bg-white text-purple-700 px-8 py-3 rounded-full font-semibold hover:bg-purple-100 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function FeatureCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-semibold ml-2">{title}</h3>
      </div>
      <p>{children}</p>
    </motion.div>
  )
}

