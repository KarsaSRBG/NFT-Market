import React, { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"

// const { runContractFunction: getTokenURI } = useWeb3Contract({
//         abi: nftAbi,
//         contractAddress: nftAddress,
//         functionName: "tokenURI",
//         params: {
//             tokenId: tokenId,
//         },
//     })

const UploadPage = () => {
    const { isWeb3Enabled, account } = useMoralis()
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [metadata, setFormData] = useState({
        name: "",
        description: "",
        artist: "",
    })
    let file

    const handleFileChange = (event) => {
        file = event.target.files[0]
        if (file) {
            setSelectedFile(file)
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                // 当读取完成后，更新图片预览的URL
                setPreviewUrl(reader.result)
            }
        }
    }
    const handleChange = (e) => {
        setFormData({ ...metadata, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedFile) {
            alert("请先选择一个文件。")
            return
        }

        const formData = new FormData()
        formData.append("image", selectedFile)

        try {
            const response = await fetch("http://localhost:8088/uploadImage", {
                method: "POST",
                body: formData,
            })
            if (!response.ok) {
                throw new Error((await response.json()).message)
            }

            const data = await response.json()

            alert(`图片上传成功，phash值为: ${data.phash}`)
            //上传至IPFS
            const ipfsResponse = await fetch("http://localhost:8088/getIpfsUri", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(metadata),
            })

            if (!ipfsResponse.ok) {
                throw new Error("获取IPFS URI时网络响应错误")
            }
            const ipfsUri = (await ipfsResponse.json()).ipfsUri
            alert(`图片上传至IPFS成功，IPFS地址为: ${ipfsUri}`)

            console.log(account)

            const info = {
                ipfsUri: ipfsUri,
                pHash: data.phash,
                owner: account,
            }

            const storeResponse = await fetch("http://localhost:8088/storeInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(info),
            })

            if (!storeResponse.ok) {
                throw new Error("存储图片信息发生错误")
            }
        } catch (error) {
            console.error("上传失败:", error)
            alert(error)
        }

        //todo:mintNft
    }

    return (
        <div className="max-w-lg mx-auto my-10">
            <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                <h1 className="text-3xl font-bold text-center mb-6">创建艺术品</h1>
                <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    name="name"
                    value={metadata.name}
                    onChange={handleChange}
                    placeholder="名称"
                    required
                />
                <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    name="description"
                    value={metadata.description}
                    onChange={handleChange}
                    placeholder="描述"
                    required
                />
                <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type="text"
                    name="artist"
                    value={metadata.artist}
                    onChange={handleChange}
                    placeholder="艺术家"
                    required
                />
                <input
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                />
                <button
                    className="py-3 px-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition duration-300"
                    type="submit"
                >
                    上传
                </button>
                {previewUrl && (
                    <img
                        className="mt-4 max-w-full h-auto rounded-lg"
                        src={previewUrl}
                        alt="Image preview"
                    />
                )}
            </form>
        </div>
    )
}

export default UploadPage
