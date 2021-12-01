Project Description:
    
    My idea for this project was to create a simple NFT market which had the potential to develop tree-like relationships amongst its tokens. I liked this concept because it pays homage to the idea that art is collaborative in nature, and that one piece is often the product of experiencing another. These tree-like relationships would also then allow me explore the percolation of royalty payments among related ancestor tokens after a token sale.

    The way this works: user starts on the homepage and will have a view of all unsold market items. From here they can either purchase a nft, create their own, or branch an existing one. The first two are standard for nft markets. The third was the item I explored with this project. To branch an nft, the user clicks the Branch' button at the bottom of a token card, if present, and uploads their extended/customized piece along with other details such as royalty and name. Upon the listing, the market identifies this item as a child of another and when it is ultimately purchased, its royalties gained from the sale are distributed to its ancestors based upon royalty configurations dictated by those listings.

Directory Structure:

    This follows the standard structure of a hardhat setup. The only nuance being that artifacts are placed inside the src dir to provide the front end access to the abi's.

    contracts - solidity Contracts
    public - static files/images
    scripts - deploy script
    src - frontend react files
    test - test script

Installing Dependencies:

    yarn install

Unit Tests:

    npx hardhat test

Running Locally: 

    npx hardhat node
    npx hardhat compile
    npx hardhat run scripts/deploy.js --network localhostnpx hardhat deploy

    yarn run start -> localhost:3000

Frontend Project Location:

    !!FILL ME IN AFTER DEPLOYMENT WHEREVER!!

Public Ethereum address:

    0xc88F5B2DDC96d016af31C1b5939d97072300382E

Screencast Link:

    https://www.loom.com/share/c278611602164f2e89bc3266e241f632