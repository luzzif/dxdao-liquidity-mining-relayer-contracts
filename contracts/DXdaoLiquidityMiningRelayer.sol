// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "dxdao-staking-rewards-distribution-contracts/IDXdaoERC20StakingRewardsDistributionFactory.sol";

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
        IDXdaoERC20StakingRewardsDistributionFactory(_factoryAddress).createDistribution(
            _rewardTokensAddresses,
            _stakableTokenAddress,
            _rewardAmounts,
            _startingTimestamp,
            _endingTimestmp,
            _locked,
            _stakingCap
        );
    }
}
