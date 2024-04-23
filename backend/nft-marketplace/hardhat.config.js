require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("hardhat-deploy");
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://127.0.0.1:10809");
setGlobalDispatcher(proxyAgent);

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY;
module.exports = {
  solidity: "0.8.24",
  defaultNetwork:"hardhat",
  networks: {
    sepolia: {
      accounts: [PRIVATE_KEY],
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      blockConfirmations:5
    },
    localhost:{
      url:"http://127.0.0.1:8545/",
      chainId:31337,
    }
  },
  etherscan:{
    apiKey:ETHERSCAN_API_KEY
  },
  gasReporter:{
    enabled:true
  },
  namedAccounts:{
    deployer:{
      default:0,
      1:0,
    },
    player:{
      default:1,
    }
  }
};