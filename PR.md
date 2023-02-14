#Added Router Protocol Adapters

- RouterSenderAdapter
- RouterReceiverAdapter

MockCaller with AccessControl added by deBridge was used. This contract allows auth wallets to call remoteCall and is needed only for test env.

#Added deploy script

- 0000_mock_caller (Not use for prod)

- 0001_multi_bridge_sender (Need to set real caller for prod)
- 0002_multi_bridge_receiver
- 0003_debridge_sender
- 0004_debridge_receiver
- 0005_multibridge_setup (configured for router adapters)

##Deployment dev env

Contracts deployed on Polygon Mumbai and Ethereum Goerli chains and configured to send message two way. Mumbai=>Goerli, Goerli=>Mumbai

##Addresses
Smart Contract | Mumbai Chain | Goerli Chain
------------- | ------------- | ------------
MockCaller | [0xFf6344206E355428E6C89D6f1D2598033675B3D6](https://mumbai.polygonscan.com/address/0xFf6344206E355428E6C89D6f1D2598033675B3D6) | [0xFf6344206E355428E6C89D6f1D2598033675B3D6](https://goerli.etherscan.io/address/0xFf6344206E355428E6C89D6f1D2598033675B3D6)
MultiBridgeSender | [0xAC3F9d83358EF3Ead3FF7f2F4bE89ba96D9D7a9B](https://mumbai.polygonscan.com/address/0xAC3F9d83358EF3Ead3FF7f2F4bE89ba96D9D7a9B) | [0xAC3F9d83358EF3Ead3FF7f2F4bE89ba96D9D7a9B](https://goerli.etherscan.io/address/0xAC3F9d83358EF3Ead3FF7f2F4bE89ba96D9D7a9B)
MultiBridgeReceiver | [0x570b2feD496e2BC0Efc7a5F51824aE4Baa926be5](https://mumbai.polygonscan.com/address/0x570b2feD496e2BC0Efc7a5F51824aE4Baa926be5) | [0x570b2feD496e2BC0Efc7a5F51824aE4Baa926be5](https://goerli.etherscan.io/address/0x570b2feD496e2BC0Efc7a5F51824aE4Baa926be5)
RouterSenderAdapter | [0x1d4214f4c0c1C3d59E0f1ba5a356b17186D31479](https://mumbai.polygonscan.com/address/0x1d4214f4c0c1C3d59E0f1ba5a356b17186D31479) | [0x1d4214f4c0c1C3d59E0f1ba5a356b17186D31479](https://goerli.etherscan.io/address/0x1d4214f4c0c1C3d59E0f1ba5a356b17186D31479)
RouterReceiverAdapter | [0xa0F7Bd2d9Cf315b809504bb75DF78Ce3000b2B22](https://mumbai.polygonscan.com/address/0xa0F7Bd2d9Cf315b809504bb75DF78Ce3000b2B22) | [0xa0F7Bd2d9Cf315b809504bb75DF78Ce3000b2B22](https://goerli.etherscan.io/address/0xa0F7Bd2d9Cf315b809504bb75DF78Ce3000b2B22)

##Chains

- Polygon Mumbai (80001)
- Ethereum Goerli (5)

Deployed smart contracts are configured only with Router Protocol adapters now, but any other bridges can be easily added to the same deployment.

##Test
We tested the cross-chain messaging by updating the quorum threshold on the destination chain.
Caller makes a call to `remoteCall()` function of the `MultiBridgeSender` with calldata calling `updateQuorumThreshold()` function of the `MultiBridgeReceiver`, in order to initiate update of quorum threshold on Polygon Mumbai chain from Ethereum Goerli Chain:

Transfered message:

```JSON
{
    "bridgeName": "router",
    "callData": "0x6e8b48190000000000000000000000000000000000000000000000000000000000000057",
    "dstChainId": 80001,
    "nonce": 0,
    "srcChainId": 5,
    "target": "0x570b2feD496e2BC0Efc7a5F51824aE4Baa926be5"
}
```

[Initiate update of the Quorum from Ethereum Goerli Chain](https://goerli.etherscan.io/tx/0x03b4a5b824ddeb533a61f5973e0d30c5ecc36011ba731b73bd18292d60b475cb)

[Execute message and update Quorum in Polygon Mumbai Chain](https://mumbai.polygonscan.com/tx/0x2875de0fd0eebdc16945761c836503879a9f65c88df0809fc98e6005b83544f8)
