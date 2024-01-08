// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MumeArtToyUtilityTokenExchange is ERC20, ReentrancyGuard {
    address public matuContractAddress;

    constructor(address _contractAddress) ERC20("JBC-MATU LP Token", "MATU-LP") {
        matuContractAddress = _contractAddress;
    }

    function getReserve() public view returns (uint256) {
        return ERC20(matuContractAddress).balanceOf(address(this));
    }

    function addLiquidity(uint256 _amount) external payable nonReentrant returns (uint256) {
        uint256 liquidity;
        uint256 jbcBalance = address(this).balance;
        uint256 matiTokenReserve = getReserve();
        ERC20 matuContract = ERC20(matuContractAddress);

        if (matiTokenReserve == 0) {
            require(msg.value > 0 && _amount > 0, "Require Token and JBC For first time fill LP");
            matuContract.transferFrom(msg.sender, address(this), _amount);
            
            liquidity = jbcBalance;
            _mint(msg.sender, liquidity);
        } else {
            uint256 jbcReserve =  jbcBalance - msg.value;
            // Ratio should always be maintained so that there are no major price impacts when adding liquidity
            uint256 matuTokenAmount = (matiTokenReserve * msg.value) / jbcReserve;
            require(_amount >= matuTokenAmount, "Amount of tokens sent is less than the minimum tokens required");
            matuContract.transferFrom(msg.sender, address(this), matuTokenAmount);
            
            liquidity = (totalSupply() * msg.value) / jbcReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint256 _amount) external nonReentrant returns (uint256, uint256) {
        require(_amount > 0, "_amount should be greater than zero");
        uint256 jbcReserve = address(this).balance;
        uint256 jbcAmount = (jbcReserve * _amount)/ totalSupply();
        uint256 matuTokenAmount = (getReserve() * _amount)/ totalSupply();

        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(jbcAmount);
        ERC20(matuContractAddress).transfer(msg.sender, matuTokenAmount);

        return (jbcAmount, matuTokenAmount);
    }

    function getAmountOfTokens(
        uint256 _inputAmount,
        uint256 _inputReserve,
        uint256 _outputReserve
    ) public pure returns (uint256) {
        require(_inputReserve > 0 && _outputReserve > 0, "invalid reserves");
        // We are charging a fee of `1%` Input amount with fee = ((input amount)*99/100
        uint256 inputAmountWithFee = _inputAmount * 99;
        // Because we need to follow the concept of `XY = K` curve
        // We need to make sure (x + Δx) * (y - Δy) = x * y
        // So the final formula is Δy = (y * Δx) / (x + Δx)
        // Δy in our case is `tokens to be received`
        uint256 numerator = _outputReserve * inputAmountWithFee;
        uint256 denominator = (_inputReserve * 100) + inputAmountWithFee;

        return numerator / denominator;
    }

    function jbcToMatu(uint256 _minTokens) external payable nonReentrant {
        uint256 tokensBought = getAmountOfTokens(
            msg.value,
            address(this).balance - msg.value,
            getReserve()
        );

        require(tokensBought >= _minTokens, "insufficient output amount");
        ERC20(matuContractAddress).transfer(msg.sender, tokensBought);
    }

    function matuToJbc(uint256 _tokensSold, uint256 _minJbc) external nonReentrant {
        uint256 jbcBought = getAmountOfTokens(
            _tokensSold,
            getReserve(),
            address(this).balance
        );

        require(jbcBought >= _minJbc, "insufficient output amount");
        ERC20(matuContractAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );
        payable(msg.sender).transfer(jbcBought);
    }
}