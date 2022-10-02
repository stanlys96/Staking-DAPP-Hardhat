const { ethers } = require('hardhat');

async function getDappToken() {
  const accounts = await ethers.getSigners();
  const dappTokenContract = await ethers.getContract('DappToken');
  const tokenFarm = await ethers.getContract('TokenFarm');

  const hehehe = await dappTokenContract.balanceOf(accounts[0].address);
  // const hehehe = await dappTokenContract.balanceOf(tokenFarm.address);
  console.log(ethers.utils.formatEther(hehehe.toString()));

  // const tx = await tokenFarm.get10DappToken();
  // await tx.wait(1);
}

getDappToken()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
