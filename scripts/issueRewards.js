const { ethers } = require('hardhat');

async function issueRewards() {
  const accounts = await ethers.getSigners();
  const dappTokenContract = await ethers.getContract('DappToken');
  const tokenFarm = await ethers.getContract('TokenFarm');

  const tx = await tokenFarm.issueRewards();
  const receipt = await tx.wait(1);
  console.log(receipt);
}

issueRewards()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
