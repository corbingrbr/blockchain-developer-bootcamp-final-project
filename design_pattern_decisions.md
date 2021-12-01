Access Control Design Pattern:
    
    The NFTreeMarket contract extends Ownable and uses this to provide access control to the update market item listing price functionality.

Inheritance and Interfaces:
    
    The NFTreeMarket contract inherits the modifier nonReentrant by extending the openzeppelin contract ReentrancyGuard. This modifier is used to prevent re-entrancy attacks in the two most important functions, createMarketItem and createMarketSale. 

Optimizing Gas:

    The NFT contract does not store the all the metadata for an NFT, rather it just stores the metadata location via a token uri. This optimizes by lessening the amount of data needing be processed and stored on chain all while ensuring immutability if used in conjunction with ipfs.