const BN = require("bn.js");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const DXdaoERC20StakingRewardsDistributionFactory = artifacts.require(
    "DXdaoERC20StakingRewardsDistributionFactory"
);
const ERC20StakingRewardsDistribution = artifacts.require(
    "ERC20StakingRewardsDistribution"
);
const DXdaoLiquidityMiningRelayer = artifacts.require(
    "DXdaoLiquidityMiningRelayer"
);
const FirstRewardERC20 = artifacts.require("FirstRewardERC20");
const SecondRewardERC20 = artifacts.require("SecondRewardERC20");
const StakableERC20 = artifacts.require("StakableERC20");

contract("DXdaoLiquidityMiningRelayer", () => {
    let relayer,
        factory,
        ownerAddress,
        stakableToken,
        firstRewardToken,
        secondRewardToken;

    beforeEach(async () => {
        const accounts = await web3.eth.getAccounts();
        ownerAddress = accounts[0];
        relayer = await DXdaoLiquidityMiningRelayer.new({
            from: ownerAddress,
        });
        const implementation = await ERC20StakingRewardsDistribution.new();
        stakableToken = await StakableERC20.new();
        firstRewardToken = await FirstRewardERC20.new();
        secondRewardToken = await SecondRewardERC20.new();
        factory = await DXdaoERC20StakingRewardsDistributionFactory.new(
            ZERO_ADDRESS,
            ZERO_ADDRESS,
            implementation.address,
            { from: ownerAddress }
        );
    });

    it("should fail when no reward tokens are sent, when creating a single-reward campaign", async () => {
        try {
            const now = Math.floor(Date.now() / 1000);
            await relayer.createDistribution(
                factory.address,
                [firstRewardToken.address],
                stakableToken.address,
                [2],
                now + 100,
                now + 2000,
                false,
                0
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "ERC20: transfer amount exceeds balance"
            );
        }
    });

    it("should fail when no first reward tokens are sent, when creating a double-reward campaign", async () => {
        try {
            const now = Math.floor(Date.now() / 1000);
            await relayer.createDistribution(
                factory.address,
                [firstRewardToken.address, secondRewardToken.address],
                stakableToken.address,
                [2, 5],
                now + 100,
                now + 2000,
                false,
                0
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "ERC20: transfer amount exceeds balance"
            );
        }
    });

    it("should fail when no second reward tokens are sent, when creating a double-reward campaign", async () => {
        try {
            // minting reward tokens to campaign creator and transferring to relayer for creation
            const firstRewardAmount = 5; // 5 wei
            await firstRewardToken.mint(ownerAddress, firstRewardAmount);
            const now = Math.floor(Date.now() / 1000);
            await relayer.createDistribution(
                factory.address,
                [firstRewardToken.address, secondRewardToken.address],
                stakableToken.address,
                [firstRewardAmount, 5],
                now + 100,
                now + 2000,
                false,
                0
            );
            throw new Error("should have failed");
        } catch (error) {
            expect(error.message).to.contain(
                "ERC20: transfer amount exceeds balance"
            );
        }
    });

    it("should succeed when conditions are right", async () => {
        // minting reward tokens to campaign creator and transferring to relayer for creation
        const firstRewardAmount = 5; // 5 wei
        await firstRewardToken.mint(ownerAddress, firstRewardAmount);
        await firstRewardToken.transfer(relayer.address, firstRewardAmount, {
            from: ownerAddress,
        });
        const secondRewardAmount = 2; // 5 wei
        await secondRewardToken.mint(ownerAddress, secondRewardAmount);
        await secondRewardToken.transfer(relayer.address, secondRewardAmount, {
            from: ownerAddress,
        });

        const now = Math.floor(Date.now() / 1000);
        await relayer.createDistribution(
            factory.address,
            [firstRewardToken.address, secondRewardToken.address],
            stakableToken.address,
            [firstRewardAmount, secondRewardAmount],
            now + 100,
            now + 2000,
            false,
            0
        );
        const createdDistributionAddress = await factory.distributions(
            (await factory.getDistributionsAmount()).sub(new BN(1))
        );
        const distribution = await ERC20StakingRewardsDistribution.at(
            createdDistributionAddress
        );
        expect(await distribution.owner()).to.be.equal(ownerAddress);
    });
});
