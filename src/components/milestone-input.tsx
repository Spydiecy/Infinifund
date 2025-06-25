"use client"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Milestone {
  id: string
  description: string
}

interface MilestoneInputProps {
  milestones: Milestone[]
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (id: string, description: string) => void
}

export function MilestoneInput({ milestones, onAdd, onRemove, onChange }: MilestoneInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Project Milestones <span className="text-red-400">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          className="bg-black/50 border-gray-600 text-white hover:bg-blue-500/10 hover:border-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {milestones.length === 0 && (
        <p className="text-sm text-gray-400 italic">Add at least one milestone to describe your breakthrough phases</p>
      )}

      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="flex gap-3 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-blue-300">Phase {index + 1}</span>
                {milestones.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(milestone.id)}
                    className="text-red-400 hover:text-red-300 p-1 h-auto hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Textarea
                value={milestone.description}
                onChange={(e) => onChange(milestone.id, e.target.value)}
                placeholder={`Describe breakthrough phase ${index + 1}...`}
                className="bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
