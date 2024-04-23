const { ethers, network } = require("hardhat")
//const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.parseEther("0.01")

async function mintAndList() {
    const nftMarketplaceAddress=(await deployments.get("NftMarketPlace")).address
    const nftMarketplace = await ethers.getContractAt("NftMarketPlace",nftMarketplaceAddress)
    // const randomNumber = Math.floor(Math.random() * 2)
    // let basicNft
    // if (randomNumber == 1) {
    //     basicNft = await ethers.getContract("BasicNftTwo")
    // } else {
    //     basicNft = await ethers.getContract("BasicNft")
    // }
    const basicNftAddress=(await deployments.get("BasicNft")).address
    const basicNft = await ethers.getContractAt("BasicNft",basicNftAddress)
    console.log("Minting NFT...")
    const mintTx = await basicNft.mintNft("ipfs://QmbvCWF8bdQz6XHhZS2hcqgeE15MjQ4xTCypupKEZDXoe6")
    const mintTxReceipt = await mintTx.wait(1)

    const eventFilter = basicNft.filters.Minted();
    const events = await basicNft.queryFilter(eventFilter, "latest");

    const tokenId = events[0].args.tokenId

    console.log(tokenId)

    console.log("Approving NFT...")
    const approvalTx = await basicNft.approve(nftMarketplaceAddress,tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    const tx = await nftMarketplace.listItem(basicNftAddress,tokenId,PRICE)
    await tx.wait(1)
    console.log("NFT Listed!")
    // if (network.config.chainId == 31337) {
    //     // Moralis has a hard time if you move more than 1 at once!
    //     await moveBlocks(1, (sleepAmount = 1000))
    // }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })