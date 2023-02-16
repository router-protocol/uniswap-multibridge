import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const routerGateway: { [key: number]: string } = {
    5: '0x12C9A8B2e3Db12ddC411a64D6a75f47E6642f026',
    80001: '0xB139915AE11f6f0ACd05C8dB85E8ED1bE1c7c17d'
  };

  const chainId = Number(await hre.getChainId());

  const constructorArgs = [
    routerGateway[chainId] //_routerGateway
  ];

  const result = await deploy('RouterReceiverAdapter', {
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

deployFunc.tags = ['0004_router_receiver'];
deployFunc.dependencies = [];
export default deployFunc;
