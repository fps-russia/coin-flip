"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface CoinFlipAnimationProps {
  isFlipping: boolean
  result: "heads" | "tails" | null
}

export default function CoinFlipAnimation({ isFlipping, result }: CoinFlipAnimationProps) {
  const [rotations, setRotations] = useState(0)

  useEffect(() => {
    if (isFlipping) {
      // Random number of rotations between 5 and 10
      setRotations(Math.floor(Math.random() * 5) + 5)
    }
  }, [isFlipping])

  return (
    <div className="relative h-48 w-48 perspective-1000">
      <motion.div
        className="relative h-full w-full transform-style-3d"
        animate={{
          rotateX: isFlipping ? [0, rotations * 180 + (result === "heads" ? 0 : 180)] : result === "heads" ? 0 : 180,
        }}
        transition={{
          duration: isFlipping ? 3 : 0.5,
          ease: "easeOut",
        }}
      >
        {/* Heads side */}
        <div className="absolute h-full w-full rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 backface-hidden flex items-center justify-center shadow-lg">
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center">
            <div className="text-3xl font-bold text-yellow-800">H</div>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-yellow-600"></div>
        </div>

        {/* Tails side */}
        <div className="absolute h-full w-full rounded-full bg-gradient-to-r from-gray-300 to-gray-500 backface-hidden flex items-center justify-center shadow-lg rotate-x-180">
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
            <div className="text-3xl font-bold text-gray-800">T</div>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-gray-600"></div>
        </div>
      </motion.div>

      {/* Shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-4 w-32 rounded-full bg-black/30 blur-md"
        animate={{
          width: isFlipping ? [128, 80, 128] : 128,
          opacity: isFlipping ? [0.3, 0.1, 0.3] : 0.3,
        }}
        transition={{
          duration: isFlipping ? 3 : 0.5,
          ease: "easeOut",
        }}
      />
    </div>
  )
}
