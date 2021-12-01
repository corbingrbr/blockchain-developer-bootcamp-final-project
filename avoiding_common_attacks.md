Proper use of require, assert, revert:
    
    For the createMarketItem function in the NFTreeMarket contract, requires are used to ensure proper percentages are provided, tree structure is properly defined between existing items and that royalties required by parents are respected by their children.

Re-entrancy:
    
    The NFTreeMarket contract inherits the modifier nonReentrant by extending the openzeppelin contract ReentrancyGuard. This modifier is used to prevent re-entrancy attacks in the two most important functions, createMarketItem and createMarketSale. 



