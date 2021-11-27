// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.0025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        //
        address payable creator;
        uint256 parentItemId;
        uint256 royalty_rate;
        bool allow_children;
        uint256 child_min_royalty_rate;
        uint256 child_royalty_rate;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        address creator,
        uint256 parenItemId,
        uint256 royalty_rate,
        bool allow_children,
        uint256 child_min_royalty_rate,
        uint256 child_royalty_rate
    );

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Places an item for sale on the marketplace */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 parentItemId,
        uint256 royalty_rate,
        bool allow_children,
        uint256 child_min_royalty_rate,
        uint256 child_royalty_rate
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        require(
            royalty_rate >= idToMarketItem[parentItemId].child_min_royalty_rate,
            "Supplied royalty_rate does not match or exceed that required by parent"
        );

        require(
            parentItemId <= _itemIds.current(),
            "parentItemId specified for this create market item does not exist"
        );

        require(
            royalty_rate <= 10000,
            "royalty_rate specified exceeds that of 10000 (100%)"
        );

        if (allow_children) {
            require(
                child_min_royalty_rate <= 10000,
                "child_min_royalty_rate specified exceeds that of 10000 (100%)"
            );

            require(
                child_royalty_rate <= 10000,
                "child_royalty_rate specified exceeds that of 10000 (100%)"
            );
        }

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            payable(msg.sender),
            parentItemId,
            royalty_rate,
            allow_children,
            child_min_royalty_rate,
            child_royalty_rate
        );

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false,
            msg.sender,
            parentItemId,
            royalty_rate,
            allow_children,
            child_min_royalty_rate,
            child_royalty_rate
        );
    }

    function calcRoyalties(uint256 total, uint256 royalty_rate)
        public
        pure
        returns (uint256 royalties)
    {
        return (total * royalty_rate) / 10000;
    }

    function payoutRoyalties(
        uint256 royalties,
        uint256 parentItemId,
        uint256 childItemId
    ) internal {
        if (parentItemId == 0) {
            idToMarketItem[childItemId].creator.transfer(royalties);
        } else {
            uint256 childs_share = royalties -
                calcRoyalties(
                    royalties,
                    idToMarketItem[parentItemId].child_royalty_rate
                );

            idToMarketItem[childItemId].creator.transfer(childs_share);
            royalties -= childs_share;

            payoutRoyalties(
                royalties,
                idToMarketItem[parentItemId].parentItemId,
                parentItemId
            );
        }
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        uint256 parentItemId = idToMarketItem[itemId].parentItemId;
        uint256 royalty_rate = idToMarketItem[itemId].royalty_rate;

        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        // Calculate royalties
        uint256 royalties = calcRoyalties(price, royalty_rate);

        // Payout royalties
        payoutRoyalties(royalties, parentItemId, itemId);

        // Seller gets sale price - royalties
        idToMarketItem[itemId].seller.transfer(msg.value - royalties);

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);
    }

    /*
    function getMarketItemAcenstors(uint256 tokenId) public view returns (MarketItem[] memory) {
        MarketItem cur_item = idToMarketItem[tokenId];
        uint8 depth = cur_item.depth;

        MarketItem[] ancestors = new MarketItem[](depth);

        while (depth > 0) {
            ancestors[depth-1] = idToMarketItem[cur_item.parentTokenId];
            depth--;
        }

        return ancestors;
    }
    */

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items that a user has purchased */
    /* 
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    */

    /* Returns only items a user has created */
    /*
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
    */
}
