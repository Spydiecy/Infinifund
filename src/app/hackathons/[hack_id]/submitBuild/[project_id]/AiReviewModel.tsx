import { motion, AnimatePresence } from "framer-motion"
import type React from "react" // Added import for React

interface AIReviewModalProps {
  isOpen: boolean
  onClose: () => void
  score: number
}

export const AIReviewModal: React.FC<AIReviewModalProps> = ({ isOpen, onClose, score }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">AI Review Result</h2>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500 mb-4">{score}/10</p>
              <p className="text-gray-300">
                {score >= 8
                  ? "Excellent work! Your project shows great potential."
                  : score >= 6
                    ? "Good job! There's room for improvement, but you're on the right track."
                    : "Keep working on your project. There's potential for growth."}
              </p>
            </div>
            <button
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

