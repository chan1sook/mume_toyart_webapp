// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// ERC20 Token from MumeArtToy
// Using in future of that project
contract MumeArtToyMuToken is ERC20, ERC20Permit, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    address public contractDeployer;

    uint256 public conversationRate = 10 * 1e18; // Get MU x ether per JCB 1 ether
    uint256 public feeRate = 0 * 1e6; // x percent * 1e6 ; max is 1e8

    constructor(address initialAdmin)
        ERC20("MumeArtToyMuToken", "MAT-MU")
        ERC20Permit("MumeArtToyMuToken")
    {
        contractDeployer = msg.sender;
        // Owner Deployer Always Grant ADMIN_ROLE
        _grantRole(ADMIN_ROLE, initialAdmin);
    }

    // Grant ADMIN_ROLE to address "to"
    // ADMIN_ROLE only
    function grantAdmin(address to) external onlyRole(ADMIN_ROLE) {
        require(to != msg.sender, "Can't grant self");
        _grantRole(ADMIN_ROLE, to);
    }
    
    // Revoke ADMIN_ROLE from address "to"
    // ADMIN_ROLE only
    function revokeAdmin(address to) external onlyRole(ADMIN_ROLE) {
        require(to != msg.sender, "Can't revoke self");
        _revokeRole(ADMIN_ROLE, to);
    }

    // Admin Magical Mint
    function mint(address to, uint256 amount) external whenNotPaused onlyRole(ADMIN_ROLE) {
        _mint(to, amount);
    }

    // Admin Magical Burn
    function burn(address to, uint256 amount) external whenNotPaused onlyRole(ADMIN_ROLE) {
        _burn(to, amount);
    }

    // Minting using jbc
    // One-way exchange
    function exchangeMint() external payable whenNotPaused {
        uint256 feeAmount =  (msg.value * feeRate) / 1e8;
        uint256 amountWithoutFee = msg.value - feeAmount;
        uint256 mintAmount = (amountWithoutFee * conversationRate) / 1e18;
        require(mintAmount > 0, "Can't mint zero value");
        _mint(msg.sender, mintAmount);
    }

    // set conversationRate
    // per 1e18 jcb-wei unit
    function setConversationRate(uint256 rate) external onlyRole(ADMIN_ROLE) {
        require(rate > 0, "Conversation Rate not be zero");
        conversationRate = rate;
    }
    
    // set feeRate
    // 1e6 = 1 percent fee
    function setFeeRate(uint256 rate) external onlyRole(ADMIN_ROLE) {
        require(rate >= 0 && rate < 1e8, "Fee Rate must in range [zero, 1e8)");
        feeRate = rate;
    }


    function withdrawEther(address payable to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        uint256 contractBalance = address(this).balance;
        require(contractBalance >= amount, "Not Enough Balance");
        
        // target should get JCB token too
        (bool sent, ) = to.call{value: amount}("Withdraw from contract");
        require(sent, "Failed to send Ether");
    }
}
