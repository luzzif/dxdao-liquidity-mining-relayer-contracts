import { HardhatUserConfig } from "hardhat/types/config";
import { config } from "dotenv";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-dependency-compiler";
import "./tasks/deploy";

config();

const infuraId = process.env.INFURA_ID;
const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const hardhatConfig: HardhatUserConfig = {
    networks: {
        mainnet: {
            url: `https://mainnet.infura.io/v3/${infuraId}`,
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${infuraId}`,
            accounts,
        },
        arbitrumTestnetV3: {
            url: "https://kovan3.arbitrum.io/rpc",
            accounts,
            gasPrice: 0,
        },
        xdai: {
            url: "https://xdai.poanetwork.dev",
            accounts,
            gasPrice: 0,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.0",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.GAS_REPORT_ENABLED === "true",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    dependencyCompiler: {
        paths: [
            "dxdao-staking-rewards-distribution-contracts/DXdaoERC20StakingRewardsDistributionFactory.sol",
            "erc20-staking-rewards-distribution-contracts/ERC20StakingRewardsDistribution.sol",
            "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol",
        ],
    },
};

export default hardhatConfig;
