const { ethers } = require('hardhat');

const AMOUNT = ethers.utils.parseEther('1');

async function stakeSomething() {
  const accounts = await ethers.getSigners();
  const dappTokenContract = await ethers.getContract('DappToken');
  const tokenFarm = await ethers.getContract('TokenFarm');

  const tx1 = await dappTokenContract.approve(tokenFarm.address, AMOUNT);
  await tx1.wait(1);

  const tx2 = await tokenFarm.stakeTokens(AMOUNT, dappTokenContract.address);
  const receipt = await tx2.wait(1);
  console.log(receipt);
}

stakeSomething()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
