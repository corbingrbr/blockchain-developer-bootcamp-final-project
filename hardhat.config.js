require("@nomiclabs/hardhat-waffle");

require('dotenv').config()

module.exports = {
  solidity: "0.8.4",
  paths: {
    tests: "./test",
    cache: "./cache",
    artifacts: "./src/artifacts"
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.ROPSTEN_PRIVATE_KEY}`]
    }
  }
};