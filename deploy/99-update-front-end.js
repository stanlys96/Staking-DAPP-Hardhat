const { ethers, network } = require('hardhat');
const {
  frontEndAbiLocation,
  frontEndContractAddressesLocation,
  networkConfig,
  networkConfigLocation,
  abiContractsLocation,
  serverContractAddressesLocation,
  serverNetworkConfigLocation,
  serverAbiLocation,
} = require('../helper-hardhat-config');
const fs = require('fs');

require('dotenv');

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    await updateAbi();
    await updateContractAddresses();
    await updateNetworkConfig();
  }
};

async function updateAbi() {
  const contractsAbi = fs.readdirSync(abiContractsLocation);
  if (!fs.existsSync(frontEndAbiLocation)) {
    fs.mkdirSync(frontEndAbiLocation);
  }
  if (!fs.existsSync(serverAbiLocation)) {
    fs.mkdirSync(serverAbiLocation);
  }
  for (let i = 0; i < contractsAbi.length; i++) {
    const level1 = abiContractsLocation + contractsAbi[i];
    // console.log(fs.readdirSync(level1));
    const level1Arr = fs.readdirSync(level1);
    for (let j = 0; j < level1Arr.length; j++) {
      if (
        level1Arr[j].slice(level1Arr[j].length - 3, level1Arr[j].length) ===
        'sol'
      ) {
        const level2 =
          abiContractsLocation + contractsAbi[i] + '/' + level1Arr[j];
        const level2Arr = fs.readdirSync(level2);

        for (let k = 0; k < level2Arr.length; k++) {
          if (!level2Arr[k].includes('dbg')) {
            fs.appendFile(
              frontEndAbiLocation + '/' + level2Arr[k],
              '',
              (err) => {
                console.log(err);
              }
            );
            fs.copyFile(
              level2 + '/' + level2Arr[k],
              frontEndAbiLocation + '/' + level2Arr[k],
              (err) => {
                console.log(err);
              }
            );
            fs.appendFile(serverAbiLocation + '/' + level2Arr[k], '', (err) => {
              console.log(err);
            });
            fs.copyFile(
              level2 + '/' + level2Arr[k],
              serverAbiLocation + '/' + level2Arr[k],
              (err) => {
                console.log(err);
              }
            );
          }
        }
      } else {
        if (!level1Arr[j].includes('dbg')) {
          fs.appendFile(frontEndAbiLocation + '/' + level1Arr[j], '', (err) => {
            console.log(err);
          });
          fs.copyFile(
            level1 + '/' + level1Arr[j],
            frontEndAbiLocation + '/' + level1Arr[j],
            (err) => {
              console.log(err);
            }
          );
          fs.appendFile(serverAbiLocation + '/' + level1Arr[j], '', (err) => {
            console.log(err);
          });
          fs.copyFile(
            level1 + '/' + level1Arr[j],
            serverAbiLocation + '/' + level1Arr[j],
            (err) => {
              console.log(err);
            }
          );
        }
      }
    }
  }
}

async function updateNetworkConfig() {
  fs.writeFileSync(networkConfigLocation, JSON.stringify(networkConfig));
  fs.writeFileSync(serverNetworkConfigLocation, JSON.stringify(networkConfig));
}

async function updateContractAddresses() {
  const tokenFarm = await ethers.getContract('TokenFarm');
  const dappToken = await ethers.getContract('DappToken');
  const chainId = network.config.chainId.toString();
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractAddressesLocation, 'utf-8')
  );
  const serverContractAddresses = JSON.parse(
    fs.readFileSync(serverContractAddressesLocation, 'utf-8')
  );

  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]['TokenFarm'].includes(tokenFarm.address)) {
      contractAddresses[chainId]['TokenFarm'].push(tokenFarm.address);
    }
    if (!contractAddresses[chainId]['DappToken'].includes(dappToken.address)) {
      contractAddresses[chainId]['DappToken'].push(dappToken.address);
    }
  } else {
    contractAddresses[chainId] = {
      TokenFarm: [tokenFarm.address],
      DappToken: [dappToken.address],
    };
  }
  fs.writeFileSync(
    frontEndContractAddressesLocation,
    JSON.stringify(contractAddresses)
  );

  if (chainId in serverContractAddresses) {
    if (
      !serverContractAddresses[chainId]['TokenFarm'].includes(tokenFarm.address)
    ) {
      serverContractAddresses[chainId]['TokenFarm'].push(tokenFarm.address);
    }
    if (
      !serverContractAddresses[chainId]['DappToken'].includes(dappToken.address)
    ) {
      serverContractAddresses[chainId]['DappToken'].push(dappToken.address);
    }
  } else {
    serverContractAddresses[chainId] = {
      TokenFarm: [tokenFarm.address],
      DappToken: [dappToken.address],
    };
  }
  fs.writeFileSync(
    serverContractAddressesLocation,
    JSON.stringify(serverContractAddresses)
  );
}

module.exports.tags = ['all', 'update-front-end'];
