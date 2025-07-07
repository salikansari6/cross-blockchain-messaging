// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import {TypeCasts} from "@hyperlane-xyz/core/contracts/libs/TypeCasts.sol";

struct MyMessage {
    uint256 customNonce;
    string content;
}

contract BasicMessage{
    IMailbox public immutable mailbox;


   constructor(address _mailbox) {
        mailbox = IMailbox(_mailbox);
    }

    event MessageSent(bytes32 messageId);
    event ReceivedMessage(uint32 _origin,address sender,bytes32 nonce ,string  _messageBody);

   function sendMessage(
        uint32 destinationDomain,
        address recipient,
        string calldata message
    ) external payable returns (bytes32 messageId) {
        // Convert address to bytes32 format
    bytes32 customId = keccak256(abi.encodePacked(block.number, msg.sender, blockhash(block.number - 1), message));
    bytes memory payload = abi.encode(customId, message);

    bytes32 recipientBytes32 = TypeCasts.addressToBytes32(recipient);
    uint256 fee = mailbox.quoteDispatch(destinationDomain, recipientBytes32, payload);

    mailbox.dispatch{value: fee}(destinationDomain, recipientBytes32, payload);

    emit MessageSent(customId);
    return customId;
    }

  
        function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _messageBody
    ) external  {
        (bytes32 customId, string memory messageText) = abi.decode(_messageBody, (bytes32, string));

         emit ReceivedMessage(_origin, TypeCasts.bytes32ToAddress(_sender), customId, messageText);
    }

        function getGasForMessage(
        uint32 destinationDomain,
        address recipientAddress,
        string calldata message
    ) external view returns (uint256 fee) {
        bytes32 customId = keccak256(abi.encodePacked(block.number, msg.sender, blockhash(block.number - 1), message));
    bytes memory payload = abi.encode(customId, message);

    bytes32 recipientBytes32 = TypeCasts.addressToBytes32(recipientAddress);
    uint256 _fee = mailbox.quoteDispatch(destinationDomain, recipientBytes32, payload);
    return _fee;
    }
}