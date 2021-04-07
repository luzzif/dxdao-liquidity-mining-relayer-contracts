// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "dxdao-staking-rewards-distribution-contracts/interfaces/IDXdaoERC20StakingRewardsDistributionFactory.sol";
import "erc20-staking-rewards-distribution-contracts/IERC20StakingRewardsDistribution.sol";

contract DXdaoLiquidityMiningRelayer is Ownable {
    function createDistribution(
        address _factoryAddress,
        address[] calldata _rewardTokensAddresses,
        address _stakableTokenAddress,
        uint256[] calldata _rewardAmounts,
        uint64 _startingTimestamp,
        uint64 _endingTimestmp,
        bool _locked,
        uint256 _stakingCap
    ) external onlyOwner {
        require(_rewardTokensAddresses.length == _rewardAmounts.length,"DXdaoLiquidityMiningRelayer: inconsistent reward addresses and amounts array length");
        for(uint _i; _i < _rewardTokensAddresses.length; _i++) {
            IERC20(_rewardTokensAddresses[_i]).approve(_factoryAddress, _rewardAmounts[_i]);
        }
        IDXdaoERC20StakingRewardsDistributionFactory _factory = IDXdaoERC20StakingRewardsDistributionFactory(_factoryAddress);
        _factory.createDistribution(
            _rewardTokensAddresses,
            _stakableTokenAddress,
            _rewardAmounts,
            _startingTimestamp,
            _endingTimestmp,
            _locked,
            _stakingCap
        );
        IERC20StakingRewardsDistribution _createdDistribution = IERC20StakingRewardsDistribution(_factory.distributions(_factory.getDistributionsAmount() - 1));
        _createdDistribution.transferOwnership(msg.sender);
    }
}
