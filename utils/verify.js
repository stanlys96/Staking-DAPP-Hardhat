const { run } = require('hardhat');

async function verify(contractAddress, arguments, contractPath) {
  console.log('Verifying...');
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: arguments,
      contract: contractPath,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes('already verified')) {
      console.log('Already verified!');
    } else {
      console.log(e);
    }
  }
}

module.exports = {
  verify,
};
