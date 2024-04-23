const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if (chainId == 31337) {
    //     const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    //     ethUsdPriceFeedAddress = ethUsdAggregator.address
    // } else {
    //     ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    // }
    log("----------------------------------------------------")
    log("Deploying BasicNft and waiting for confirmations...")
    const contract = await deploy("NftMarketPlace", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`Market deployed at ${contract.address}`)
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(contract.address, [])
    }
}

module.exports.tags = ["all", "market"]