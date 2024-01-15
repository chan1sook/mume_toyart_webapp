// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MumeArtToyNft1.sol";
import "./MuToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// ERC20 Token from MumeArtToy
// Using in future of that project
contract ClaimMuFromMumeNft1Contract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    address public contractDeployer;
    
    address public mumeNftContract;
    address public muTokenContract;
    
    mapping(uint256 => bool) public canClaimMu;
    mapping(uint256 => uint256) public muGain;

    constructor(address initialAdmin, address _mumeNftContract, address _muTokenContract) {
        contractDeployer = msg.sender;
        mumeNftContract = _mumeNftContract;
        muTokenContract = _muTokenContract;
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

    // set nft "tokenID" can claim MU by "muAmountGain"
    // this function auto set canClaimMu = true
    // ADMIN_ROLE only
    function setNftClaimMuPromotion(uint256 tokenId, uint256 muAmountGain) external onlyRole(ADMIN_ROLE) {
        canClaimMu[tokenId] = true;
        muGain[tokenId] = muAmountGain;
    }

    // set nft "tokenID" can claim MU by "state"
    // ADMIN_ROLE only
    function setNftCanClaimMu(uint256 tokenId, bool state) external onlyRole(ADMIN_ROLE) {
        canClaimMu[tokenId] = state;
    }

    // set nft "tokenID" claim MU amount by "muAmountGain"
    // ADMIN_ROLE only
    function setNftMuClaimed(uint256 tokenId, uint256 muAmountGain) external onlyRole(ADMIN_ROLE) {
        muGain[tokenId] = muAmountGain;
    }

    // claim MU from own NFT
    // required NFT owner to call
    function claimMu(uint256 tokenId) external {
        MumeArtToyNft1 nftContract = MumeArtToyNft1(mumeNftContract);
        MumeArtToyMuToken muContract = MumeArtToyMuToken(muTokenContract);
        address owner = nftContract.ownerOf(tokenId);
        require(owner == msg.sender, "Not your NFT");
        require(canClaimMu[tokenId], "This NFT not claimable");

        muContract.mint(msg.sender, muGain[tokenId]);
        canClaimMu[tokenId] = false;
    }
}
