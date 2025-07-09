"use client"

import { Button } from "@/components/ui/button"
import { Wallet, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ConnectWalletProps {
  connected: boolean
  address: string
  onConnect: () => void
  isCorrectNetwork: boolean
  onSwitchNetwork: () => void
}

export default function ConnectWallet({
  connected,
  address,
  onConnect,
  isCorrectNetwork,
  onSwitchNetwork,
}: ConnectWalletProps) {
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
  }

  const openOnExplorer = () => {
    window.open(`https://basescan.org/address/${address}`, "_blank")
  }

  return connected ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-gray-700 bg-gray-800 hover:bg-gray-700">
          {!isCorrectNetwork && <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />}
          <span className="hidden md:inline mr-2">{formatAddress(address)}</span>
          <Wallet className="h-4 w-4 md:ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
        <DropdownMenuLabel className="text-gray-400">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={copyAddress} className="hover:bg-gray-700 cursor-pointer">
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openOnExplorer} className="hover:bg-gray-700 cursor-pointer">
          View on Explorer
        </DropdownMenuItem>
        {!isCorrectNetwork && (
          <>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem onClick={onSwitchNetwork} className="text-yellow-500 hover:bg-gray-700 cursor-pointer">
              Switch to Base Network
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button onClick={onConnect} className="bg-yellow-600 hover:bg-yellow-700">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
}
