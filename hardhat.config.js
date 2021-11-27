require("@nomiclabs/hardhat-waffle");

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
    }
  }
};