"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ethers } from "ethers"
import { formatDistanceToNow } from "date-fns"

interface GameHistoryProps {
  history: any[]
  address: string
}

export default function GameHistory({ history, address }: GameHistoryProps) {
  // This is a mock implementation since we don't know the exact structure of your history data
  // You'll need to adjust this based on your actual contract implementation
  const mockHistory = [
    {
      id: 1,
      player: address,
      betAmount: ethers.parseEther("0.01"),
      choice: 0, // heads
      result: 1, // tails
      won: false,
      timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    },
    {
      id: 2,
      player: address,
      betAmount: ethers.parseEther("0.02"),
      choice: 1, // tails
      result: 1, // tails
      won: true,
      timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    },
    {
      id: 3,
      player: address,
      betAmount: ethers.parseEther("0.005"),
      choice: 0, // heads
      result: 0, // heads
      won: true,
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    },
  ]

  // Use mock data if history is empty
  const displayHistory = history.length > 0 ? history : mockHistory

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle>Game History</CardTitle>
        <CardDescription>Your recent coin flip games</CardDescription>
      </CardHeader>
      <CardContent>
        {address ? (
          displayHistory.length > 0 ? (
            <div className="space-y-4">
              {displayHistory.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-700">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Badge variant={game.won ? "default" : "destructive"}>{game.won ? "Won" : "Lost"}</Badge>
                      <span className="text-sm text-gray-400">
                        {formatDistanceToNow(game.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm">
                        Bet: <span className="font-medium">{ethers.formatEther(game.betAmount)} ETH</span>
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      You chose <span className="font-medium">{game.choice === 0 ? "Heads" : "Tails"}</span>, result was{" "}
                      <span className="font-medium">{game.result === 0 ? "Heads" : "Tails"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${game.won ? "text-green-500" : "text-red-500"}`}>
                      {game.won ? "+" : "-"}
                      {ethers.formatEther(game.betAmount)} ETH
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No game history found</p>
              <p className="text-sm mt-2">Play your first game to see your history</p>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Connect your wallet to view your game history</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
