// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./MumeArtToyExchanger.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MumeArtToyUtilityTokenExchangeSwapper is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    address public matuExchangeAddress;
    address public matuContractAddress;
    address public contractDeployer;
    uint256 public fee;
    
    event ChangeFee(uint256 indexed oldRate, uint256 indexed newRate);
    event WithdrawFee(address indexed to, uint256 indexed _amount);
    event SwapJbcToMatu(address indexed caller, uint256 jbcAmount, uint256 cmjAmount, uint256 platformfee);
    event SwapMatuToJbc(address indexed caller, uint256 cmjAmount, uint256 jbcAmount, uint256 platformfee);

    constructor(address _exchangeAddress, address _contractAddress, address initialAdmin)
    {
        matuContractAddress = _contractAddress;
        matuExchangeAddress = _exchangeAddress;
        contractDeployer = msg.sender;
        // Owner Deployer Always Grant ADMIN_ROLE
        _grantRole(ADMIN_ROLE, initialAdmin);
        fee = 30;
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

    function setFee(uint256 _rate) external onlyRole(ADMIN_ROLE) {
        emit ChangeFee(fee, _rate);
        fee = _rate;
    }

    function withdrawFee(uint256 _amount, address _to) external onlyRole(ADMIN_ROLE) {
        payable(_to).transfer(_amount);
        emit WithdrawFee(_to, _amount);
    }

    function exchangeJbcToCmj() external payable {
        require(msg.value >= 10000, "NA"); // NA : Not Adequate for pay fee
        uint256 tokenwithoutFee = msg.value - ((msg.value/10000) * fee);
        uint256 minTokens = MumeArtToyUtilityTokenExchange(matuExchangeAddress).getAmountOfTokens(
            tokenwithoutFee,
            matuExchangeAddress.balance,
            MumeArtToyUtilityTokenExchange(matuExchangeAddress).getReserve()
        );
        MumeArtToyUtilityTokenExchange(matuExchangeAddress).jbcToMatu{value: tokenwithoutFee}(minTokens);
        ERC20(matuContractAddress).transfer(msg.sender, minTokens);

        emit SwapJbcToMatu(msg.sender, msg.value, minTokens, (msg.value/10000) * fee);
    }

    function approveExchange() external onlyRole(ADMIN_ROLE) {
        ERC20(matuContractAddress).approve(matuExchangeAddress, 2**256 - 1);
    }

    function exchangeCmjToJbc(uint256 _cmjAmount) external {
        uint256 minJbc = MumeArtToyUtilityTokenExchange(matuExchangeAddress).getAmountOfTokens(
            _cmjAmount,
            MumeArtToyUtilityTokenExchange(matuExchangeAddress).getReserve(),
            matuExchangeAddress.balance
        );
        require(minJbc >= 10000, "NA"); // NA : Not Adequate for pay fee
        ERC20(matuContractAddress).transferFrom(msg.sender, address(this), _cmjAmount);
        MumeArtToyUtilityTokenExchange(matuExchangeAddress).matuToJbc(_cmjAmount, minJbc);
        payable(msg.sender).transfer(minJbc - ((minJbc/10000) * fee));

        emit SwapMatuToJbc(msg.sender, _cmjAmount, minJbc, (minJbc/10000) * fee);
    }

    fallback() external payable {}
    receive() external payable {}
}