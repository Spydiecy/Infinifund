"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X } from 'lucide-react'
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)
      const file = acceptedFiles[0]

      if (file.size > 50 * 1024 * 1024) {
        // 50MB
        setError("File size must be less than 50MB")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onFileSelect(file)
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      "video/*": [".mp4"],
      "application/svg+xml": [".svg"],
    },
    maxFiles: 1,
  })

  const dropzoneProps = getRootProps()

  return (
    <div className="relative">
      <motion.div
        className={`border-2 border-dashed rounded-xl h-[400px] flex items-center justify-center cursor-pointer
          ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"}`}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={dropzoneProps.onClick}
        onKeyDown={dropzoneProps.onKeyDown}
        tabIndex={dropzoneProps.tabIndex}
        onFocus={dropzoneProps.onFocus}
        onBlur={dropzoneProps.onBlur}
        onDragEnter={dropzoneProps.onDragEnter}
        onDragOver={dropzoneProps.onDragOver}
        onDragLeave={dropzoneProps.onDragLeave}
        onDrop={dropzoneProps.onDrop}
      >
        <input {...getInputProps()} />
        <AnimatePresence>
          {preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setPreview(null)
                }}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center p-6"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">Drag and drop media</p>
              <p className="text-sm text-gray-400 mb-2">JPG, PNG, GIF, SVG, MP4</p>
              <p className="text-xs text-gray-500">Max size: 50MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {error && (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-2">
          {error}
        </motion.p>
      )}
    </div>
  )
}