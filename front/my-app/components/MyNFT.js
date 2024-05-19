import React, { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftAbi from "../constants/BasicNft.json"
import { useNotification } from "web3uikit"
import Modal from "react-modal"
const { ethers } = require("ethers")
import networkMapping from "../constants/networkMapping.json"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"

//Modal.setAppElement("#root")

export default function MyNFT({ ipfsUri }) {
    const { isWeb3Enabled, account, chainId } = useMoralis()
    const [imageURIURL, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [artist, setArtist] = useState("")
    const [tokenId, settokenId] = useState(null)
    const [pHash, setPHash] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [isMinted, setIsMinted] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false)
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false)
    const [price, setPrice] = useState("")
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
            newPrice: ethers.parseEther(price || "0"),
        },
    })

    function handleDelet() {
        setDeleteModalIsOpen(true)
    }

    async function deleteImage() {
        try {
            const storeResponse = await fetch("http://localhost:8088/deleteImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ipfsUri: ipfsUri }),
            })
            if (!storeResponse.ok) {
                throw new Error("删除图片发生错误")
            } else {
                dispatch({
                    type: "success",
                    message: "Image deleted",
                    title: "Image deleted - please refresh",
                    position: "topR",
                })
            }
            setDeleteModalIsOpen(false)
        } catch (e) {
            console.error("删除图片失败:", e)
            alert(e)
        }
    }

    async function handleUpdate() {
        setUpdateModalIsOpen(true)
    }

    async function handleDetail() {
        try {
            const response = await fetch("http://localhost:8088/getInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ tokenId: parseInt(tokenId) }),
            })
            if (!response.ok) {
                throw new Error("获取信息失败")
            }
            setPHash((await response.json()).pHash)
        } catch (e) {
            console.error(e)
        }
        setModalIsOpen(true)
    }

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
                console.error(e)
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        updateListing({
            onError: (error) => {
                console.log(error)
            },
            onSuccess: () => handleUpdateListingSuccess(),
        })
    }

    const handleUpdateListingSuccess = () => {
        dispatch({
            type: "success",
            message: "Price updated",
            title: "Price updated - please refresh (and move blocks)",
            position: "topR",
        })
        setUpdateModalIsOpen(false)
        onClose && onClose()
        setPrice("0")
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
            setArtist(tokenURIResponse.artist)
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

    const DetailModal = ({ tokenId, pHash, ipfsUri, description, artist, artName }) => {
        return (
            <div>
                <h2>Token ID: {tokenId}</h2>
                <p>Art Name: {artName}</p>
                <p>Artist: {artist}</p>
                <p>pHash: {pHash}</p>
                <p>IPFS: {ipfsUri}</p>
                <p>Description: {description}</p>
            </div>
        )
    }

    const handleChange = (e) => {
        setPrice(e.target.value)
    }

    const closeModal = () => {
        setModalIsOpen(false)
    }

    const closeUpdateModal = () => {
        setUpdateModalIsOpen(false)
    }

    const closeDeleteModal = () => {
        setDeleteModalIsOpen(false)
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
                        <Modal
                            isOpen={updateModalIsOpen}
                            onRequestClose={closeUpdateModal}
                            className="fixed z-50 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-30"
                            contentLabel="Update Price"
                        >
                            <div className="bg-white p-8 rounded-lg">
                                <form onSubmit={handleSubmit}>
                                    <input
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        type="text"
                                        name="price"
                                        value={price}
                                        onChange={handleChange}
                                        placeholder="Enter your price"
                                        required
                                    />
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 mr-2"
                                        >
                                            Update Price
                                        </button>
                                        <button
                                            onClick={closeUpdateModal}
                                            className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        >
                                            Close Modal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                        <button
                            onClick={handleDetail}
                            className="py-2 px-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded hover:bg-gradient-to-br focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                        >
                            Detail
                        </button>
                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={closeModal}
                            className="fixed z-50 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-30"
                            contentLabel="Detail"
                        >
                            <div className="bg-white p-8 rounded-lg">
                                <DetailModal
                                    tokenId={tokenId}
                                    artName={tokenName}
                                    artist={artist}
                                    pHash={pHash}
                                    ipfsUri={imageURIURL}
                                    description={tokenDescription}
                                />
                                <button
                                    onClick={closeModal}
                                    className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Close Modal
                                </button>
                            </div>
                        </Modal>
                    </div>
                ) : (
                    <div className="flex justify-between items-center bg-gray-100 p-4">
                        <button
                            onClick={handleDelet}
                            className="py-2 px-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold rounded hover:bg-gradient-to-br focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                        >
                            Delete
                        </button>
                        <Modal
                            isOpen={deleteModalIsOpen}
                            onRequestClose={closeDeleteModal}
                            className="fixed z-50 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-30"
                            contentLabel="Detail"
                        >
                            <div className="bg-white p-8 rounded-lg ">
                                <div calassName="flex justify-center ">
                                    <p className="mt-4 text-gray-800">
                                        Are you sure to delete this art image?
                                    </p>

                                    <div className="flex mt-4">
                                        <button
                                            onClick={deleteImage}
                                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 mr-8"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={closeDeleteModal}
                                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        >
                                            Close Modal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Modal>
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
