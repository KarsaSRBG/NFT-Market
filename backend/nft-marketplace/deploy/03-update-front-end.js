const {
    frontEndContractsFile,
    frontEndContractsFile2,
    frontEndAbiLocation,
    frontEndAbiLocation2,
} = require("../helper-hardhat-config")
require("dotenv").config()
const fs = require("fs")
const { network, deployments, ethers } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const nftMarketplaceAddress=(await deployments.get("NftMarketPlace")).address
    const nftMarketplace = await ethers.getContractAt("NftMarketPlace",nftMarketplaceAddress)
    console.log(nftMarketplaceAddress)
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        JSON.stringify(nftMarketplace.interface.fragments)
    )
    // fs.writeFileSync(
    //     `${frontEndAbiLocation2}NftMarketplace.json`,
    //     JSON.stringify(nftMarketplace.interface.fragments)
    // )

    const basicNftAddress=(await deployments.get("BasicNft")).address
    const basicNft = await ethers.getContractAt("BasicNft",basicNftAddress)
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        JSON.stringify(basicNft.interface.fragments)
    )
    // fs.writeFileSync(
    //     `${frontEndAbiLocation2}BasicNft.json`,
    //     JSON.stringify(basicNft.interface.fragments)
    // )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const nftMarketplaceAddress=(await deployments.get("NftMarketPlace")).address
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplaceAddress)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplaceAddress)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplaceAddress] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
    fs.writeFileSync(frontEndContractsFile2, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]