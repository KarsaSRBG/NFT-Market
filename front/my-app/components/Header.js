import { ConnectButton } from "web3uikit"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-md">
            <h1 className="font-bold text-3xl">NFT Marketplace</h1>
            <div className="flex flex-row items-center">
                <Link legacyBehavior href="/">
                    <a className="transition duration-300 ease-in-out hover:bg-blue-700 hover:text-white px-4 py-2 rounded-md mr-4">
                        Home
                    </a>
                </Link>
                <Link legacyBehavior href="/sell-nft">
                    <a className="transition duration-300 ease-in-out hover:bg-blue-700 hover:text-white px-4 py-2 rounded-md mr-4">
                        Sell NFT
                    </a>
                </Link>
                <Link legacyBehavior href="/uploadImage">
                    <a className="transition duration-300 ease-in-out hover:bg-blue-700 hover:text-white px-4 py-2 rounded-md mr-4">
                        Upload Image
                    </a>
                </Link>
                <Link legacyBehavior href="/mynft">
                    <a className="transition duration-300 ease-in-out hover:bg-blue-700 hover:text-white px-4 py-2 rounded-md mr-4">
                        My NFT
                    </a>
                </Link>
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
