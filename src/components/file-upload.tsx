"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  accept?: string
  maxSize?: number
  label?: string
  preview?: boolean
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  label = "Upload Image",
  preview = true,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview_url, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = useCallback(
    (selectedFile: File) => {
      if (selectedFile.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
        return
      }

      setFile(selectedFile)
      onFileSelect(selectedFile)

      if (preview && selectedFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
      }
    },
    [maxSize, onFileSelect, preview],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0])
      }
    },
    [handleFile],
  )

  const removeFile = useCallback(() => {
    setFile(null)
    setPreviewUrl(null)
    onFileSelect(null)
    if (preview_url) {
      URL.revokeObjectURL(preview_url)
    }
  }, [onFileSelect, preview_url])

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>

      {!file ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
            dragActive
              ? "border-blue-400 bg-blue-500/10 scale-105"
              : "border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload
            className={`mx-auto h-12 w-12 mb-4 transition-colors ${dragActive ? "text-blue-400" : "text-gray-400"}`}
          />
          <p className="text-gray-300 mb-2">Drag and drop your file here, or click to select</p>
          <p className="text-sm text-gray-500">Max file size: {maxSize / (1024 * 1024)}MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          {preview_url && (
            <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden border border-gray-600">
              <Image src={preview_url || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-3">
              <ImageIcon className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
