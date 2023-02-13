// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.17;

import "../interfaces/IBridgeSenderAdapter.sol";
import "../interfaces/Router/IRouterGateway.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract RouterSenderAdapter is IBridgeSenderAdapter, Ownable {
    /* ========== STATE VARIABLES ========== */

    string public constant name = "router";
    address public multiBridgeSender;
    IRouterGateway public immutable routerGateway;
    // dstChainId => receiverAdapter address
    mapping(uint64 => address) public receiverAdapters;

    /* ========== MODIFIERS ========== */

    modifier onlyMultiBridgeSender() {
        require(msg.sender == multiBridgeSender, "not multi-bridge msg sender");
        _;
    }

    /* ========== CONSTRUCTOR  ========== */

    constructor(address _routerGateway) {
        routerGateway = IRouterGateway(_routerGateway);
    }

    /* ========== EXTERNAL METHODS ========== */

    function getMessageFee(
        MessageStruct.Message memory //_message
    ) external view override returns (uint256) {
        return routerGateway.requestToDestDefaultFee();
    }

    function sendMessage(MessageStruct.Message memory _message) external payable override onlyMultiBridgeSender {
        _message.bridgeName = name;
        require(receiverAdapters[_message.dstChainId] != address(0), "no receiver adapter");

        Utils.RequestArgs memory requestArgs = Utils.RequestArgs(type(uint64).max, false, Utils.FeePayer.APP);

        Utils.DestinationChainParams memory destChainParams = Utils.DestinationChainParams(
            350000,
            0,
            0,
            Strings.toString(uint256(_message.dstChainId))
        );

        bytes[] memory payloads = new bytes[](1);
        payloads[0] = abi.encode(_message);

        bytes[] memory destContractAddresses = new bytes[](1);
        destContractAddresses[0] = toBytes(receiverAdapters[_message.dstChainId]);

        routerGateway.requestToDest{value: msg.value}(
            requestArgs,
            Utils.AckType.NO_ACK,
            Utils.AckGasParams(0, 0),
            destChainParams,
            Utils.ContractCalls(payloads, destContractAddresses)
        );
    }

    /* ========== ADMIN METHODS ========== */

    function updateReceiverAdapter(uint64[] calldata _dstChainIds, address[] calldata _receiverAdapters)
        external
        onlyOwner
    {
        require(_dstChainIds.length == _receiverAdapters.length, "mismatch length");
        for (uint256 i = 0; i < _dstChainIds.length; i++) {
            receiverAdapters[_dstChainIds[i]] = _receiverAdapters[i];
        }
    }

    function setMultiBridgeSender(address _multiBridgeSender) external onlyOwner {
        multiBridgeSender = _multiBridgeSender;
    }

    /* ========== UTILS METHODS ========== */

    function toBytes(address a) public pure returns (bytes memory b) {
        assembly {
            let m := mload(0x40)
            a := and(a, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
            mstore(add(m, 20), xor(0x140000000000000000000000000000000000000000, a))
            mstore(0x40, add(m, 52))
            b := m
        }
    }
}
