var Artist = artifacts.require('Artist');

module.exports = function(deployer) {
  deployer.deploy(Artist, 1000);
};
