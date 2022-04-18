//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SotatekNFT is ERC721, Ownable {
    uint256 private _counter = 0;
    address public marketplace;

    struct Item {
        address owner;
        string uri;
    }

    mapping(uint256 => Item) public items;

    event mintNFT(address owner, uint256 tokenId, string uri);
    event burnNFT(uint256 tokenId, string uri);

    constructor() ERC721("SotatekNFT", "SotaNFT") {}

    modifier isOwner(uint256 _tokenId) {
        require(
            items[_tokenId].owner == msg.sender,
            "You are not the owner of this token"
        );
        _;
    }

    function mint(address recipient, string memory _tokenURI) public {
        _safeMint(recipient, _counter);
        items[_counter] = Item({owner: recipient, uri: _tokenURI});
        approve(marketplace, _counter);

        emit mintNFT(recipient, _counter, _tokenURI);
        _counter += 1;
    }

    function burn(uint256 _tokenId) public isOwner(_tokenId) {
        items[_tokenId].owner = address(0);
        _burn(_tokenId);

        emit burnNFT(_tokenId, items[_tokenId].uri);
    }

    function setMarketplace(address market) public onlyOwner {
        marketplace = market;
    }

    function getMarketplace() public view returns (address) {
        return marketplace;
    }
}
