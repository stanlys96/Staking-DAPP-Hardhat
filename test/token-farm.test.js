const { assert, expect } = require('chai');
const { network, deployments, ethers } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Lending Unit Tests', function () {
      let tokenFarm, dai, weth, dappToken, deployer, player, aggregatorV3Mock;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        await deployments.fixture(['mocks', 'token-farm']);
        tokenFarm = await ethers.getContract('TokenFarm');
        weth = await ethers.getContract('WETH');
        dai = await ethers.getContract('DAI');
        dappToken = await ethers.getContract('DappToken');
        aggregatorV3Mock = await ethers.getContract('AggregatorV3Mock');
      });

      describe('Test allowed tokens', function () {
        it('Correctly updates allowedTokens array', async function () {
          assert.equal(await tokenFarm.allowedTokens(0), dai.address);
        });

        it('Correctly updates priceFeedMapping', async function () {
          assert.equal(
            await tokenFarm.tokenPriceFeedMapping(dai.address),
            aggregatorV3Mock.address
          );
        });

        it('Should revert if setPriceFeedContract is called by other than deployer', async function () {
          const playerTokenFarm = await tokenFarm.connect(player);
          await expect(
            playerTokenFarm.setPriceFeedContract(
              dappToken.address,
              aggregatorV3Mock.address
            )
          ).to.be.reverted;
        });
      });
    });
