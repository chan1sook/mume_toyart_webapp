// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// Dev only: Don't used for actual NFT
// Fixed from B2
// - remove: mintMultipled, setPriceMultiple, setTransferMultiple because not needs
contract MumeArtToyNftB3 is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant WEBADMIN_ROLE = keccak256("WEBADMIN_ROLE");
    uint256 private _nextTokenId;

    // Contract Deployer Address
    address public contractDeployer;
    // Mapping of NFT Price
    mapping(uint256 => uint256) private _price;
    // Mapping of NFT Tradeable Flag
    mapping(uint256 => bool) private _tradeable;

    constructor()
        ERC721("MumeArtToyNft-Beta3", "MATN-B3")
    {
        // Contract Deployer is Deployer
        contractDeployer = msg.sender;
        // Contract Deployer Always Grant WEBADMIN_ROLE
        _grantRole(WEBADMIN_ROLE, msg.sender);
    }

    // Override BaseURI
    function _baseURI() internal pure override returns (string memory) {
        return "https://mume-arttoy.com/mapi/artmetadata/";
    }

    // Grant WEBADMIN_ROLE to address "to"
    // WEBADMIN_ROLE only
    function grantAdmin(address to) external onlyRole(WEBADMIN_ROLE) {
        require(to != msg.sender, "Can't grant self");
        _grantRole(WEBADMIN_ROLE, to);
    }
    
    // Revoke WEBADMIN_ROLE from address "to"
    // WEBADMIN_ROLE only
    function revokeAdmin(address to) external onlyRole(WEBADMIN_ROLE) {
        require(to != msg.sender, "Can't revoke self");
        _revokeRole(WEBADMIN_ROLE, to);
    }

    // Mint NFT to address "to" with price and uri
    //
    // Minted NFT can't trade until owner call "setTradeable(tokenId, true)"
    //
    // WEBADMIN_ROLE only
    function mint(address to, uint256 price, string memory uri) external onlyRole(WEBADMIN_ROLE) {
         uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _price[tokenId] = price;
        // Is "to" is msg.sender => set tradeable true
        _tradeable[tokenId] = to == msg.sender;
        _setTokenURI(tokenId, uri);
    }

    // Return all basic infomation of NFT
    // Like call ownerOf + priceOf + isTradeable + tokenURI
    // Order: owner, tradeable flag, price, uri
    function nftInfomationOf(uint256 tokenId) external view returns (address, bool, uint256, string memory) {
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "NFT not found");
        return (owner, _tradeable[tokenId], _price[tokenId], tokenURI(tokenId));
    }

    // Price Setter
    // Owner only
    function setPrice(uint256 tokenId, uint256 price) public {
        address owner = ownerOf(tokenId);
        require(owner == msg.sender, "Not your NFT");
        _price[tokenId] = price;
    }

    // Price Getter
    function priceOf(uint256 tokenId) public view returns (uint256){
        require(_ownerOf(tokenId) != address(0), "NFT not found");
        return _price[tokenId];
    }

    // Tradeable Setter
    // Owner only
    function setTradeable(uint256 tokenId, bool state) public {
        address owner = ownerOf(tokenId);
        require(owner == msg.sender, "Not your NFT");
        _tradeable[tokenId] = state;
    }

    // Tradeable Getter
    function isTradeable(uint256 tokenId) external view returns (bool){
        require(_ownerOf(tokenId) != address(0), "NFT not found");
        return _tradeable[tokenId];
    }

    // Buy NFT from tradeable NFT
    // Payable function: Exactly price only
    // Not-Owner function
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
