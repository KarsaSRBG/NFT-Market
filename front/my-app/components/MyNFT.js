import React, { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftAbi from "../constants/BasicNft.json"
import { useNotification } from "web3uikit"
const { ethers } = require("ethers")
import networkMapping from "../constants/networkMapping.json"

import nftMarketplaceAbi from "../constants/NftMarketplace.json"

export default function MyNFT({ ipfsUri }) {
    const { isWeb3Enabled, account, chainId } = useMoralis()
    const [imageURIURL, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenId, settokenId] = useState(null)
    const [tokenDescription, setTokenDescription] = useState("")
    const [isMinted, setIsMinted] = useState(false)
    const dispatch = useNotification()
    const chainString = chainId ? parseInt(chainId).toString() : null
    const marketplaceAddress = chainId ? networkMapping[chainString].NftMarketplace[0] : null
    let mintSuccess = false

    const { runContractFunction: mintNft } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: "0xb5dd772517dcf0b399f3b0cd1b41036a9a32b9eb",
        functionName: "mintNft",
        params: {
            tokenUri: ipfsUri,
        },
    })

    const { runContractFunction: getTokenId } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: "0xb5dd772517dcf0b399f3b0cd1b41036a9a32b9eb",
        functionName: "getTokenCounter",
    })

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: "0xb5dd772517dcf0b399f3b0cd1b41036a9a32b9eb",
            tokenId: tokenId,
            newPrice: ethers.parseEther("0"),
        },
    })

    async function handleDelet() {}

    async function handleUpdate() {
        updateListing({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: () => handleUpdateListingSuccess(),
        })
    }

    async function handleDetail() {}

    async function handleMint() {
        console.log("mint")
        await mintNft({
            onError: (error) => console.log(error),
            onSuccess: () => handleMintSuccess(),
        })
        const tokenId = parseInt((await getTokenId())._hex, 16)
        if (mintSuccess) {
            try {
                const response = await fetch("http://localhost:8088/saveTokenId", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ tokenId: tokenId, ipfsUri: ipfsUri }),
                })
                if (!response.ok) {
                    throw new Error("tokenId存储失败")
                }
            } catch (e) {
                console.error(error)
            }
        }
    }

    const handleMintSuccess = () => {
        mintSuccess = true
        setIsMinted(true)
        dispatch({
            type: "success",
            message: "NFT Minted!",
            title: "NFT Minted",
            position: "topR",
        })
    }

    const handleUpdateListingSuccess = () => {
        dispatch({
            type: "success",
            message: "listing updated",
            title: "Listing updated - please refresh (and move blocks)",
            position: "topR",
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }

    async function updateUI() {
        const tokenURI = ipfsUri
        console.log(`The TokenURI is ${tokenURI}`)
        // We are going to cheat a little here...
        if (tokenURI) {
            // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
            const requestURL = tokenURI.toString().replace("ipfs://", "https://ipfs.io/ipfs/")
            console.log(requestURL)
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.toString().replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
            // We could render the Image on our sever, and just call our sever.
            // For testnets & mainnet -> use moralis server hooks
            // Have the world adopt IPFS
            // Build our own IPFS gateway
        }
        try {
            const response = await fetch("http://localhost:8088/getTokenId", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ipfsUri: ipfsUri }),
            })
            if (!response.ok) {
                throw new Error("tokenId获取失败")
            }
            //tokenId = (await response.json()).tokenId
            settokenId((await response.json()).tokenId)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        // 监听tokenId的变化，当它不为null时，设置isMinted为true
        if (tokenId !== null) {
            setIsMinted(true)
        }
    }, [tokenId])

    return (
        <div>
            {/* 单个区块开始 */}
            <div className="w-64 h-96 border border-gray-200 rounded-lg overflow-hidden shadow-lg flex flex-col">
                {isMinted ? (
                    <div className="flex flex-col items-end gap-4">TokenId:#{tokenId}</div>
                ) : (
                    <div className="flex flex-col items-end gap-4">Not Minted</div>
                )}
                {/* 显示图片 */}
                <div className="flex-grow overflow-hidden">
                    <img
                        src={imageURIURL}
                        alt={tokenDescription}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 按钮区域 */}

                {isMinted ? (
                    <div className="flex justify-between items-center bg-gray-100 p-4">
                        <button
                            onClick={handleUpdate}
                            className="py-2 px-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded hover:bg-gradient-to-br focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                        >
                            Update
                        </button>
                        <button
                            onClick={handleDetail}
                            className="py-2 px-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded hover:bg-gradient-to-br focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                        >
                            Detail
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center bg-gray-100 p-4">
                        <button
                            onClick={handleDelet}
                            className="py-2 px-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded hover:bg-gradient-to-br focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                        >
                            Delete
                        </button>
                        <button
                            onClick={handleMint}
                            className="py-2 px-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded hover:bg-gradient-to-br focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                        >
                            Mint
                        </button>
                    </div>
                )}
            </div>
            {/* 单个区块结束 */}
            {/* 重复上面的区块以显示多个 */}
        </div>
    )
}
