const { ethers } = require('hardhat');

async function main() {
  const accounts = await ethers.getSigners();
  const dappTokenContract = await ethers.getContract('DappToken');
  const tokenFarm = await ethers.getContract('TokenFarm');

  console.log((await dappTokenContract.totalSupply()).toString());

  const totalSupply = await dappTokenContract.totalSupply();

  const tx = await dappTokenContract.transfer(tokenFarm.address, '10');
  const txReceipt = await tx.wait(1);
  const walaoEh = await dappTokenContract.getWalaoEh();
  console.log(walaoEh);
  const tx2 = await dappTokenContract.setWalaoEh('WALAO');
  await tx2.wait(1);
  const walaoEhUpdated = await dappTokenContract.getWalaoEh();
  console.log(walaoEhUpdated);
  console.log((await dappTokenContract.totalSupply()).toString());
  const tokenFarmDappTokenBalance = await dappTokenContract.balanceOf(
    tokenFarm.address
  );
  console.log(tokenFarmDappTokenBalance.toString());
  // const wethTokenAddress = networkConfig['WALAO'];
  // addAllowedTokens(tokenFarm, allowedTokensObj);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
