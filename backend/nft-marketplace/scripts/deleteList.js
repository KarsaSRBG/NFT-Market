const { ethers, network } = require('hardhat');
//const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.parseEther('0.01');

async function Delete() {
  const nftMarketplaceAddress = (await deployments.get('NftMarketPlace'))
    .address;
  const nftMarketplace = await ethers.getContractAt(
    'NftMarketPlace',
    nftMarketplaceAddress,
  );
  // const randomNumber = Math.floor(Math.random() * 2)
  // let basicNft
  // if (randomNumber == 1) {
  //     basicNft = await ethers.getContract("BasicNftTwo")
  // } else {
  //     basicNft = await ethers.getContract("BasicNft")
  // }
  const basicNftAddress = (await deployments.get('BasicNft')).address;
  const basicNft = await ethers.getContractAt('BasicNft', basicNftAddress);

  console.log('delete list...');
  const tx = await nftMarketplace.cancelListing(basicNftAddress, 9);
  await tx.wait(1);
}

Delete()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
