var InvestmentScreen = artifacts.require("./InvestmentScreen.sol");

module.exports = function(deployer) {
  deployer.deploy(InvestmentScreen);
};