//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SotatekToken is ERC20, Ownable {
    address private _treasury;

    event updateTreasury(address _from, address _to);

    constructor(uint256 _tokenInitialSupply) ERC20("SotatekToken", "STT") {
        _mint(msg.sender, _tokenInitialSupply);
        _treasury = msg.sender;
    }

    function transfer(address to, uint256 amount)
        public
        override
        returns (bool)
    {
        _transfer(msg.sender, to, amount);
    }

    function mint(uint256 amount, address to) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }
}
