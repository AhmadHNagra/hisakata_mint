//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SmartContract is Ownable,ERC721 {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    uint256 private MAX_ITEMS;
    uint256 private PRICE;
    bool private revealed;
    string private placeHolderUri;
    string private appendUri;
    mapping(uint256=>string) _tokenURIs;
    
    struct NFToken
    {
        uint256 id;
        string uri;
    }

    constructor(string memory _appendUri, string memory _placeholderUri) ERC721("Hisakata", "HISAKATA") {
        MAX_ITEMS = 10000;
        PRICE = 0.06 ether;
        revealed = false;
        placeHolderUri = _placeholderUri;
        appendUri=_appendUri;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal{
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _setPlaceHolderUri(string memory _URI) public onlyOwner{
        placeHolderUri = _URI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns(string memory)
    {
        if(revealed == false){
            return placeHolderUri;
        }
        return _tokenURIs[tokenId];
    }
    function CreateMultipleCollectibles(address _to, string[] memory uri)public payable{
        uint256 total = _tokenIdTracker.current() + uri.length;
        uint256 totalCost=msg.value*uri.length;
        require(total < MAX_ITEMS, "No more NFTs left to mint");
        require(totalCost >= PRICE, "Value below price");
        for(uint256 i = 0; i < uri.length; i++){
            CreateCollectible(_to, uri[i]);
        }
    }
    function CreateCollectible(address _to, string memory uri) public payable returns (uint256) {
        _tokenIdTracker.increment();
        uint id = _tokenIdTracker.current();
        _mint(_to, id);
        _setTokenURI(id, string(abi.encodePacked(appendUri, uri)));
        return id;
    }
    
    function GetAllExistingTokens() public view returns(NFToken[] memory){
        NFToken[] memory result=new NFToken[](_tokenIdTracker.current());
        for(uint256 i=0;i<_tokenIdTracker.current();i++){
            if(_exists(i+1)){
                result[i]=NFToken(i+1, tokenURI(i+1));
            }
        }
        return result;
    }

    function WithdrawAll(address _address) public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        Withdraw(_address, address(this).balance);
    }

    function Withdraw(address _address, uint256 _amount) public onlyOwner {
        (bool success,) = _address.call{value : _amount}("");
        require(success, "Transfer failed.");
    }
    
    function BalanceOf() external view returns (uint)
    {
        return address(this).balance;
    }

    function Reveal() public onlyOwner{
        revealed = true;
    }

    function SetPrice(uint256 price) public onlyOwner{
        PRICE = price;
    }

    function GetPrice() public view returns(uint256){
        return PRICE;
    }
}