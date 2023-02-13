import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const result = await deploy('MultiBridgeReceiver', {
    from: deployer,
    log: true
  });
  try {
    await hre.run('verify:verify', { address: result.address });
  } catch (err) {
    console.log(err);
  }
};

deployFunc.tags = ['0002_multi_bridge_receiver'];
deployFunc.dependencies = [];
export default deployFunc;
