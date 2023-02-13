// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.17;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IMultiBridgeReceiver.sol";
import "../interfaces/Router/IRouterGateway.sol";
import "../interfaces/Router/IRouterReceiver.sol";

contract RouterReceiverAdapter is Pausable, Ownable, IRouterReceiver {
    /* ========== STATE VARIABLES ========== */

    mapping(uint64 => address) public senderAdapters;
    IRouterGateway public immutable routerGateway;
    address public multiBridgeReceiver;

    /* ========== MODIFIERS ========== */

    modifier onlyRouterGateway() {
        require(msg.sender == address(routerGateway), "caller is not router gateway");
        _;
    }

    /* ========== CONSTRUCTOR  ========== */

    constructor(address _routerGateway) {
        routerGateway = IRouterGateway(_routerGateway);
    }

    /* ========== EXTERNAL METHODS ========== */

    // Called by the Router Gateway on destination chain to receive cross-chain messages.
    // srcContractAddress is the address of contract on the source chain where the request was intiated
    // The payload is abi.encode of (MessageStruct.Message).
    function handleRequestFromSource(
        bytes memory srcContractAddress,
        bytes memory payload,
        string memory, // srcChainId
        uint64 //srcChainType
    ) external override onlyRouterGateway whenNotPaused returns (bytes memory) {
        MessageStruct.Message memory message = abi.decode(payload, (MessageStruct.Message));
        require(toAddress(srcContractAddress) == senderAdapters[message.srcChainId], "not allowed message sender");
        IMultiBridgeReceiver(multiBridgeReceiver).receiveMessage(message);
        return "";
    }

    /* ========== ADMIN METHODS ========== */

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function updateSenderAdapter(uint64[] calldata _srcChainIds, address[] calldata _senderAdapters)
        external
        onlyOwner
    {
        require(_srcChainIds.length == _senderAdapters.length, "mismatch length");
        for (uint256 i = 0; i < _srcChainIds.length; i++) {
            senderAdapters[_srcChainIds[i]] = _senderAdapters[i];
        }
    }

    function setMultiBridgeReceiver(address _multiBridgeReceiver) external onlyOwner {
        multiBridgeReceiver = _multiBridgeReceiver;
    }

    /* ========== UTILS METHODS ========== */

    function toAddress(bytes memory _bytes) internal pure returns (address contractAddress) {
        bytes20 srcTokenAddress;
        assembly {
            srcTokenAddress := mload(add(_bytes, 0x20))
        }
        contractAddress = address(srcTokenAddress);
    }
}
