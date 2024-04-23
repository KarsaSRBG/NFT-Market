import React, { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import MyNFT from "../../components/MyNFT"

const showMyNft = () => {
    const { isWeb3Enabled, account } = useMoralis()
    const [ipfsUri, setIpfsUri] = useState("")
    const [ipfsUris, setIpfsUris] = useState([])
    async function getIpfsAddress(account) {
        try {
            const response = await fetch("http://localhost:8088/getImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ account: account }),
            })
            if (!response.ok) {
                throw new Error("获取图片失败")
            }
            const data1 = await response.json()
            const uris = data1.data.map((item) => item.IpfsAddress)

            setIpfsUris(uris)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (account) {
            getIpfsAddress(account)
        }
    }, [account])

    return (
        <div className="container mx-auto">
            <div className="flex flex-wrap gap-8 my-10">
                {ipfsUris[0] != "" ? (
                    ipfsUris.map((data, index) => <MyNFT key={index} ipfsUri={data} />)
                ) : (
                    <div>No Image Uploaded</div>
                )}
            </div>
        </div>
    )
}

export default showMyNft
