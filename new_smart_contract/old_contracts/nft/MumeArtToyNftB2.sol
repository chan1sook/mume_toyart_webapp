// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MumeArtToyNftB2 is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant WEBADMIN_ROLE = keccak256("WEBADMIN_ROLE");
    uint256 private _nextTokenId;

    address public contractDeployer;
    mapping(uint256 => uint256) private _price;
    mapping(uint256 => bool) private _tradeable;

    constructor()
        ERC721("MumeArtToyNft-Beta2", "MATN-B2")
    {
        contractDeployer = msg.sender;
        _grantRole(WEBADMIN_ROLE, msg.sender);
    }

    // Grant WEBADMIN_ROLE to address "to"
    function grantAdmin(address to) external onlyRole(WEBADMIN_ROLE) {
        require(to != msg.sender, "Can't grant self");
        _grantRole(WEBADMIN_ROLE, to);
    }
    
    // Revoke WEBADMIN_ROLE from address "to"
    function revokeAdmin(address to) external onlyRole(WEBADMIN_ROLE) {
        require(to != msg.sender, "Can't revoke self");
        _revokeRole(WEBADMIN_ROLE, to);
    }
    
    function _mint(address to, uint256 price, string memory uri) private onlyRole(WEBADMIN_ROLE) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _price[tokenId] = price;
        // Is "to" is msg.sender => set tradeable true
        _tradeable[tokenId] = to == msg.sender;
        _setTokenURI(tokenId, uri);
    }

    // Mint NFT to address "to" with price and uri
    // Minted NFT can't trade until owner call "setTradeable(tokenId, true)"
    function mint(address to, uint256 price, string memory uri) external onlyRole(WEBADMIN_ROLE) returns(uint256) {
        uint256 tokenId = _nextTokenId + 1;
        _mint(to, price, uri);
        return tokenId;
    }

    // Batch Version of mint(to, price, uri);
    function mintMultiple(uint256 quantity, address to, uint256 price, string memory uri) external onlyRole(WEBADMIN_ROLE) returns(uint256, uint256) {
        uint256 startTokenId = _nextTokenId + 1;
        for(uint256 i; i < quantity; ) {
            _mint(to, price, uri);
            unchecked {
                ++i;
            }
        }
        return (startTokenId, quantity);
    }

    // Return all basic infomation of NFT
    function nftInfomationOf(uint256 tokenId) external view returns (address, bool, uint256, string memory) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "NFT not found");
        return (owner, _tradeable[tokenId], _price[tokenId], tokenURI(tokenId));
    }

    // Price Setter
    function setPrice(uint256 tokenId, uint256 price) public {
        address owner = ownerOf(tokenId);
        require(owner == msg.sender, "Not your NFT");
        _price[tokenId] = price;
    }
    
    // Multiple Price Setter
    function setPriceMultiple(uint256 tokenId, uint256 count, uint256 price) external {
        for(uint256 i; i < count; ++i) {
            setPrice(tokenId, price);
        }
    }

    // Price Getter
    function priceOf(uint256 tokenId) public view returns (uint256){
        require(_ownerOf(tokenId) != address(0), "NFT not found");
        return _price[tokenId];
    }

    // Tradeable Setter
    function setTradeable(uint256 tokenId, bool state) public {
        address owner = ownerOf(tokenId);
        require(owner == msg.sender, "Not your NFT");
        _tradeable[tokenId] = state;
    }
    
    // Multiple Tradeable Setter
    function setTradeableMultiple(uint256 tokenId, uint256 count, bool state) external {
        for(uint256 i; i < count; ++i) {
            setTradeable(tokenId, state);
        }
    }


    // Tradeable Getter
    function isTradeable(uint256 tokenId) external view returns (bool){
        require(_ownerOf(tokenId) != address(0), "NFT not found");
        return _tradeable[tokenId];
    }

    // Buy NFT from tradeable NFT
    // Payable: Exactly price only
    function buyNft(address payable owner, uint256 tokenId) external payable {
        require(owner != address(0), "Invalid owner address");
        require(owner != msg.sender, "Can't buy self own NFT");
        // Exactly price only
        require(_price[tokenId] == msg.value, "The price received is invalid");
        // Owner should get JCB token too
        (bool sent, ) = owner.call{value: msg.value}("Received from selling NFT");
        require(sent, "Failed to send Ether");
        // Change owner to buyer 
        _update(msg.sender, tokenId, owner);
        _tradeable[tokenId] = false;
    }

    // Override transferForm function using tradeable flag
    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) {
        require(_tradeable[tokenId], "This NFT isn't tradeable");
        super.transferFrom(from, to, tokenId);
        // Trade locked after each Transaction
        // Owner require "setTrading(true)" for trading again
        _tradeable[tokenId] = false;
    }


    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
