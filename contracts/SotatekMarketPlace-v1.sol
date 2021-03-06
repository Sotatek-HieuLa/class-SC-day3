pragma solidity ^0.8.0;

import "./interfaces/ISotatekNft.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract SotatekMarketPlace  is Initializable {
    ISotatekNFT private token;
    uint256 private _indexItem;
    address private _ownerAddress;

    event sell(uint256 item, uint256 _tokenId, uint256 price);
    event buy(uint256 item);
    event changePrice(uint256 item, uint256 oldPrice, uint256 newPrice);

    struct MarketItem {
        uint256 id;
        uint256 tokenId;
        address payable seller;
        uint256 price;
    }

    MarketItem[] public items;
    mapping(uint256 => bool) private _statusItem;
    mapping(uint256 => bool) private _statusTokenSold;

    function initialize(address _nftAddress, uint256 _initialIndex) public initializer{
        token = ISotatekNFT(_nftAddress);
        _indexItem = _initialIndex;
    }

    modifier CheckItemOwner(uint256 _itemId, bool _yesOrNo) {
        require(
            (items[_itemId].seller == msg.sender) == _yesOrNo,
            _yesOrNo
                ? "This action requires you to be the seller of this item"
                : "This action requires that you are not the seller of this item"
        );
        _;
    }

    modifier OnSale(uint256 _itemId) {
        require(
            _statusItem[_itemId] == true,
            "This requested item must be on sale"
        );
        _;
    }

    modifier CheckNFTSold(uint256 _tokenId, bool _yesOrNo) {
        require(
            _statusTokenSold[_tokenId] == _yesOrNo,
            _yesOrNo
                ? "This NFT token has not been sold"
                : "This NFT token has been sold"
        );
        _;
    }

    modifier OnlyTokenOwner(uint256 tokenId) {
        require(
            token.ownerOf(tokenId) == msg.sender,
            "Sender does not own the item"
        );
        _;
    }

    function sellItem(uint256 _tokenId, uint256 _price)
        public
        OnlyTokenOwner(_tokenId)
        CheckNFTSold(_tokenId, false)
    {
        _statusTokenSold[_tokenId] = true;
        _statusItem[_indexItem] = true;

        items.push(
            MarketItem({
                id: _indexItem,
                tokenId: _tokenId,
                seller: payable(msg.sender),
                price: _price
            })
        );

        token.transferFrom(msg.sender, address(this), _tokenId);

        emit sell(_indexItem, _tokenId, _price);
    }

    function buyItem(uint256 _itemId)
        public
        payable
        CheckItemOwner(_itemId, false)
        OnSale(_itemId)
    {
        require(msg.value >= items[_itemId].price, "Not enough funds sent");

        _statusItem[_itemId] = false;
        _statusTokenSold[items[_itemId].tokenId] = false;

        token.transferFrom(address(this), msg.sender, items[_itemId].tokenId);

        items[_itemId].seller.transfer(items[_itemId].price);
    }

    function viewItem() public view returns (MarketItem[] memory) {
        return items;
    }

    function changePriceItem(uint256 _itemId, uint256 _newPrice)
        public
        CheckItemOwner(_itemId, true)
        OnSale(_itemId)
    {
        uint256 _oldPrice = items[_itemId].price;
        items[_itemId].price = _newPrice;

        emit changePrice(_itemId, _oldPrice, _newPrice);
    }
}
