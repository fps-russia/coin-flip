// Contract address on Base L2
export const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with your actual contract address

// Contract ABI
export const CONTRACT_ABI = [
  // Events
  "event Result(address indexed player, uint256 betAmount, uint8 choice, uint8 result, bool won)",

  // Functions
  "function flip(uint8 choice) external payable returns (bool)",
  "function getUserGameHistory(address player) external view returns (tuple(uint256 id, address player, uint256 betAmount, uint8 choice, uint8 result, bool won, uint256 timestamp)[])",
  "function getHouseEdge() external pure returns (uint256)",
  "function getStats() external view returns (uint256 totalGames, uint256 totalFees)",
  "function withdrawLink() external",
  "function withdrawFees() external",
]
