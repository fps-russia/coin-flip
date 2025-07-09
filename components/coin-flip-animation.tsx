"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface CoinFlipAnimationProps {
  isFlipping: boolean
  result: "heads" | "tails" | null
  onWin?: () => void
}

// Confetti component
const Confetti = ({ show }: { show: boolean }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>(
    [],
  )

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5,
      }))
      setParticles(newParticles)
    }
  }, [show])

  if (!show) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ scale: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            y: [-20, -100, -200],
            opacity: [1, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

export default function CoinFlipAnimation({ isFlipping, result, onWin }: CoinFlipAnimationProps) {
  const [rotations, setRotations] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isFlipping) {
      // Random number of rotations between 5 and 10
      setRotations(Math.floor(Math.random() * 5) + 5)
      setShowConfetti(false)
    }
  }, [isFlipping])

  useEffect(() => {
    if (!isFlipping && result && onWin) {
      // Show confetti after animation completes
      setTimeout(() => {
        setShowConfetti(true)
        onWin()
      }, 500)
    }
  }, [isFlipping, result, onWin])

  return (
    <div className="relative h-64 w-64 perspective-1000">
      <Confetti show={showConfetti} />

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
        <div className="absolute h-full w-full rounded-full backface-hidden flex items-center justify-center shadow-2xl">
          {/* Outer ring with golden gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 p-2">
            {/* Inner golden ring */}
            <div className="h-full w-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 p-3 shadow-inner">
              {/* Main coin surface */}
              <div className="h-full w-full rounded-full bg-gradient-to-br from-yellow-100 via-yellow-300 to-yellow-500 flex items-center justify-center relative overflow-hidden">
                {/* Radial pattern */}
                <div className="absolute inset-0 rounded-full opacity-20">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-8 bg-yellow-800 origin-bottom"
                      style={{
                        left: "50%",
                        bottom: "50%",
                        transform: `translateX(-50%) rotate(${i * 30}deg)`,
                      }}
                    />
                  ))}
                </div>

                {/* Center emblem */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-4xl font-bold text-yellow-900 mb-1 drop-shadow-lg">H</div>
                  <div className="text-xs font-semibold text-yellow-800 tracking-wider">HEADS</div>
                </div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white to-transparent opacity-30"
                  animate={{
                    rotate: isFlipping ? [0, 360] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isFlipping ? Number.POSITIVE_INFINITY : 0,
                    ease: "linear",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tails side */}
        <div className="absolute h-full w-full rounded-full backface-hidden flex items-center justify-center shadow-2xl rotate-x-180">
          {/* Outer ring with silver gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 p-2">
            {/* Inner silver ring */}
            <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-300 via-gray-500 to-gray-700 p-3 shadow-inner">
              {/* Main coin surface */}
              <div className="h-full w-full rounded-full bg-gradient-to-br from-gray-100 via-gray-300 to-gray-500 flex items-center justify-center relative overflow-hidden">
                {/* Radial pattern */}
                <div className="absolute inset-0 rounded-full opacity-20">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-8 bg-gray-800 origin-bottom"
                      style={{
                        left: "50%",
                        bottom: "50%",
                        transform: `translateX(-50%) rotate(${i * 30}deg)`,
                      }}
                    />
                  ))}
                </div>

                {/* Center emblem */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-4xl font-bold text-gray-900 mb-1 drop-shadow-lg">T</div>
                  <div className="text-xs font-semibold text-gray-800 tracking-wider">TAILS</div>
                </div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white to-transparent opacity-30"
                  animate={{
                    rotate: isFlipping ? [0, -360] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isFlipping ? Number.POSITIVE_INFINITY : 0,
                    ease: "linear",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced shadow with glow effect */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-xl"
        style={{
          background:
            result === "heads"
              ? "radial-gradient(ellipse, rgba(251, 191, 36, 0.4) 0%, rgba(251, 191, 36, 0.1) 50%, transparent 100%)"
              : "radial-gradient(ellipse, rgba(107, 114, 128, 0.4) 0%, rgba(107, 114, 128, 0.1) 50%, transparent 100%)",
        }}
        animate={{
          width: isFlipping ? [160, 100, 160] : 160,
          height: isFlipping ? [40, 20, 40] : 40,
          opacity: isFlipping ? [0.4, 0.1, 0.4] : 0.4,
        }}
        transition={{
          duration: isFlipping ? 3 : 0.5,
          ease: "easeOut",
        }}
      />

      {/* Particle effects during flip */}
      {isFlipping && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: [0, Math.cos((i * 45 * Math.PI) / 180) * 80],
                y: [0, Math.sin((i * 45 * Math.PI) / 180) * 80],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
