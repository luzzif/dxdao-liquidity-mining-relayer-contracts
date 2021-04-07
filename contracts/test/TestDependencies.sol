// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "dxdao-staking-rewards-distribution-contracts/DXdaoERC20StakingRewardsDistributionFactory.sol";
import "erc20-staking-rewards-distribution-contracts/ERC20StakingRewardsDistribution.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract FirstRewardERC20 is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("First reward", "RWD1") {}
}

contract SecondRewardERC20 is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("Second reward", "RWD2") {}
}

contract StakableERC20 is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("Stakable", "STK") {}
}
