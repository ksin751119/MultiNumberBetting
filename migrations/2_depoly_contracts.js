// #1 Get an instance of the contract to be deployed/migrated

var MultiNumberBetting = artifacts.require("./MultiNumberBetting.sol");

module.exports = function(deployer) {
  // #2 Deploy the instance of the contract
  deployer.deploy(MultiNumberBetting, 1, 5, 10);
  
};