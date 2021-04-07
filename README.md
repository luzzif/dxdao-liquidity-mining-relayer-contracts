# DXdao liquidity mining relayer

Relayer contracts used to faciliatate liquidity mining campaigns creation on
Swapr and other DXdao products using the DXdao multicall plugin.

## Getting started

To use `dxdao-liquidity-mining-relayer-contracts` in your project (for example
to extend the functionality of the contract or to simply easily access the ABI),
simply run:

```
yarn add -D `dxdao-liquidity-mining-relayer-contracts`
```

Built artifacts (containing ABI and bytecode) can be imported in the following
way:

```js
const relayerArtifact = require("dxdao-liquidity-mining-relayer-contracts/build/DXdaoLiquidityMiningRelayer.json");
```

Solidity source code can be imported in the following way:

```js
import "dxdao-liquidity-mining-relayer-contracts/DXdaoLiquidityMiningRelayer.sol";
```

## Development

Start by cloning the repo and installing dependencies by running:

```
yarn
```

To trigger a compilation run:

```
yarn compile
```

Linting and "prettification" on Solidity code is performed using
`prettier-plugin-solidity` and `solhint-plugin-prettier`. Test code is simply
checked using `eslint` and `prettier`.
