const { run } = require('hardhat');

async function verify(contractAddress, arguments) {
  console.log('Verifying...');
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: arguments,
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
