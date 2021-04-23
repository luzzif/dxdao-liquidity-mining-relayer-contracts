import { expect } from "chai";
import { ethers } from "hardhat";
import {
    DXdaoLiquidityMiningRelayer,
    DXdaoLiquidityMiningRelayer__factory,
    ERC20PresetMinterPauser,
    ERC20PresetMinterPauser__factory,
    DXdaoERC20StakingRewardsDistributionFactory,
    DXdaoERC20StakingRewardsDistributionFactory__factory,
} from "../typechain";

describe("DXdaoLiquidityMiningRelayer", () => {
    let relayer: DXdaoLiquidityMiningRelayer,
        factory: DXdaoERC20StakingRewardsDistributionFactory,
        ownerAddress: string,
        stakableToken: ERC20PresetMinterPauser,
        firstRewardToken: ERC20PresetMinterPauser,
        secondRewardToken: ERC20PresetMinterPauser;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        ownerAddress = accounts[0].address;

        const dxDaoLiquidityMiningRelayerFactory: DXdaoLiquidityMiningRelayer__factory = (await ethers.getContractFactory(
            "DXdaoLiquidityMiningRelayer"
        )) as DXdaoLiquidityMiningRelayer__factory;
        relayer = await dxDaoLiquidityMiningRelayerFactory.deploy();

        const ERC20StakingRewardsDistribution = await ethers.getContractFactory(
            "ERC20StakingRewardsDistribution"
        );
        const implementation = await ERC20StakingRewardsDistribution.deploy();

        const erc20PresetMinterPauserFactory = (await ethers.getContractFactory(
            "ERC20PresetMinterPauser"
        )) as ERC20PresetMinterPauser__factory;
        stakableToken = await erc20PresetMinterPauserFactory.deploy(
            "Stakable",
            "STK"
        );
        firstRewardToken = await erc20PresetMinterPauserFactory.deploy(
            "First reward",
            "FRWD"
        );
        secondRewardToken = await erc20PresetMinterPauserFactory.deploy(
            "Second reward",
            "SRWD"
        );

        const dxDaoERC20StakingRewardsDistributionFactory = (await ethers.getContractFactory(
            "DXdaoERC20StakingRewardsDistributionFactory"
        )) as DXdaoERC20StakingRewardsDistributionFactory__factory;
        factory = await dxDaoERC20StakingRewardsDistributionFactory.deploy(
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            implementation.address
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
            (await factory.getDistributionsAmount()).sub(1)
        );
        const ERC20StakingRewardsDistribution = await ethers.getContractFactory(
            "ERC20StakingRewardsDistribution"
        );
        const distribution = await ERC20StakingRewardsDistribution.attach(
            createdDistributionAddress
        );
        expect(await distribution.owner()).to.be.equal(ownerAddress);
    });

    it("should succeed when recovering ERC20s, even when no ERC20s are holded by the relayer", async () => {
        expect(
            (await firstRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("0");
        await relayer.recoverFunds([firstRewardToken.address]);
        expect(
            (await firstRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("0");
    });

    it("should succeed when recovering ERC20s that are actually holded by the relayer", async () => {
        await firstRewardToken.mint(relayer.address, 20);
        expect(
            (await firstRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("0");
        await relayer.recoverFunds([firstRewardToken.address]);
        expect(
            (await firstRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("20");
    });

    it("should succeed when recovering ERC20s that are actually holded by the relayer, alongside ERC20s that are not holded", async () => {
        await firstRewardToken.mint(relayer.address, 20);
        expect(
            (await firstRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("0");
        expect(
            (await secondRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("0");
        // also recover second reward token, even if not there
        await relayer.recoverFunds([
            firstRewardToken.address,
            secondRewardToken.address,
        ]);
        expect(
            (await firstRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("20");
        expect(
            (await secondRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("0");
    });

    it("should succeed when recovering multiple ERC20s that are actually holded by the relayer", async () => {
        await firstRewardToken.mint(relayer.address, 20);
        await secondRewardToken.mint(relayer.address, 40);
        expect(
            (await firstRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("0");
        expect(
            (await secondRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("0");
        // also recover second reward token, even if not there
        await relayer.recoverFunds([
            firstRewardToken.address,
            secondRewardToken.address,
        ]);
        expect(
            (await firstRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("20");
        expect(
            (await secondRewardToken.balanceOf(ownerAddress)).toString()
        ).to.be.equal("40");
    });
});
