pragma solidity ^0.8.0;

// Recompile - 2
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DappToken is ERC20 {
    constructor() ERC20("DappToken", "DAPP") {
        _mint(msg.sender, 1000000000000000000000000);
    }
}
