// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

/// @title A minimal NFTMarket with tree like properties
/// @notice You can use this contract for only the most basic simulation
/// @dev All function calls are currently implemented without side effects
/// @custom:experimental This is an experimental contract.
contract NFTreeMarket is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    /// The owner of the market
    //address payable owner;
    /// The price required to list an item on the market
    uint256 listingPrice = 0.0025 ether;

    /// Details we keep per each market item
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        address payable creator;
        uint256 parentItemId;
        uint256 royalty_rate;
        bool allow_children;
        uint256 child_min_royalty_rate;
        uint256 child_royalty_rate;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    function updateListingPrice(uint256 newListingPrice) public onlyOwner {
        listingPrice = newListingPrice;
    }

    /// @notice Returns the price set by the market owner to list a market item
    /// @return Required price to list on the market
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /// @notice Logs the listing of a market item
    /// @dev Seller is indexed for listener filters on the front end to inform user their token has been listed
    event MarketItemCreated(
        address indexed seller,
        uint256 itemId,
        address nftContract,
        uint256 tokenId
    );

    /// @notice Creates a market item and transfers ownership of it to the market
    /// @dev Emits MarketItemCreated event
    /// @param nftContract The contract address for the nft tokens
    /// @param tokenId The identification for token to listed on the market
    /// @param price The price at which the token will be listed for on the market
    /// @param parentItemId The parent market item identifier if this token extends another
    /// @param royalty_rate The value to be extracted from sales
    /// @param allow_children Whether this token allows others to branch off it
    /// @param child_min_royalty_rate The required royalty rate of children when listing
    /// @param child_royalty_rate The percentage desired of child royalties
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
            parentItemId == 0 || idToMarketItem[parentItemId].allow_children,
            "parent does not allow children market items"
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

        emit MarketItemCreated(msg.sender, itemId, nftContract, tokenId);
    }

    /// @notice Calculates a proportion of a total given a royalty_rate
    /// @dev 10000 is used to allow for two decimals
    /// @param total The amount we are trying to find a portion of
    /// @param percentage The percentage which will be multiplied with the total to find a sub-portion
    /// @return royalties The product of percentage and total
    function calcRoyalties(uint256 total, uint256 percentage)
        public
        pure
        returns (uint256 royalties)
    {
        return (total * percentage) / 10000;
    }

    /// @notice Percolates royalties up the tree recursively
    /// @dev Could be a source of call reversion if gas provided doesn't account for depth
    /// @param royalties The amount still to be distributed
    /// @param parentItemId The parent item identifier with respect to the child
    /// @param childItemId The child item identifier
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

    /// @notice Logs the sale of a market item
    /// @dev Can use indexed buyer and seller addresses to filter events on frontend.
    event MarketItemSale(
        address indexed buyer,
        address indexed seller,
        uint256 itemId,
        address nftContract,
        uint256 tokenId
    );

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    /// @notice Creates the sale of a marketplace item, and transfers ownership of item, and funds between parties
    /// @dev Emits a MarketItemSale event upon completion
    /// @param nftContract The contract address that transfers ownership of the nft from market to buyer
    /// @param itemId The identifier for which market item is to be sold
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
        payable(owner()).transfer(listingPrice);

        emit MarketItemSale(
            msg.sender,
            idToMarketItem[itemId].seller,
            itemId,
            nftContract,
            tokenId
        );
    }

    /* Returns all unsold market items */
    /// @notice Fetches all unsold items listed on the market
    /// @dev Used to populate front end with available items for purchase and extension.
    /// @return Set of unsold MarketItems
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
}
