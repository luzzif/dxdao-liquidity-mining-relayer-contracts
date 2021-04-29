import { task } from "hardhat/config";
import {
    DXdaoLiquidityMiningRelayer__factory,
    DXdaoLiquidityMiningRelayer,
} from "../typechain";

task(
    "deploy",
    "Deploys the relayer contract and verifies source code on Etherscan"
)
    .addOptionalParam(
        "ownerAddress",
        "The address that will own the relayer (and the call rights) after deployment"
    )
    .addFlag(
        "verify",
        "Additional (and optional) Etherscan contracts verification"
    )
    .setAction(async (taskArguments, hre) => {
        const { ownerAddress, verify } = taskArguments;

        await hre.run("clean");
        await hre.run("compile");

        const dxDaoLiquidityMiningRelayerFactory = (await hre.ethers.getContractFactory(
            "DXdaoLiquidityMiningRelayer"
        )) as DXdaoLiquidityMiningRelayer__factory;
        console.log("deploying relayer...");
        const relayer = await dxDaoLiquidityMiningRelayerFactory.deploy();
        if (ownerAddress) {
            console.log("transferring ownership...");
            await relayer.transferOwnership(ownerAddress);
        }

        if (verify) {
            await hre.run("verify", {
                address: relayer.address,
                constructorArguments: [],
            });
            console.log(`source code verified`);
        }

        console.log(`relayer deployed at address ${relayer.address}`);
    });
