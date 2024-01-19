// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IMumeNft {
    function ownerOf(uint256 tokenId) external view returns (address);
    function priceOf(uint256 tokenId) external view returns (uint256);
    function isTradeable(uint256 tokenId) external view returns (bool);
    function setTradeable(uint256 tokenId, bool state) external;
    function setSellable(uint256 tokenId, bool state) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
}

interface IMuToken {
    function mint(address to, uint256 amount) external;
}

// Lend Mume Nft
// Grant MuToken AdminRole to this contract address before used
contract LendMumeNftContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    address public contractDeployer;
    
    address public mumeNftContract;
    address public muTokenContract;

    mapping(uint256 => address) public nftOldOwner;
    mapping(uint256 => uint256) public lendStartAt;

    mapping(uint256 => uint256) public muToClaim;
    
    uint256 public rewardMuPerDay = 0.01 ether;

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

    // Set lend reward rate per day
    // ADMIN_ROLE only
    function setLendRewards(uint256 muPerDay) external onlyRole(ADMIN_ROLE) {
        rewardMuPerDay = muPerDay;
    }

    // Start lend nft
    // required tradeable and MumeNft.approve(contractAddress) to start lend program
    function lendNft(uint256 tokenId) external {
        IMumeNft nftContract = IMumeNft(mumeNftContract);
        address owner = nftContract.ownerOf(tokenId);
        require(owner == msg.sender, "Not your NFT");
        require(nftContract.isTradeable(tokenId), "This NFT isn't tradeable");

        // transfer to this contract
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        // Lock nft to not sellable
        nftContract.setSellable(tokenId, false);

        // Set lend Data
        nftOldOwner[tokenId] = msg.sender;
        lendStartAt[tokenId] = block.timestamp;
    }

    // Get Current Session Lend Time
    // nftOwner Only
    function currentSessionLendTime(uint256 tokenId) external view returns (uint256) {
        require(nftOldOwner[tokenId] != address(0), "NFT is not lending");
        require(nftOldOwner[tokenId] == msg.sender, "Not your NFT");
        return _currentSessionLendTime(tokenId);
    }

    // Internal function for calculate current session lend time
    function _currentSessionLendTime(uint256 tokenId) internal view returns (uint256) {
        if(block.timestamp < lendStartAt[tokenId]) {
            return 0;
        }
        return block.timestamp - lendStartAt[tokenId];
    }

    // Get Current Session MU Reward from Lend
    // nftOwner Only
    function currentSessionMuReward(uint256 tokenId) external view returns (uint256) {
        require(nftOldOwner[tokenId] != address(0), "NFT is not lending");
        require(nftOldOwner[tokenId] == msg.sender, "Not your NFT");
        return _currentSessionMuReward(tokenId);
    }

    // Internal function for calculate MU Reward
    // wei unit
    function _currentSessionMuReward(uint256 tokenId) internal view returns (uint256) {
        return _currentSessionLendTime(tokenId) * rewardMuPerDay / 1 days;
    }

    // Renew Lend NFT Session
    // Use for get partial reward
    function renewLendSession(uint256 tokenId) external {
        require(nftOldOwner[tokenId] != address(0), "NFT is not lending");
        require(nftOldOwner[tokenId] == msg.sender, "Not your NFT");

        uint256 muReward = _currentSessionMuReward(tokenId);

        muToClaim[tokenId] += muReward;

        // Reset lend time
        lendStartAt[tokenId] = block.timestamp;
    }

    // Claim NFT and Store reward
    function claimNft(uint256 tokenId) external {
        require(nftOldOwner[tokenId] != address(0), "NFT is not lending");
        require(nftOldOwner[tokenId] == msg.sender, "Not your NFT");

        uint256 muReward = _currentSessionMuReward(tokenId);

        muToClaim[tokenId] += muReward;

        IMumeNft nftContract = IMumeNft(mumeNftContract);

        // Trade NFT Back
        nftContract.setTradeable(tokenId, true);
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        // Reset Variable
        nftOldOwner[tokenId] = address(0);
        lendStartAt[tokenId] = 0;
    }

    // Claim MU Reward
    function claimMuReward(uint256 tokenId, uint256 amount) external {
        IMumeNft nftContract = IMumeNft(mumeNftContract);
        require(nftOldOwner[tokenId] == msg.sender || nftContract.ownerOf(tokenId) == msg.sender, "Not your NFT");
        require(muToClaim[tokenId] >= amount, "Not sufficient reward");

        IMuToken muContract = IMuToken(muTokenContract);
        muContract.mint(msg.sender, amount);
        muToClaim[tokenId] -= amount;
    }
}