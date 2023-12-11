// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


contract MumeArtToyNftB1 is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant WEBADMIN_ROLE = keccak256("WEBADMIN_ROLE");
    uint256 private _nextTokenId;

    // Contract Deployer Address
    address public contractDeployer;
    // Mapping of NFT Price
    mapping(uint256 => uint256) private _price;
    // Mapping of NFT Tradeable Flag
    mapping(uint256 => bool) private _tradeable;

    // Custom NFT Event
    event NftMinted(uint256 indexed _tokenId, address _owner, uint256 _price);
    event NftUpdated(uint256 indexed _tokenId, address _owner, bool _tradeable, uint256 _price);

    constructor()
        ERC721("MumeArtToyNft-Beta1", "MATN-B1")
    {
        // Contract Deployer is Deployer
        contractDeployer = msg.sender;

        // Contract Deployer Always Grant WEBADMIN_ROLE
        _grantRole(WEBADMIN_ROLE, msg.sender);
    }

    // Grant WEBADMIN_ROLE to address "to"
    // WEBADMIN_ROLE only
    function grantAdmin(address to) public onlyRole(WEBADMIN_ROLE) {
        require(to != msg.sender, "Can't grant self");
        _grantRole(WEBADMIN_ROLE, to);
    }
    
    // Revoke WEBADMIN_ROLE from address "to"
    // WEBADMIN_ROLE only
    function revokeAdmin(address to) public onlyRole(WEBADMIN_ROLE) {
        require(to != msg.sender, "Can't revoke self");
        _revokeRole(WEBADMIN_ROLE, to);
    }
    
    // Mint NFT to address "to" with price and uri
    //
    // Minted NFT can't trade until owner call "setTradeable(tokenId, true)"
    // except "to" is msg.sender (self mint)
    //
    // WEBADMIN_ROLE only
    function mint(address to, uint256 price, string memory uri) public onlyRole(WEBADMIN_ROLE) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _price[tokenId] = price;
        // Is "to" is msg.sender => set tradeable true
        _tradeable[tokenId] = to == msg.sender;
        _setTokenURI(tokenId, uri);
        
        emit NftMinted(tokenId, msg.sender, price);
        emit NftUpdated(tokenId, msg.sender, _tradeable[tokenId], price);
    }

    // Mint Multiple NFT to address "to" with price, uri and quantity 
    // Batch Version of mint(to, price, uri);
    // WEBADMIN_ROLE only
    function mintMultiple(uint256 quantity, address to, uint256 price, string memory uri) public onlyRole(WEBADMIN_ROLE) {
         for(uint256 i; i < quantity; ++i) {
            mint(to, price, uri);
        }
    }

    // Return all basic infomation of NFT
    // Like call ownerOf + priceOf + isTradeable + tokenURI
    // Order: owner, tradeable flag, price, uri
    function nftInfomationOf(uint256 tokenId) public view returns (address, bool, uint256, string memory) {
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
        emit NftUpdated(tokenId, owner, _tradeable[tokenId], price);
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
        emit NftUpdated(tokenId, owner, state, _price[tokenId]);
    }

    // Tradeable Getter
    function isTradeable(uint256 tokenId) public view returns (bool){
        require(_ownerOf(tokenId) != address(0), "NFT not found");
        return _tradeable[tokenId];
    }

    // Buy NFT from tradeable NFT
    // Payable function: Exactly price only
    // Not-Owner function
    function buyNft(uint256 tokenId) public payable {
        address owner = ownerOf(tokenId);
        require(owner != msg.sender, "Can't buy self own NFT");
        // Exactly price only
        require(_price[tokenId] == msg.value, "The price received is invalid");
        // Regradless change owner to buyer 
        _update(msg.sender, tokenId, owner);
        _tradeable[tokenId] = false;
        emit NftUpdated(tokenId, msg.sender, _tradeable[tokenId], _price[tokenId]);
    }

    // Override transferForm function using tradeable flag
    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) {
        require(_tradeable[tokenId], "This NFT isn't tradeable");
        super.transferFrom(from, to, tokenId);
        // Trade locked after each Transaction
        // Owner require "setTrading(true)" for trading again
        _tradeable[tokenId] = false;
        emit NftUpdated(tokenId, to, _tradeable[tokenId], _price[tokenId]);
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