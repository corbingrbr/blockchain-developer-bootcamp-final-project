I recently was browsing OpenSea, the NFT site, for the first time and became acquainted with it a bit. I understood the concept of NFT's prior to this, however I was unaware of the ability to add a royalty fee to your work which I found to be a great feature for an artist to be able to capture value for their work post original sale.

This got me thinking of how royalties might work if there were to be several artists that collabed on the same piece of art, or the scenario where one artist signals their work is open to other peoples collaboration upon the condition that they receive royalities for the source material. This would create an interesting tree structure of royalty payouts I'd like to explore.

Typical user scenario:

1. Original artistA creates art and uploads it with a config for royalties, price, and collaboration details 
{ collabIsAllowed : boolean, collabDepthAllowed?: number, royalties: number}.

2. The original artistA will have an EOA for sales and royalties.

3. Should artistA provide the ability for their work to be extended by other artists, a secondhand artistB can access the original art, make their modifications to it and place their collaborative work artB up for sale.

4. Any sales of artB made by artistB are payed out to a SmartContractX which will split the sale's profit between the artistB's EOA and artistA's EOA. 

5. This model can be extended to further depth, creating the tree structure of royalties. A thirdhand artistC can extend the work done by the secondhand artistB and their payable address will be a SmartContractY that divides profit between the artistB's payable address SmartContractX and artistC's EOA.

Two things which potentially concern me regarding this idea are:
    1. Gas cost estimation, not sure if/when the recursive nature of the payment transaction poses issue
    2. Call stack size may limit the total height of a collaboration tree when processing transactions.

Either way, I find this to be quite an exciting way to experience multi transaction operations and a way to explore how artists could collaborate in a decentralized marketplace.



