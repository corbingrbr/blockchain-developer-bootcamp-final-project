const hre = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const NFTreeMarket = await hre.ethers.getContractFactory("NFTreeMarket");
  const nftreeMarket = await NFTreeMarket.deploy();
  await nftreeMarket.deployed();
  console.log("nftreeMarket deployed to:", nftreeMarket.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftreeMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
