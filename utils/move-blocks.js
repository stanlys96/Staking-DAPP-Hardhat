const { network } = require('hardhat');

async function sleep(timeInMs) {
  return new Promise((resolve, reject) => setTimeout(resolve, timeInMs));
}

async function moveBlocks(blocks, sleepAmount = 0) {
  console.log('Moving blocks...');
  for (let i = 0; i < blocks; i++) {
    await network.provider.request({
      method: 'evm_mine',
      args: [],
    });

    if (sleepAmount) {
      await sleep(sleepAmount);
    }
  }
  console.log(`Moved ${blocks} blocks...`);
}

module.exports = {
  sleep,
  moveBlocks,
};
