// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BasicNft is ERC721URIStorage {
    uint256 private s_tokenCounter;
    string private s_tokenUri;
    event Minted(uint256 indexed tokenId);

    constructor(string memory tokenUri) ERC721("Dogie", "DOG") {
        s_tokenCounter = 0;
        s_tokenUri = tokenUri;
    }

    function mintNft(string memory tokenUri) public {
        s_tokenUri = tokenUri;
        _safeMint(msg.sender, s_tokenCounter);
        _setTokenURI(s_tokenCounter, s_tokenUri);
        emit Minted(s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        s_tokenUri = "";
    }

    // function tokenURI(
    //     uint256 tokenId
    // ) public view override returns (string memory) {
    //     require(
    //         ownerOf(tokenId) == msg.sender,
    //         "ERC721Metadata: URI query for nonexistent token"
    //     );
    //     return TOKEN_URI;
    // }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getTokenUri() public view returns (string memory) {
        return s_tokenUri;
    }
}
