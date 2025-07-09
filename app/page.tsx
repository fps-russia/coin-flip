"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, Coins } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/constants"
import ConnectWallet from "@/components/connect-wallet"
import CoinFlipAnimation from "@/components/coin-flip-animation"
import GameHistory from "@/components/game-history"

export default function Home() {
  const { toast } = useToast()
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [betAmount, setBetAmount] = useState("0.01")
  const [choice, setChoice] = useState<"heads" | "tails">("heads")
  const [isFlipping, setIsFlipping] = useState(false)
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null)
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask or another Ethereum wallet",
          variant: "destructive",
        })
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const { chainId } = await provider.getNetwork()

      // Base Goerli Testnet chainId is 84531
      // Base Mainnet chainId is 8453
      setIsCorrectNetwork(chainId.toString() === "8453" || chainId.toString() === "84531")

      const accounts = await provider.listAccounts()

      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        setSigner(signer)
        setAddress(await signer.getAddress())
        setConnected(true)

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        setContract(contract)

        updateBalance(signer)
        fetchGameHistory(contract)
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const updateBalance = async (signer: ethers.Signer) => {
    try {
      const address = await signer.getAddress()
      const balance = await provider?.getBalance(address)
      if (balance) {
        setBalance(ethers.formatEther(balance))
      }
    } catch (error) {
      console.error("Error updating balance:", error)
    }
  }

  const fetchGameHistory = async (contract: ethers.Contract) => {
    try {
      const address = await signer?.getAddress()
      if (address) {
        // This assumes your contract has a method to fetch user game history
        const history = await contract.getUserGameHistory(address)
        setHistory(history)
      }
    } catch (error) {
      console.error("Error fetching game history:", error)
    }
  }

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "Wallet not found",
          description: "Please install MetaMask or another Ethereum wallet",
          variant: "destructive",
        })
        return
      }

      await window.ethereum.request({ method: "eth_requestAccounts" })

      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const { chainId } = await provider.getNetwork()

      // Check if connected to Base network
      if (chainId.toString() !== "8453" && chainId.toString() !== "84531") {
        setIsCorrectNetwork(false)
        toast({
          title: "Wrong network",
          description: "Please connect to Base network",
          variant: "destructive",
        })
        return
      }

      setIsCorrectNetwork(true)

      const signer = await provider.getSigner()
      setSigner(signer)

      const address = await signer.getAddress()
      setAddress(address)
      setConnected(true)

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      setContract(contract)

      updateBalance(signer)
      fetchGameHistory(contract)

      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully",
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  const switchToBaseNetwork = async () => {
    try {
      if (!window.ethereum) return

      // Base Mainnet
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x2105", // 8453 in hex
            chainName: "Base Mainnet",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          },
        ],
      })

      // Refresh connection
      checkIfWalletIsConnected()
    } catch (error) {
      console.error("Error switching network:", error)
    }
  }

  const placeBet = async () => {
    try {
      if (!contract || !signer) {
        toast({
          title: "Not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        })
        return
      }

      if (!isCorrectNetwork) {
        toast({
          title: "Wrong network",
          description: "Please connect to Base network",
          variant: "destructive",
        })
        return
      }

      const betAmountWei = ethers.parseEther(betAmount)

      // Start animation
      setIsFlipping(true)
      setGameResult(null)
      setFlipResult(null)

      // Call the contract's flip function
      // 0 for heads, 1 for tails
      const choiceValue = choice === "heads" ? 0 : 1

      const tx = await contract.flip(choiceValue, { value: betAmountWei })

      toast({
        title: "Transaction submitted",
        description: "Your bet has been placed. Waiting for confirmation...",
      })

      // Wait for transaction to be mined
      const receipt = await tx.wait()

      // Listen for the Result event from the contract
      const resultEvent = receipt.logs
        .filter((log: any) => log.fragment?.name === "Result")
        .map((log: any) => contract.interface.parseLog(log))[0]

      if (resultEvent) {
        const result = resultEvent.args.result
        const won = resultEvent.args.won

        // Update flip result
        setFlipResult(result === 0 ? "heads" : "tails")
        setGameResult(won ? "win" : "lose")

        // Update balance
        updateBalance(signer)

        // Update history
        fetchGameHistory(contract)

        toast({
          title: won ? "You won! 🎉" : "You lost 😢",
          description: `The coin landed on ${result === 0 ? "heads" : "tails"}`,
          variant: won ? "default" : "destructive",
        })
      }
    } catch (error) {
      console.error("Error placing bet:", error)
      toast({
        title: "Transaction failed",
        description: "Failed to place bet",
        variant: "destructive",
      })
    } finally {
      // End animation after a delay for visual effect
      setTimeout(() => {
        setIsFlipping(false)
      }, 3000)
    }
  }

  const handleWin = () => {
    // Additional win celebration logic can go here
    console.log("Player won! Confetti time! 🎉")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="container mx-auto max-w-4xl">
        <header className="flex justify-between items-center py-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Coins className="mr-2 text-yellow-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              CryptoFlip
            </span>
          </h1>

          <div className="flex items-center gap-4">
            {connected && (
              <div className="hidden md:block text-sm text-gray-300">
                <span className="font-medium">{balance.substring(0, 6)} ETH</span>
              </div>
            )}

            <ConnectWallet
              connected={connected}
              address={address}
              onConnect={connectWallet}
              isCorrectNetwork={isCorrectNetwork}
              onSwitchNetwork={switchToBaseNetwork}
            />
          </div>
        </header>

        <div className="mt-8">
          <Tabs defaultValue="play" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="play">Play Game</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="play" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Flip a Coin</CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    Powered by Chainlink VRF for provably fair randomness
                  </CardDescription>
                  <div className="text-center text-sm text-gray-500 mt-2">
                    <p>House Edge: 3% • Fair odds with Chainlink VRF</p>
                  </div>
                </CardHeader>

                <CardContent>
                  {!connected ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                      <p className="text-gray-400 text-center mb-6">Connect your wallet to start playing on Base L2</p>
                      <Button onClick={connectWallet} size="lg">
                        Connect Wallet
                      </Button>
                    </div>
                  ) : !isCorrectNetwork ? (
                    <Alert className="bg-yellow-900/20 border-yellow-800">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertTitle>Wrong Network</AlertTitle>
                      <AlertDescription>
                        Please switch to Base network to play
                        <Button
                          variant="outline"
                          className="mt-2 border-yellow-600 text-yellow-500 hover:bg-yellow-900/20 bg-transparent"
                          onClick={switchToBaseNetwork}
                        >
                          Switch to Base
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <CoinFlipAnimation
                          isFlipping={isFlipping}
                          result={flipResult}
                          onWin={gameResult === "win" ? handleWin : undefined}
                        />
                      </div>

                      {gameResult && (
                        <div
                          className={`text-center p-3 rounded-md ${
                            gameResult === "win" ? "bg-green-900/20 text-green-500" : "bg-red-900/20 text-red-500"
                          }`}
                        >
                          <p className="text-lg font-bold">{gameResult === "win" ? "You Won!" : "You Lost"}</p>
                          <p>
                            The coin landed on {flipResult}. You chose {choice}.
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Choose Your Side</label>
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              type="button"
                              variant={choice === "heads" ? "default" : "outline"}
                              className={`h-20 ${
                                choice === "heads"
                                  ? "bg-yellow-600 hover:bg-yellow-700"
                                  : "border-yellow-600 text-yellow-500 hover:bg-yellow-900/20"
                              }`}
                              onClick={() => setChoice("heads")}
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-lg font-bold">Heads</span>
                                <span className="text-xs mt-1">50% chance</span>
                              </div>
                            </Button>

                            <Button
                              type="button"
                              variant={choice === "tails" ? "default" : "outline"}
                              className={`h-20 ${
                                choice === "tails"
                                  ? "bg-yellow-600 hover:bg-yellow-700"
                                  : "border-yellow-600 text-yellow-500 hover:bg-yellow-900/20"
                              }`}
                              onClick={() => setChoice("tails")}
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-lg font-bold">Tails</span>
                                <span className="text-xs mt-1">50% chance</span>
                              </div>
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Bet Amount (ETH)</label>
                          <div className="space-y-2">
                            <Input
                              type="number"
                              value={betAmount}
                              onChange={(e) => setBetAmount(e.target.value)}
                              min="0.001"
                              step="0.001"
                              className="bg-gray-700 border-gray-600"
                            />
                            <div className="text-sm text-gray-400 flex justify-between">
                              <span>To Win:</span>
                              <span className="text-green-400 font-medium">
                                {betAmount && !isNaN(Number.parseFloat(betAmount))
                                  ? `${(Number.parseFloat(betAmount) * 1.97).toFixed(4)} ETH`
                                  : "0.0000 ETH"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    size="lg"
                    disabled={!connected || !isCorrectNetwork || isFlipping}
                    onClick={placeBet}
                  >
                    {isFlipping ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Flipping...
                      </>
                    ) : (
                      "Flip Coin"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <GameHistory history={history} address={address} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
