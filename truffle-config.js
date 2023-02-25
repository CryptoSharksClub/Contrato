require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');

const fs = require('fs');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    ptestnet: {
      provider: function () {
        return new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RINKEBY_RPC_URL);
      },
      network_id: 80001,
      skipDryRun: true,
    },
    mainnet: {
      provider: function () {
        return new HDWalletProvider(process.env.PRIVATE_KEY, process.env.MAINNET_RPC_URL);
      },
      network_id: 137,
      skipDryRun: true,
    },
    truffle: {
      url: 'http://localhost:24012/rpc',
      network_id: '137',
      timeout: 4000000,
      gasMultiplier: 1,
    }
  },
  mocha: {
  },
  compilers: {
    solc: {
      version: "0.8.9",
    }
  },
  db: {
    enabled: false
  }
}
