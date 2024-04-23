const { network } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const imagesLocation = "./images/"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS



    log("----------------------------------------------------")
    const args = ["ipfs://QmbvCWF8bdQz6XHhZS2hcqgeE15MjQ4xTCypupKEZDXoe6"]
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    // const basicNftTwo = await deploy("BasicNftTwo", {
    //     from: deployer,
    //     args: args,
    //     log: true,
    //     waitConfirmations: waitBlockConfirmations,
    // })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(basicNft.address, args)
        //await verify(basicNftTwo.address, args)
    }
    log("----------------------------------------------------")

}

module.exports.tags = ["all", "basicnft"]