// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract CryptoSharksClub is ERC721Enumerable, Ownable {
    using Address for address;
    
    bool public saleActive = false;
    bool public whitelistActive = false;
    bool public presaleActive = false;

    uint256 public reserved = 200;

    uint256 public initial_price = 0.04 ether;
    uint256 public price;

    uint256 public constant MAX_SUPPLY = 6557;
    uint256 public constant MAX_PRESALE_SUPPLY = 500;
    uint256 public constant MAX_MINT_PER_TX = 6557;

    string public baseTokenURI = "http://167.172.241.48/";

    address public a1;

    mapping (address => uint256) public whitelistReserved;

    constructor () ERC721 ("CryptoSharksClub", "CSC") {
        price = initial_price;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function tokensOfOwner(address addr) public view returns(uint256[] memory) {
        uint256 tokenCount = balanceOf(addr);
        uint256[] memory tokensId = new uint256[](tokenCount);
        for(uint256 i; i < tokenCount; i++){
            tokensId[i] = tokenOfOwnerByIndex(addr, i);
        }
        return tokensId;
    }

    function mintWhitelist(uint256 _amount) public payable {
        uint256 supply = totalSupply();
        uint256 reservedAmt = whitelistReserved[msg.sender];
        require(msg.sender == tx.origin,            "No transaction from smart contracts!");
        require( whitelistActive,                   "Whitelist isn't active" );
        require( reservedAmt > 0,                   "No Sharks reserved for your address" );
        require( _amount <= reservedAmt,            "Can't mint more than reserved" );
        require( supply + _amount <= MAX_SUPPLY,    "Purchase would exceed max supply" );
        require( msg.value == price * _amount,      "Not enough ETH for transaction" );
        whitelistReserved[msg.sender] = reservedAmt - _amount;
        for(uint256 i; i < _amount; i++){
            _safeMint( msg.sender, supply + i );
        }
    }

    function mintPresale(uint256 _amount) public payable {
        uint256 supply = totalSupply();
        require(msg.sender == tx.origin,                    "No transaction from smart contracts!");        
        require( presaleActive,                             "Sale isn't active" );
        require( _amount > 0 && _amount <= MAX_MINT_PER_TX, "Max 20 Sharks per transaction" );
        require( supply + _amount <= MAX_PRESALE_SUPPLY,    "Purchase would exceed max supply" );
        require( msg.value == price * _amount,              "Not enough ETH for transaction" );
        for(uint256 i; i < _amount; i++){
            _safeMint( msg.sender, supply + i );
        }
    }

    function mintToken(uint256 _amount) public payable {
        uint256 supply = totalSupply();
        require(msg.sender == tx.origin,                    "No transaction from smart contracts!");       
        require( saleActive,                                "Sale isn't active" );
        require( _amount > 0 && _amount <= MAX_MINT_PER_TX, "Max 20 Sharks per transaction" );
        require( supply + _amount <= MAX_SUPPLY,            "Purchase would exceed max supply" );
        require( msg.value == price * _amount,              "Not enough ETH for transaction" );
        for(uint256 i; i < _amount; i++){
            _safeMint( msg.sender, supply + i );
        }
    }

    function mintReserved(uint256 _amount) public onlyOwner {
        // Limited to a publicly set amount
        require( _amount <= reserved, "Can't reserve more than set amount" );
        reserved -= _amount;
        uint256 supply = totalSupply();
        for(uint256 i; i < _amount; i++){
            _safeMint( msg.sender, supply + i );
        }
    }
    
    function editWhitelistReserved(address[] memory _a, uint256[] memory _amount) public onlyOwner {
        for(uint256 i; i < _a.length; i++){
            whitelistReserved[_a[i]] = _amount[i];
        }
    }

    function setWhitelistActive(bool val) public onlyOwner {
        whitelistActive = val;
    }

    function setPresaleActive(bool val) public onlyOwner {
        presaleActive = val;
    }

    function setSaleActive(bool val) public onlyOwner {
        saleActive = val;
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    function setPrice(uint256 newPrice) public onlyOwner {
        price = newPrice;
    }
    
    function setAddresses(address[] memory _a) public onlyOwner {
        a1 = _a[0];
    }

    function withdrawTeam(uint256 amount) public payable onlyOwner {
        uint256 percent = amount / 100;
        require(payable(a1).send(percent * 100));
    }
}