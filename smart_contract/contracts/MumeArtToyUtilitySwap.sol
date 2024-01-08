// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MumeArtToyUtilityToken.sol";

contract MumeArtToySwap is AccessControl {
    address public cmjTokenAddress;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor()
    {
        // Owner Deployer Always Grant ADMIN_ROLE
        _grantRole(ADMIN_ROLE, msg.sender);
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
}
