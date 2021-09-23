I recently was browsing OpenSea, the NFT site, and became acquainted with it a bit. I understood the concept of NFT's prior to this, however I was unaware of the ability to add a royalty fee to your work which I found to be a great feature for an artist to be able to capture value for their work post original sale.

This got me thinking of how royalties might work if there were to be several artists that collabed on the same piece of art, or the scenario where one artist signals their work is open to other peoples collaboration upon the condition that they receive royalities for the source material. This would create an interesting tree structure of royalty payouts I'd like to explore.

Typical user scenario:

1. Original artist creates art and uploads it with a config for royalties, price, and allowing collaboration boolean.

2. The original artist will have an EOA for sales and royalties.

3. Should the NFT provide the ability to be extended by other artists, a secondhand artist can access the original art, make their modifications to it and place their collaborative work up for sale.

4. Any sales made by the second hand artist are payed out to a SmartContractA which will split the sale's profit between the secondhand artist's EOA and the royalties they owe the original artist EOA. 

5. This model can be extended to further depth, creating the tree structure of royalties. A thirdhand artist can extend the work done by the secondhand artist and their payable address will be a smart contract that divides profit between the secondhand artist's payable smart contract address and their own.

Two things which concern me about this idea are:
    1. Gas cost estimation, not sure if/when the recursive nature of the payment transaction poses issue
    2. Call stack size may limit the total height a royalty tree can be made.



