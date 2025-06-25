"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Trash2, Brain, Award, ThumbsUp, Lock, Scale, FileText } from "lucide-react"
import Link from "next/link"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br pt-24 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-8 text-center">Terms and Conditions</h1>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 shadow-xl">
          <h2 className="text-3xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2" />
            General Terms
          </h2>
          <p className="text-lg mb-4">
            Welcome to NeurAKill. By using our platform, you agree to comply with and be bound by the following terms
            and conditions.
          </p>
        </div>

        <div className="grid gap-8 mb-8">
          <TermSection icon={<Trash2 className="w-8 h-8" />} title="Immutability of Builds">
            Once a build is submitted to a hackathon on NeurAKill, it cannot be deleted. This ensures the integrity and
            fairness of the competition. Please ensure your submissions are final before uploading.
          </TermSection>

          <TermSection icon={<Brain className="w-8 h-8" />} title="AI-Powered Fairness">
            NeurAKill utilizes the Gemini Flash experimental model for project evaluation. This cutting-edge AI
            technology ensures fair and unbiased assessment of all submitted projects.
          </TermSection>

          <TermSection icon={<Award className="w-8 h-8" />} title="Prize Pool Distribution">
            The prize pool for each hackathon will be distributed exclusively to the winners. The distribution mechanism
            is automated and based on the final rankings determined by our AI system and community voting.
          </TermSection>

          <TermSection icon={<ThumbsUp className="w-8 h-8" />} title="Upvoting System">
            A minimum of +5 upvotes is required for a project to be considered a winner. Once applied, these upvotes
            cannot be changed or removed. This system ensures community engagement and prevents last-minute
            manipulation.
          </TermSection>

          <TermSection icon={<Lock className="w-8 h-8" />} title="Fund Management">
            For projects that do not win but receive upvotes, any associated funds will remain in the NeurAKill smart
            contract. These funds are not redistributed and are used to maintain the platform's integrity and
            sustainability.
          </TermSection>

          <TermSection icon={<Scale className="w-8 h-8" />} title="Legal Compliance">
            Users are responsible for ensuring their submissions comply with all applicable laws and regulations.
            NeurAKill reserves the right to remove any content that violates these terms or any applicable laws.
          </TermSection>
        </div>

        <motion.div className="text-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/"
            className="inline-block bg-white text-purple-700 px-8 py-3 rounded-full font-semibold hover:bg-purple-100 transition-colors"
          >
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

function TermSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg">
      <motion.div
        className="flex items-center mb-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {icon}
        <h3 className="text-xl font-semibold ml-2">{title}</h3>
      </motion.div>
      <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        {children}
      </motion.p>
    </motion.div>
  )
}

