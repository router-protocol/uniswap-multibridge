import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const routerGateway: { [key: number]: string } = {
    5: '0xC394fEbBdfbEE807c9DA149272f073a6153Aa002',
    80001: '0x1be1D72a6160aC05F5Bb9760830a444DA4aA9c45'
  };

  const chainId = Number(await hre.getChainId());

  const constructorArgs = [
    routerGateway[chainId] //_routerGateway
  ];

  const result = await deploy('RouterSenderAdapter', {
    from: deployer,
    log: true,
    args: constructorArgs
  });
  try {
    await hre.run('verify:verify', { address: result.address, constructorArguments: constructorArgs });
  } catch (err) {
    console.log(err);
  }
};

deployFunc.tags = ['0003_router_sender'];
deployFunc.dependencies = [];
export default deployFunc;
