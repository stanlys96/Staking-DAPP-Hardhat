const { ethers } = require('hardhat');

async function getRewardValue() {
  const accounts = await ethers.getSigners();
  const dappTokenContract = await ethers.getContract('DappToken');
  const tokenFarm = await ethers.getContract('TokenFarm');

  const hehehe = await tokenFarm.addressToDappReward(accounts[0].address);
  console.log(ethers.utils.formatEther(hehehe.toString()));

  // const tx = await tokenFarm.get10DappToken();
  // await tx.wait(1);
}

getRewardValue()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
