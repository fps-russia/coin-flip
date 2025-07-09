// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/Ownable.sol";

/**
 * @title CoinFlip
 * @dev A coin flip game using Chainlink VRF for verifiable randomness
 */
contract CoinFlip is VRFConsumerBaseV2, Ownable {
    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable COORDINATOR;
    uint64 private immutable s_subscriptionId;
    bytes32 private immutable s_keyHash;
    uint32 private immutable s_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Game Variables
    uint256 private constant HOUSE_FEE_PERCENT = 3; // 3% house fee
    uint256 private constant MIN_BET = 0.001 ether;
    uint256 private constant MAX_BET = 1 ether;
    
    // Game state
    struct Game {
        uint256 id;
        address player;
        uint256 betAmount;
        uint8 choice; // 0 for heads, 1 for tails
        uint8 result; // 0 for heads, 1 for tails
        bool won;
        uint256 timestamp;
    }
    
    // Mapping from requestId to game details
    mapping(uint256 => Game) private s_games;
    
    // Mapping from player to their game history
    mapping(address => Game[]) private s_playerGames;
    
    // Total games played
    uint256 private s_totalGames;
    
    // Total fees collected
    uint256 private s_totalFees;
    
    // Events
    event GameStarted(address indexed player, uint256 indexed requestId, uint256 betAmount, uint8 choice);
    event Result(address indexed player, uint256 betAmount, uint8 choice, uint8 result, bool won);
    
    /**
     * @dev Constructor initializes the contract with the VRF Coordinator address and subscription ID
     * @param vrfCoordinator The address of the VRF Coordinator contract
     * @param subscriptionId The subscription ID for Chainlink VRF
     * @param keyHash The gas lane key hash value to use for the VRF request
     * @param callbackGasLimit The gas limit for the VRF callback
     */
    constructor(
        address vrfCoordinator,
        uint64 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinator) Ownable(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        s_keyHash = keyHash;
        s_callbackGasLimit = callbackGasLimit;
    }
    
    /**
     * @dev Flip a coin with the specified choice
     * @param choice 0 for heads, 1 for tails
     * @return requestId The ID of the VRF request
     */
    function flip(uint8 choice) external payable returns (uint256 requestId) {
        // Validate input
        require(choice <= 1, "Invalid choice: must be 0 (heads) or 1 (tails)");
        require(msg.value >= MIN_BET, "Bet amount too small");
        require(msg.value <= MAX_BET, "Bet amount too large");
        
        // Request randomness from Chainlink VRF
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            REQUEST_CONFIRMATIONS,
            s_callbackGasLimit,
            NUM_WORDS
        );
        
        // Store game details
        s_games[requestId] = Game({
            id: s_totalGames,
            player: msg.sender,
            betAmount: msg.value,
            choice: choice,
            result: 0, // Will be set in the callback
            won: false, // Will be set in the callback
            timestamp: block.timestamp
        });
        
        s_totalGames++;
        
        emit GameStarted(msg.sender, requestId, msg.value, choice);
        
        return requestId;
    }
    
    /**
     * @dev Callback function used by VRF Coordinator to return the random number
     * @param requestId The ID of the request
     * @param randomWords The random result returned by the VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // Get the game details
        Game storage game = s_games[requestId];
        
        // Ensure this is a valid game
        require(game.player != address(0), "Game not found");
        
        // Determine the result (0 for heads, 1 for tails)
        uint8 result = uint8(randomWords[0] % 2);
        
        // Update game result
        game.result = result;
        
        // Determine if player won
        bool won = (game.choice == result);
        game.won = won;
        
        // Add to player's game history
        s_playerGames[game.player].push(game);
        
        // Calculate payout
        if (won) {
            uint256 houseFee = (game.betAmount * HOUSE_FEE_PERCENT) / 100;
            uint256 payout = (game.betAmount * 2) - houseFee; // Double the bet minus house fee
            
            // Update total fees
            s_totalFees += houseFee;
            
            // Send payout to player
            (bool success, ) = payable(game.player).call{value: payout}("");
            require(success, "Failed to send payout");
        } else {
            // House keeps the entire bet
            s_totalFees += game.betAmount;
        }
        
        emit Result(game.player, game.betAmount, game.choice, result, won);
    }
    
    /**
     * @dev Get a player's game history
     * @param player The address of the player
     * @return An array of Game structs representing the player's game history
     */
    function getUserGameHistory(address player) external view returns (Game[] memory) {
        return s_playerGames[player];
    }
    
    /**
     * @dev Withdraw accumulated fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = s_totalFees;
        s_totalFees = 0;
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Failed to withdraw fees");
    }
    
    /**
     * @dev Withdraw LINK tokens from the contract (owner only)
     */
    function withdrawLink() external onlyOwner {
        // This function assumes there's a LINK token contract
        // Implementation depends on how you're handling LINK tokens
    }
    
    /**
     * @dev Get contract statistics
     * @return totalGames The total number of games played
     * @return totalFees The total fees collected
     */
    function getStats() external view returns (uint256 totalGames, uint256 totalFees) {
        return (s_totalGames, s_totalFees);
    }

    /**
     * @dev Get the house edge percentage
     * @return The house edge percentage (3%)
     */
    function getHouseEdge() external pure returns (uint256) {
        return HOUSE_FEE_PERCENT;
    }
}
