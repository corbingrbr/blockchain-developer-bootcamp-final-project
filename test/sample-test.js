/* test/sample-test.js */
const { expect } = require("chai");
const { ethers } = require("hardhat");

const toReadableNumber = (big_number) => (+ethers.utils.formatEther(big_number)).toFixed(4)

describe("NFTMarket", function () {

    it("Should calculate royalties", async function () {
        /* deploy the marketplace */
        const Market = await ethers.getContractFactory("NFTMarket")
        const market = await Market.deploy()
        await market.deployed()

        expect(await market.calcRoyalties(ethers.utils.parseUnits('100', 'ether'), 2500)).to.equal(ethers.utils.parseUnits('25', 'ether'));
        expect(await market.calcRoyalties(ethers.utils.parseUnits('100', 'ether'), 0)).to.equal(ethers.utils.parseUnits('0', 'ether'));
        expect(await market.calcRoyalties(ethers.utils.parseUnits('100', 'ether'), 10000)).to.equal(ethers.utils.parseUnits('100', 'ether'));
    })

    it("Should fail if provided royalty rates exceeds 10000", async function () {
        // deploy the marketplace
        const Market = await ethers.getContractFactory("NFTMarket")
        const market = await Market.deploy()
        await market.deployed()
        const marketAddress = market.address

        // deploy the NFT contract
        const NFT = await ethers.getContractFactory("NFT")
        const nft = await NFT.deploy(marketAddress)
        await nft.deployed()
        const nftContractAddress = nft.address

        let listingPrice = await market.getListingPrice();

        const auctionPrice = ethers.utils.parseUnits('100', 'ether')

        const [artistAAddress] = await ethers.getSigners()

        const GOOD_ROYALTY_RATE = 500; // 5%
        const BAD_ROYALTY_RATE = 20000; // 50%

        // create two tokens
        await nft.connect(artistAAddress).createToken("https://www.mytokenlocation.com")

        // Create parent marketItem
        await expect(market.connect(artistAAddress).createMarketItem(nftContractAddress, 1, auctionPrice, 0, BAD_ROYALTY_RATE, true, GOOD_ROYALTY_RATE, GOOD_ROYALTY_RATE, { value: listingPrice.toString() }))
            .to.be.revertedWith("royalty_rate specified exceeds that of 10000 (100%)");

        await expect(market.connect(artistAAddress).createMarketItem(nftContractAddress, 1, auctionPrice, 0, GOOD_ROYALTY_RATE, true, BAD_ROYALTY_RATE, GOOD_ROYALTY_RATE, { value: listingPrice.toString() }))
            .to.be.revertedWith("child_min_royalty_rate specified exceeds that of 10000 (100%)");

        await expect(market.connect(artistAAddress).createMarketItem(nftContractAddress, 1, auctionPrice, 0, GOOD_ROYALTY_RATE, true, GOOD_ROYALTY_RATE, BAD_ROYALTY_RATE, { value: listingPrice.toString() }))
            .to.be.revertedWith("child_royalty_rate specified exceeds that of 10000 (100%)");

    })

    it("Should fail if provided parentItemId does not exist", async function () {
        // deploy the marketplace
        const Market = await ethers.getContractFactory("NFTMarket")
        const market = await Market.deploy()
        await market.deployed()
        const marketAddress = market.address

        // deploy the NFT contract
        const NFT = await ethers.getContractFactory("NFT")
        const nft = await NFT.deploy(marketAddress)
        await nft.deployed()
        const nftContractAddress = nft.address

        let listingPrice = await market.getListingPrice();

        const auctionPrice = ethers.utils.parseUnits('100', 'ether')

        const [artistAAddress] = await ethers.getSigners()

        const ARTIST_A_ROYALTY_RATE = 500; // 5%
        const ARTIST_A_CHILD_ROYALTY_RATE = 5000; // 50%

        const CHILD_MIN_ROYALTY_RATE = 500; // 5%

        // create two tokens
        await nft.connect(artistAAddress).createToken("https://www.mytokenlocation.com")

        // Create parent marketItem
        await expect(market.connect(artistAAddress).createMarketItem(nftContractAddress, 1, auctionPrice, 4, ARTIST_A_ROYALTY_RATE, true, CHILD_MIN_ROYALTY_RATE, ARTIST_A_CHILD_ROYALTY_RATE, { value: listingPrice.toString() }))
            .to.be.revertedWith("parentItemId specified for this create market item does not exist");
    })

    it("Should create and execute market sales", async function () {
        // deploy the marketplace
        const Market = await ethers.getContractFactory("NFTMarket")
        const market = await Market.deploy()
        await market.deployed()
        const marketAddress = market.address

        // deploy the NFT contract 
        const NFT = await ethers.getContractFactory("NFT")
        const nft = await NFT.deploy(marketAddress)
        await nft.deployed()
        const nftContractAddress = nft.address

        let listingPrice = await market.getListingPrice()
        listingPrice = listingPrice.toString()

        const auctionPrice = ethers.utils.parseUnits('1', 'ether')

        // create two tokens 
        await nft.createToken("https://www.mytokenlocation.com")
        await nft.createToken("https://www.mytokenlocation2.com")

        // put both tokens for sale 
        await market.createMarketItem(nftContractAddress, 1, auctionPrice, 0, 0, true, 0, 0, { value: listingPrice })
        await market.createMarketItem(nftContractAddress, 2, auctionPrice, 0, 0, true, 0, 0, { value: listingPrice })

        const [_, buyerAddress] = await ethers.getSigners()

        // query for and return the unsold items 
        let items = await market.fetchMarketItems()

        expect(items.length).to.equal(2);

        // execute sale of token to another user 
        await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice })

        // query for and return the unsold items
        items = await market.fetchMarketItems()

        expect(items.length).to.equal(1);
    })

    it("Should fail if a child's royalty rate provided for create market item is less than required by parent", async function () {

        // deploy the marketplace
        const Market = await ethers.getContractFactory("NFTMarket")
        const market = await Market.deploy()
        await market.deployed()
        const marketAddress = market.address

        // deploy the NFT contract
        const NFT = await ethers.getContractFactory("NFT")
        const nft = await NFT.deploy(marketAddress)
        await nft.deployed()
        const nftContractAddress = nft.address

        let listingPrice = await market.getListingPrice();

        const auctionPrice = ethers.utils.parseUnits('100', 'ether')

        const [artistAAddress, artistBAddress] = await ethers.getSigners()

        const ARTIST_A_ROYALTY_RATE = 500; // 5%
        const ARTIST_A_CHILD_ROYALTY_RATE = 5000; // 50%

        const LESS_THAN_5_PERCENT = 200 // 2%;
        const ARTIST_B_CHILD_ROYALTY_RATE = 2500; // 50%

        const CHILD_MIN_ROYALTY_RATE = 500; // 5%

        // create two tokens
        await nft.connect(artistAAddress).createToken("https://www.mytokenlocation.com")
        await nft.connect(artistBAddress).createToken("https://www.mytokenlocation2.com")

        // Create parent marketItem
        await market.connect(artistAAddress).createMarketItem(nftContractAddress, 1, auctionPrice, 0, ARTIST_A_ROYALTY_RATE, true, CHILD_MIN_ROYALTY_RATE, ARTIST_A_CHILD_ROYALTY_RATE, { value: listingPrice.toString() })

        // Create child marketItem and expect failure
        await expect(market.connect(artistBAddress).createMarketItem(nftContractAddress, 2, auctionPrice, 1, LESS_THAN_5_PERCENT, true, CHILD_MIN_ROYALTY_RATE, ARTIST_B_CHILD_ROYALTY_RATE, { value: listingPrice.toString() }))
            .to.be.revertedWith('Supplied royalty_rate does not match or exceed that required by parent');
    })

    it("Should create a NFTree with one child and when market sale of child, parent receives proper royalties", async function () {
        // deploy the marketplace
        const Market = await ethers.getContractFactory("NFTMarket")
        const market = await Market.deploy()
        await market.deployed()
        const marketAddress = market.address

        // deploy the NFT contract
        const NFT = await ethers.getContractFactory("NFT")
        const nft = await NFT.deploy(marketAddress)
        await nft.deployed()
        const nftContractAddress = nft.address

        let listingPrice = await market.getListingPrice();

        const auctionPrice = ethers.utils.parseUnits('100', 'ether')

        const [_, artistAAddress, artistBAddress, buyerAddress] = await ethers.getSigners()

        const ARTIST_A_ROYALTY_RATE = 500; // 5%
        const ARTIST_A_CHILD_ROYALTY_RATE = 5000; // 50%

        const ARTIST_B_ROYALTY_RATE = 1000; // 10%
        const ARTIST_B_CHILD_ROYALTY_RATE = 2500; // 50%

        const CHILD_MIN_ROYALTY_RATE = 500; // 5%


        const HUNDRED_PERCENT = 10000; // 100%

        // create two tokens
        await nft.connect(artistAAddress).createToken("https://www.mytokenlocation.com")
        await nft.connect(artistBAddress).createToken("https://www.mytokenlocation2.com")

        // Create parent marketItem
        await market.connect(artistAAddress).createMarketItem(nftContractAddress, 1, auctionPrice, 0, ARTIST_A_ROYALTY_RATE, true, CHILD_MIN_ROYALTY_RATE, ARTIST_A_CHILD_ROYALTY_RATE, { value: listingPrice.toString() })

        // Create child marketItem
        await market.connect(artistBAddress).createMarketItem(nftContractAddress, 2, auctionPrice, 1, ARTIST_B_ROYALTY_RATE, true, CHILD_MIN_ROYALTY_RATE, ARTIST_B_CHILD_ROYALTY_RATE, { value: listingPrice.toString() })

        let artistAStartingBalance = await ethers.provider.getBalance(artistAAddress.address);

        // Execute sale of child token
        await market.connect(buyerAddress).createMarketSale(nftContractAddress, 2, { value: auctionPrice })

        // Expect signer balances to reflect sales made according to royalty and price configurations
        const artistARoyaltiesFromBSale = auctionPrice.mul(ARTIST_B_ROYALTY_RATE * ARTIST_A_CHILD_ROYALTY_RATE).div(HUNDRED_PERCENT * HUNDRED_PERCENT);

        // Artist A should receive royalties from artist B's sale
        expect(await ethers.provider.getBalance(artistAAddress.address)).to.equal(artistAStartingBalance.add(artistARoyaltiesFromBSale));
    })


    it("Should create a NFTree with grandchild and when market sale of grandchild, parent and grandparent receive proper royalties", async function () {
        // deploy the marketplace
        const Market = await ethers.getContractFactory("NFTMarket")
        const market = await Market.deploy()
        await market.deployed()
        const marketAddress = market.address

        // deploy the NFT contract
        const NFT = await ethers.getContractFactory("NFT")
        const nft = await NFT.deploy(marketAddress)
        await nft.deployed()
        const nftContractAddress = nft.address

        let listingPrice = await market.getListingPrice();

        const auctionPrice = ethers.utils.parseUnits('100', 'ether')

        const [_, artistAAddress, artistBAddress, artistCAddress, buyerAddress] = await ethers.getSigners()

        const ARTIST_A_ROYALTY_RATE = 500; // 5%
        const ARTIST_A_CHILD_ROYALTY_RATE = 2000; // 20%

        const ARTIST_B_ROYALTY_RATE = 1000; // 10%
        const ARTIST_B_CHILD_ROYALTY_RATE = 2500; // 50%

        const ARTIST_C_ROYALTY_RATE = 1000; // 10%
        const ARTIST_C_CHILD_ROYALTY_RATE = 2500; // 50%

        const CHILD_MIN_ROYALTY_RATE = 500; // 5%

        const HUNDRED_PERCENT = 10000; // 100%

        // create two tokens
        await nft.connect(artistAAddress).createToken("https://www.mytokenlocation.com")
        await nft.connect(artistBAddress).createToken("https://www.mytokenlocation2.com")
        await nft.connect(artistCAddress).createToken("https://www.mytokenlocation3.com")

        // Create parent marketItem
        await market.connect(artistAAddress).createMarketItem(nftContractAddress, 1, auctionPrice, 0, ARTIST_A_ROYALTY_RATE, true, CHILD_MIN_ROYALTY_RATE, ARTIST_A_CHILD_ROYALTY_RATE, { value: listingPrice.toString() })

        // Create child marketItem
        await market.connect(artistBAddress).createMarketItem(nftContractAddress, 2, auctionPrice, 1, ARTIST_B_ROYALTY_RATE, true, CHILD_MIN_ROYALTY_RATE, ARTIST_B_CHILD_ROYALTY_RATE, { value: listingPrice.toString() })

        await market.connect(artistCAddress).createMarketItem(nftContractAddress, 3, auctionPrice, 2, ARTIST_C_ROYALTY_RATE, true, CHILD_MIN_ROYALTY_RATE, ARTIST_C_CHILD_ROYALTY_RATE, { value: listingPrice.toString() })

        let artistAStartingBalance = await ethers.provider.getBalance(artistAAddress.address);
        let artistBStartingBalance = await ethers.provider.getBalance(artistBAddress.address);

        // Execute sale of child token
        await market.connect(buyerAddress).createMarketSale(nftContractAddress, 3, { value: auctionPrice })

        // Expect signer balances to reflect sales made according to royalty and price configurations
        const artistBRoyaltiesFromCSale = auctionPrice.mul(ARTIST_C_ROYALTY_RATE * ARTIST_B_CHILD_ROYALTY_RATE).div(HUNDRED_PERCENT * HUNDRED_PERCENT);

        const artistARoyaltiesFromCSale = artistBRoyaltiesFromCSale.mul(ARTIST_A_CHILD_ROYALTY_RATE).div(HUNDRED_PERCENT);

        // Artist A should receive royalties from artist B's sale
        expect(await ethers.provider.getBalance(artistAAddress.address)).to.equal(artistAStartingBalance.add(artistARoyaltiesFromCSale));
        expect(await ethers.provider.getBalance(artistBAddress.address)).to.equal(artistBStartingBalance.add(artistBRoyaltiesFromCSale).sub(artistARoyaltiesFromCSale));
    })
})
