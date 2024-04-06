// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// import erc20
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MultiSend {
    
    function sendMultiNativeToken(address[] memory recipients, uint256[] memory amounts) public payable {
        require(recipients.length == amounts.length, "recipients and amounts length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(amounts[i]);
        }
    }

    function sendMultiToken(address token, address[] memory recipients, uint256[] memory amounts) public {
        require(recipients.length == amounts.length, "recipients and amounts length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            IERC20(token).transferFrom(msg.sender, recipients[i], amounts[i]);
        }
    }

}