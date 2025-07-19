// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BSN NFT Collection
 * @dev BSN Social Network NFT with advanced features
 */
contract BSNNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Pausable, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _collectionIds;

    // NFT Configuration
    uint256 public constant MAX_SUPPLY = 100_000; // 100k NFTs max
    uint256 public constant MINT_PRICE = 0.01 ether; // 0.01 ETH per NFT
    uint256 public constant ROYALTY_PERCENTAGE = 5; // 5% royalty
    uint256 public constant MAX_PER_WALLET = 10; // Max 10 NFTs per wallet

    // Collection Structure
    struct Collection {
        uint256 id;
        string name;
        string description;
        string baseURI;
        uint256 maxSupply;
        uint256 minted;
        uint256 mintPrice;
        bool isActive;
        address creator;
        uint256 createdAt;
    }

    // NFT Structure
    struct NFT {
        uint256 tokenId;
        uint256 collectionId;
        string tokenURI;
        address creator;
        uint256 mintPrice;
        uint256 royaltyPercentage;
        bool isForSale;
        uint256 salePrice;
        uint256 createdAt;
    }

    // State Variables
    mapping(uint256 => Collection) public collections;
    mapping(uint256 => NFT) public nfts;
    mapping(address => uint256) public userNFTCount;
    mapping(address => uint256[]) public userNFTs;
    mapping(uint256 => address) public tokenCreator;
    mapping(uint256 => uint256) public tokenRoyaltyPercentage;

    // Events
    event CollectionCreated(uint256 indexed collectionId, string name, address indexed creator);
    event NFTMinted(uint256 indexed tokenId, uint256 indexed collectionId, address indexed creator);
    event NFTSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event NFTListed(uint256 indexed tokenId, uint256 price);
    event NFTDelisted(uint256 indexed tokenId);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed creator, uint256 amount);

    constructor() ERC721("BSN NFT Collection", "BSNNFT") Ownable(msg.sender) {}

    /**
     * @dev Create a new NFT collection
     */
    function createCollection(
        string memory name,
        string memory description,
        string memory baseURI,
        uint256 maxSupply,
        uint256 mintPrice
    ) external whenNotPaused {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(maxSupply <= MAX_SUPPLY, "Max supply exceeds limit");

        _collectionIds.increment();
        uint256 collectionId = _collectionIds.current();

        collections[collectionId] = Collection({
            id: collectionId,
            name: name,
            description: description,
            baseURI: baseURI,
            maxSupply: maxSupply,
            minted: 0,
            mintPrice: mintPrice,
            isActive: true,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        emit CollectionCreated(collectionId, name, msg.sender);
    }

    /**
     * @dev Mint an NFT from a collection
     */
    function mintNFT(uint256 collectionId, string memory tokenURI) external payable whenNotPaused nonReentrant {
        Collection storage collection = collections[collectionId];
        require(collection.isActive, "Collection is not active");
        require(collection.minted < collection.maxSupply, "Collection is sold out");
        require(msg.value >= collection.mintPrice, "Insufficient payment");
        require(userNFTCount[msg.sender] < MAX_PER_WALLET, "Max NFTs per wallet reached");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        // Create NFT
        nfts[tokenId] = NFT({
            tokenId: tokenId,
            collectionId: collectionId,
            tokenURI: tokenURI,
            creator: msg.sender,
            mintPrice: collection.mintPrice,
            royaltyPercentage: ROYALTY_PERCENTAGE,
            isForSale: false,
            salePrice: 0,
            createdAt: block.timestamp
        });

        // Update collection
        collection.minted = collection.minted.add(1);

        // Update user data
        userNFTCount[msg.sender] = userNFTCount[msg.sender].add(1);
        userNFTs[msg.sender].push(tokenId);
        tokenCreator[tokenId] = msg.sender;
        tokenRoyaltyPercentage[tokenId] = ROYALTY_PERCENTAGE;

        // Mint NFT
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(tokenId, collectionId, msg.sender);
    }

    /**
     * @dev List NFT for sale
     */
    function listNFT(uint256 tokenId, uint256 price) external whenNotPaused {
        require(_exists(tokenId), "NFT does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");

        NFT storage nft = nfts[tokenId];
        nft.isForSale = true;
        nft.salePrice = price;

        emit NFTListed(tokenId, price);
    }

    /**
     * @dev Delist NFT from sale
     */
    function delistNFT(uint256 tokenId) external whenNotPaused {
        require(_exists(tokenId), "NFT does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");

        NFT storage nft = nfts[tokenId];
        nft.isForSale = false;
        nft.salePrice = 0;

        emit NFTDelisted(tokenId);
    }

    /**
     * @dev Buy NFT from marketplace
     */
    function buyNFT(uint256 tokenId) external payable whenNotPaused nonReentrant {
        require(_exists(tokenId), "NFT does not exist");
        
        NFT storage nft = nfts[tokenId];
        require(nft.isForSale, "NFT is not for sale");
        require(msg.value >= nft.salePrice, "Insufficient payment");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy your own NFT");

        address seller = ownerOf(tokenId);
        uint256 price = nft.salePrice;
        uint256 royaltyAmount = price.mul(nft.royaltyPercentage).div(100);
        uint256 sellerAmount = price.sub(royaltyAmount);

        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);

        // Update NFT data
        nft.isForSale = false;
        nft.salePrice = 0;

        // Update user data
        userNFTCount[seller] = userNFTCount[seller].sub(1);
        userNFTCount[msg.sender] = userNFTCount[msg.sender].add(1);

        // Remove from seller's NFTs
        uint256[] storage sellerNFTs = userNFTs[seller];
        for (uint256 i = 0; i < sellerNFTs.length; i++) {
            if (sellerNFTs[i] == tokenId) {
                sellerNFTs[i] = sellerNFTs[sellerNFTs.length - 1];
                sellerNFTs.pop();
                break;
            }
        }

        // Add to buyer's NFTs
        userNFTs[msg.sender].push(tokenId);

        // Transfer payments
        payable(seller).transfer(sellerAmount);
        payable(nft.creator).transfer(royaltyAmount);

        emit NFTSold(tokenId, seller, msg.sender, price);
        emit RoyaltyPaid(tokenId, nft.creator, royaltyAmount);
    }

    /**
     * @dev Get collection info
     */
    function getCollection(uint256 collectionId) external view returns (
        string memory name,
        string memory description,
        string memory baseURI,
        uint256 maxSupply,
        uint256 minted,
        uint256 mintPrice,
        bool isActive,
        address creator,
        uint256 createdAt
    ) {
        Collection storage collection = collections[collectionId];
        return (
            collection.name,
            collection.description,
            collection.baseURI,
            collection.maxSupply,
            collection.minted,
            collection.mintPrice,
            collection.isActive,
            collection.creator,
            collection.createdAt
        );
    }

    /**
     * @dev Get NFT info
     */
    function getNFT(uint256 tokenId) external view returns (
        uint256 collectionId,
        string memory tokenURI,
        address creator,
        uint256 mintPrice,
        uint256 royaltyPercentage,
        bool isForSale,
        uint256 salePrice,
        uint256 createdAt
    ) {
        require(_exists(tokenId), "NFT does not exist");
        NFT storage nft = nfts[tokenId];
        return (
            nft.collectionId,
            nft.tokenURI,
            nft.creator,
            nft.mintPrice,
            nft.royaltyPercentage,
            nft.isForSale,
            nft.salePrice,
            nft.createdAt
        );
    }

    /**
     * @dev Get user's NFTs
     */
    function getUserNFTs(address user) external view returns (uint256[] memory) {
        return userNFTs[user];
    }

    /**
     * @dev Get NFTs for sale
     */
    function getNFTsForSale() external view returns (uint256[] memory) {
        uint256[] memory forSale = new uint256[](_tokenIds.current());
        uint256 count = 0;

        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (nfts[i].isForSale) {
                forSale[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = forSale[i];
        }

        return result;
    }

    /**
     * @dev Update collection (creator only)
     */
    function updateCollection(
        uint256 collectionId,
        string memory name,
        string memory description,
        bool isActive
    ) external {
        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not the creator");

        collection.name = name;
        collection.description = description;
        collection.isActive = isActive;
    }

    /**
     * @dev Update collection mint price (creator only)
     */
    function updateCollectionMintPrice(uint256 collectionId, uint256 newPrice) external {
        Collection storage collection = collections[collectionId];
        require(collection.creator == msg.sender, "Not the creator");

        collection.mintPrice = newPrice;
    }

    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Required overrides
    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 