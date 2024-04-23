const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    artist:""
}

async function upload(){
    let tokenUri = await handleTokenUris("./uploads")
    return tokenUri;
}

async function handleTokenUris(imagesLocation,name,description,artist) {
    // Check out https://github.com/PatrickAlphaC/nft-mix for a pythonic version of uploading
    // to the raw IPFS-daemon from https://docs.ipfs.io/how-to/command-line-quick-start/
    // You could also look at pinata https://www.pinata.cloud/
    const tokenUris = []
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (const imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = name
        tokenUriMetadata.description = description
        tokenUriMetadata.artist=artist
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }

    console.log(tokenUris)
    return tokenUris
}
module.exports={handleTokenUris}