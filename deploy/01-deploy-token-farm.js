const { ethers, network } = require('hardhat');
const {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');
require('dotenv').config();

const KEPT_BALANCE = ethers.utils.parseEther('100');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const waitConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  const dappToken = await deploy('DappToken', {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: waitConfirmations,
  });

  const tokenFarmArgs = [dappToken.address];
  console.log(dappToken.address, '<<<<<');

  const tokenFarm = await deploy('TokenFarm', {
    from: deployer,
    log: true,
    args: tokenFarmArgs,
    waitConfirmations: waitConfirmations,
  });

  const dappTokenContract = await ethers.getContract('DappToken', deployer);
  const tokenFarmContract = await ethers.getContract('TokenFarm', deployer);

  const totalSupply = await dappTokenContract.totalSupply();

  // const tx = await dappTokenContract.transfer(
  //   tokenFarm.address,
  //   (totalSupply - KEPT_BALANCE).toLocaleString('fullwide', {
  //     useGrouping: false,
  //   })
  // );
  // await tx.wait(1);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(tokenFarm.address, tokenFarmArgs);
    await verify(dappToken.address, []);
  }

  if (network.config.chainId == '31337') {
    const dai = await ethers.getContract('DAI');
    const weth = await ethers.getContract('WETH');
    const aggregatorV3Mock = await ethers.getContract('AggregatorV3Mock');

    // Add Allowed Tokens
    await tokenFarmContract.addAllowedTokens(dai.address);
    await tokenFarmContract.addAllowedTokens(dappToken.address);
    await tokenFarmContract.addAllowedTokens(weth.address);

    // Add Price Feed Contract
    await tokenFarmContract.setPriceFeedContract(
      dappToken.address,
      aggregatorV3Mock.address
    );
    await tokenFarmContract.setPriceFeedContract(
      dai.address,
      aggregatorV3Mock.address
    );
    await tokenFarmContract.setPriceFeedContract(
      weth.address,
      aggregatorV3Mock.address
    );
  } else {
    // Add Allowed Tokens
    const tx1 = await tokenFarmContract.addAllowedTokens(
      networkConfig[network.config.chainId]['dai']
    );
    await tx1.wait(1);
    const tx2 = await tokenFarmContract.addAllowedTokens(dappToken.address);
    await tx2.wait(1);
    const tx3 = await tokenFarmContract.addAllowedTokens(
      networkConfig[network.config.chainId]['weth']
    );
    await tx3.wait(1);

    // Add Price Feed Contract
    const tx4 = await tokenFarmContract.setPriceFeedContract(
      dappToken.address,
      networkConfig[network.config.chainId]['daiUsdPriceFeed']
    );
    await tx4.wait(1);
    const tx5 = await tokenFarmContract.setPriceFeedContract(
      networkConfig[network.config.chainId]['dai'],
      networkConfig[network.config.chainId]['daiUsdPriceFeed']
    );
    await tx5.wait(1);
    const tx6 = await tokenFarmContract.setPriceFeedContract(
      networkConfig[network.config.chainId]['weth'],
      networkConfig[network.config.chainId]['ethUsdPriceFeed']
    );
    await tx6.wait(1);
  }
};

module.exports.tags = ['all', 'token-farm'];
