const networkConfig={
    11155111:{
        name:"sepolia",
        ethUsdPriceFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    31337: {
        name: "localhost",
    },

}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const frontEndContractsFile = "../front/my-app/constants/networkMapping.json"
const frontEndContractsFile2 =
    "../front/my-app/constants/networkMapping.json"
const frontEndAbiLocation = "../front/my-app/constants/"
const frontEndAbiLocation2 = "../front/my-app/constants/"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    frontEndContractsFile,
    frontEndContractsFile2,
    frontEndAbiLocation,
    frontEndAbiLocation2,
}