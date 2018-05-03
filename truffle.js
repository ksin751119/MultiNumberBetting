// Allows us to use ES6 in our migrations and tests.
require('babel-register')
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "";

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ropsten: { 
      provider: function() { 
        return new HDWalletProvider(mnemonic,
                "") 
        }, 
      network_id: 3,
      gas:"2700000"
    }
  }
}
