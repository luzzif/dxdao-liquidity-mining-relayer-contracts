const { task } = require("hardhat/config");

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

        const DXdaoLiquidityMiningRelayer = hre.artifacts.require(
            "DXdaoLiquidityMiningRelayer"
        );
        const relayer = await DXdaoLiquidityMiningRelayer.new();
        if (ownerAddress) {
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
