"use client"

import { Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Trait {
  id: string
  type: string
  value: string
}

interface TraitInputProps {
  traits: Trait[]
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, field: "type" | "value", value: string) => void
}

export function TraitInput({ traits, onAdd, onRemove, onChange }: TraitInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Traits</h3>
          <p className="text-sm text-gray-400">
            Traits describe attributes of your item. They appear as filters inside your collection page.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add trait
        </motion.button>
      </div>

      <AnimatePresence>
        {traits.map((trait) => (
          <motion.div
            key={trait.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-4"
          >
            <input
              type="text"
              placeholder="Type"
              value={trait.type}
              onChange={(e) => onChange(trait.id, "type", e.target.value)}
              className="flex-1 bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Value"
              value={trait.value}
              onChange={(e) => onChange(trait.id, "value", e.target.value)}
              className="flex-1 bg-white/5 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onRemove(trait.id)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

