// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Recompile - 5
error TokenFarm__AddressLessThan1DayForDappToken(address spender);
error TokenFarm__BalanceMustBeMoreThanZero();

contract TokenFarm is Ownable {
    // mapping token address -> staker address -> amount
    mapping(address => mapping(address => uint256)) public stakingBalance;
    // mapping staker address -> token address -> reward
    mapping(address => mapping(address => uint256)) public stakingReward;
    mapping(address => uint256) public uniqueTokensStaked;
    mapping(address => address) public tokenPriceFeedMapping;
    mapping(address => uint256) public addressToLastGetDappToken;
    address[] public stakers;
    address[] public allowedTokens;
    IERC20 public dappToken;

    constructor(address _dappTokenAddress) {
        dappToken = IERC20(_dappTokenAddress);
    }

    function setPriceFeedContract(address _token, address _priceFeed)
        public
        onlyOwner
    {
        bool foundToken = false;
        uint256 allowedTokensLength = allowedTokens.length;
        for (uint256 index = 0; index < allowedTokensLength; index++) {
            if (allowedTokens[index] == _token) {
                foundToken = true;
                break;
            }
        }
        if (!foundToken) {
            allowedTokens.push(_token);
        }
        tokenPriceFeedMapping[_token] = _priceFeed;
    }

    function getUserTotalValue(address _user) public view returns (uint256) {
        uint256 totalValue = 0;
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            totalValue += getUserSingleTokenValue(_user, allowedTokens[i]);
        }
        return totalValue;
    }

    function getUserSingleTokenValue(address _user, address _token)
        public
        view
        returns (uint256)
    {
        if (uniqueTokensStaked[_user] <= 0) {
            return 0;
        }
        (uint256 price, uint256 decimals) = getTokenValue(_token);
        return ((stakingBalance[_token][_user] * price) / (10**decimals));
    }

    function getTokenValue(address _token)
        public
        view
        returns (uint256, uint256)
    {
        address priceFeedAddress = tokenPriceFeedMapping[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());
        return (uint256(price), decimals);
    }

    function stakeTokens(uint256 _amount, address _token) public {
        require(_amount > 0, "Amount must be more than zero!");
        require(tokenIsAllowed(_token), "Token is currently not allowed!");
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        updateUniqueTokensStaked(msg.sender, _token);
        stakingBalance[_token][msg.sender] += _amount;
        if (uniqueTokensStaked[msg.sender] == 1) {
            stakers.push(msg.sender);
        }
    }

    function unstakeTokens(address _token, uint256 _amount) public {
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "Staking balance cannot be 0");
        require(
            stakingBalance[_token][msg.sender] - _amount >= 0,
            "balance - amount unstaked must be more than or equal to zero"
        );
        IERC20(_token).transfer(msg.sender, _amount);
        stakingBalance[_token][msg.sender] -= _amount;
    }

    function updateUniqueTokensStaked(address _user, address _token) internal {
        if (stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] += 1;
        }
    }

    function tokenIsAllowed(address _token) public view returns (bool) {
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            if (_token == allowedTokens[i]) {
                return true;
            }
        }
        return false;
    }

    function get10DappToken() public {
        if (block.timestamp - addressToLastGetDappToken[msg.sender] < 1 days) {
            revert TokenFarm__AddressLessThan1DayForDappToken(msg.sender);
        }
        addressToLastGetDappToken[msg.sender] = block.timestamp;
        dappToken.transfer(msg.sender, 10000000000000000000);
    }

    function issueRewards() external onlyOwner {
        for (uint256 i = 0; i < stakers.length; i++) {
            for (uint256 j = 0; j < allowedTokens.length; j++) {
                if (stakingBalance[allowedTokens[j]][stakers[i]] > 0) {
                    uint256 reward = getUserSingleTokenValue(
                        stakers[i],
                        allowedTokens[j]
                    );
                    stakingReward[stakers[i]][allowedTokens[j]] += reward;
                }
            }
        }
    }

    function withdrawReward(address _token) public {
        uint256 totalTokenReward = stakingReward[msg.sender][_token];
        if (totalTokenReward <= 0) {
            revert TokenFarm__BalanceMustBeMoreThanZero();
        }
        stakingReward[msg.sender][_token] = 0;
        dappToken.transfer(msg.sender, totalTokenReward);
    }
}
