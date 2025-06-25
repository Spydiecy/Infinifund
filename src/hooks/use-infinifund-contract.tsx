"use client"

import { useState, useEffect } from "react"
import { InfinifundContract } from "@/lib/infinifund-contract"

export const useInfinifundContract = () => {
  const [infinifundContract, setInfinifundContract] = useState<InfinifundContract | null>(null)

  useEffect(() => {
    setInfinifundContract(new InfinifundContract())
  }, [])

  return infinifundContract
}
