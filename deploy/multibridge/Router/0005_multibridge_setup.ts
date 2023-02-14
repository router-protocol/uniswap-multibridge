import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { address as routerReceiverGoerli } from '../../../deployments/goerli/RouterReceiverAdapter.json';
import { address as routerReceierMumbai } from '../../../deployments/polygonTest/RouterReceiverAdapter.json';
import { address as routerSenderGoerli } from '../../../deployments/goerli/RouterSenderAdapter.json';
import { address as routerSenderMumbai } from '../../../deployments/polygonTest/RouterSenderAdapter.json';

dotenv.config();

async function GetInstance(contractName: string, hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const contractAddress = (await deployments.get(contractName)).address;
  const factory = await hre.ethers.getContractFactory(contractName, deployer);
  return await factory.attach(contractAddress);
}

async function waitTx(tx: any) {
  const blockConfirmations = 1;
  console.log(`Waiting ${blockConfirmations} block confirmations for tx ${tx.hash} ...`);
  const receipt = await tx.wait(blockConfirmations);
  console.log(receipt);
}

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const mockCallerInstance = await GetInstance('MockCaller', hre);
  const multiBridgeSenderInstance = await GetInstance('MultiBridgeSender', hre);
  const multiBridgeReceiverInstance = await GetInstance('MultiBridgeReceiver', hre);
  const routerSenderAdapterInstance = await GetInstance('RouterSenderAdapter', hre);
  const routerReceiverAdapterInstance = await GetInstance('RouterReceiverAdapter', hre);

  console.log('grantRole CALLER_ROLE: ', deployer);
  const CALLER_ROLE = await mockCallerInstance.CALLER_ROLE();
  let tx = await mockCallerInstance.grantRole(CALLER_ROLE, deployer);
  await waitTx(tx);

  console.log('mockCaller setMultiBridgeSender: ', multiBridgeSenderInstance.address);
  tx = await mockCallerInstance.setMultiBridgeSender(multiBridgeSenderInstance.address);
  await waitTx(tx);

  console.log('addSenderAdapters routerSenderAdapter: ', routerSenderAdapterInstance.address);
  tx = await mockCallerInstance.addSenderAdapters([routerSenderAdapterInstance.address]);
  await waitTx(tx);

  console.log('multiBridgeReceiver initialize', routerSenderAdapterInstance.address);
  tx = await multiBridgeReceiverInstance.initialize(
    [routerReceiverAdapterInstance.address], //address[] memory _receiverAdapters,
    [100], //uint32[] memory _powers,
    70
  ); //uint64 _quorumThreshold
  await waitTx(tx);

  const chainIds = [5, 80001];
  const receiverAdapters = [routerReceiverGoerli, routerReceierMumbai];

  //updateReceiverAdapter(uint64[] calldata _dstChainIds, address[] calldata _receiverAdapters)
  console.log('updateReceiverAdapter', chainIds, receiverAdapters);
  tx = await routerSenderAdapterInstance.updateReceiverAdapter(chainIds, receiverAdapters);
  await waitTx(tx);
  //setMultiBridgeSender(address _multiBridgeSender)
  console.log('setMultiBridgeSender', multiBridgeSenderInstance.address);
  tx = await routerSenderAdapterInstance.setMultiBridgeSender(multiBridgeSenderInstance.address);
  await waitTx(tx);

  const senderAdapters = [routerSenderGoerli, routerSenderMumbai];
  //updateSenderAdapter(uint256[] calldata _srcChainIds, address[] calldata _senderAdapters)
  console.log('updateSenderAdapter', chainIds, senderAdapters);
  tx = await routerReceiverAdapterInstance.updateSenderAdapter(chainIds, senderAdapters);
  await waitTx(tx);
  //setMultiBridgeReceiver(address _multiBridgeReceiver)
  console.log('setMultiBridgeReceiver', multiBridgeReceiverInstance.address);
  tx = await routerReceiverAdapterInstance.setMultiBridgeReceiver(multiBridgeReceiverInstance.address);
  await waitTx(tx);
};

deployFunc.tags = ['0005_multibridge_setup'];
deployFunc.dependencies = [];
export default deployFunc;
