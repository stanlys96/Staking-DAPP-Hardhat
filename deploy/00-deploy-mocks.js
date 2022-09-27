const { network, ethers } = require('hardhat');

const USD_DECIMALS = 18;

// We use 8 decimals for USD based currencies
const ETH_USD_INITIAL_PRICE = ethers.utils.parseUnits('1000', 8); // 1 ETH = $1,000
const DAI_USD_INITIAL_PRICE = ethers.utils.parseUnits('1', 8); // 1 DAI = $1
const INITIAL_PRICE = ethers.utils.parseEther('2000');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // If we are on a local development network, we need to deploy mocks!
  if (chainId == 31337) {
    log('Local network detected! Deploying mocks...');
    await deploy('DAI', {
      contract: 'MockDAI',
      from: deployer,
      log: true,
      args: [],
    });
    await deploy('WETH', {
      contract: 'MockWETH',
      from: deployer,
      log: true,
      args: [],
    });
    // For stablecoins
    await deploy('AggregatorV3Mock', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [USD_DECIMALS, INITIAL_PRICE],
    });
    log('Mocks Deployed!');
    log('----------------------------------------------------');
    log(
      "You are deploying to a local network, you'll need a local network running to interact"
    );
    log(
      'Please run `yarn hardhat console` to interact with the deployed smart contracts!'
    );
    log('----------------------------------------------------');
  }
};
module.exports.tags = ['all', 'mocks'];
