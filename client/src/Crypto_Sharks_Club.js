const NETWORK_ID = 137
var NFT_PRICE = null
var PRESALE_PRICE = null
var MAX_SUPPLY = null
var MAX_PRESALE_SUPPLY = null
var contract
var accounts
var web3
var balance
var available

function metamaskReloadCallback()
{
  window.ethereum.on('accountsChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Accounts changed, realoading...";
    window.location.reload()
  })
  window.ethereum.on('networkChanged', (accounts) => {
    document.getElementById("web3_message").textContent="Network changed, realoading...";
    window.location.reload()
  })
}

const getAccounts = async () => {
  metamaskReloadCallback()
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    resolve(web3)
  } catch (error) {
    console.log(error)
  }
}

const getWeb3 = async () => {
  return new Promise((resolve, reject) => {
    if(document.readyState=="complete")
    {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        resolve(web3)
      } else {
        reject("must install MetaMask")
        document.getElementById("web3_message").textContent="Error: Please install Metamask";
      }
    }else
    {
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum)
          resolve(web3)
        } else {
          reject("must install MetaMask")
          document.getElementById("web3_message").textContent="Error: Please install Metamask";
        }
      });
    }
  });
};

function handleRevertError(message) {
  alert(message)
}

async function getRevertReason(txHash) {
  const tx = await web3.eth.getTransaction(txHash)
  await web3.eth
    .call(tx, tx.blockNumber)
    .then((result) => {
      throw Error("unlikely to happen")
    })
    .catch((revertReason) => {
      var str = "" + revertReason
      json_reason = JSON.parse(str.substring(str.indexOf("{")))
      handleRevertError(json_reason.message)
    });
}

const getContract = async (web3) => {
  const response = await fetch("./contracts/CryptoSharksClub.json");
  const data = await response.json();

  const netId = await web3.eth.net.getId();
  const deployedNetwork = data.networks[netId];
  contract = new web3.eth.Contract(
    data.abi,
    deployedNetwork && deployedNetwork.address
    );
  return contract
}

async function connectWallet() {
  getAccounts()
}

async function loadAccount() {
  accounts = await web3.eth.getAccounts()
  balance = await contract.methods.balanceOf(accounts[0]).call()
  document.getElementById("web3_message").textContent="Connected"
  document.getElementById("connect_button").style.display = "none"
  document.getElementById("nft_balance").textContent="You have " + balance + " Sharks"
}

async function loadDapp() {
  document.getElementById("web3_message").textContent="Connecting..."
  var awaitWeb3 = async function () {
    web3 = await getWeb3()
    web3.eth.net.getId((err, netId) => {
      if (netId == NETWORK_ID) {
        var awaitContract = async function () {
          contract = await getContract(web3);
          NFT_PRICE = await contract.methods.price().call()
          MAX_SUPPLY = await contract.methods.MAX_SUPPLY().call()
          MAX_PRESALE_SUPPLY = await contract.methods.MAX_PRESALE_SUPPLY().call()
          total_mint = await contract.methods.totalSupply().call()
          available = MAX_SUPPLY - total_mint
          available_presale = MAX_PRESALE_SUPPLY - total_mint
          if(document.getElementById("total_mint"))
            document.getElementById("total_mint").textContent = available + "/" + MAX_SUPPLY + " available"
          if(document.getElementById("total_mint_presale"))
            document.getElementById("total_mint_presale").textContent = available_presale + "/" + MAX_PRESALE_SUPPLY + " available"
          if(document.getElementById("price"))
            document.getElementById("price").textContent= "Price: " + web3.utils.fromWei(NFT_PRICE) + " ETH"
          if(document.getElementById("presale_price"))
            document.getElementById("presale_price").textContent= "Presale Price: " + web3.utils.fromWei(PRESALE_PRICE) + " ETH"
          web3.eth.getAccounts(function(err, accounts){
            if (err != null)
              console.error("An error occurred: "+err);
            else if (accounts.length == 0)
              console.log("User is not logged in to MetaMask");
            else
            {
              loadAccount()
            }
          });
        };
        awaitContract();
      } else {
        document.getElementById("web3_message").textContent="Please connect to Polygon Mainnet";
      }
    });
  };
  awaitWeb3();
}

loadDapp()

document.getElementById("web3_message").textContent="Please connect to Metamask"

/* SALE */

const mint = async () => {
  let mint_amount = document.getElementById("mint_amount").value
  const result = await contract.methods.mintToken(mint_amount)
    .send({ from: accounts[0], gas: 0, value: NFT_PRICE * mint_amount })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

/* PRESALE */

const mintPresale = async () => {
  let mint_amount = document.getElementById("mint_amount").value
  const result = await contract.methods.mintPresale(mint_amount)
    .send({ from: accounts[0], gas: 0, value: PRESALE_PRICE * mint_amount })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

/* Whitelist */

const mintWhitelist = async () => {
  let mint_amount = document.getElementById("mint_amount").value
  const result = await contract.methods.mintWhitelist(mint_amount)
    .send({ from: accounts[0], gas: 0, value: NFT_PRICE * mint_amount })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

/* Owner */

const mintReserved = async () => {
  let mint_amount = document.getElementById("mint_amount").value
  const result = await contract.methods.mintReserved(mint_amount)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const editPresaleReserved = async () => {
  const result = await contract.methods.editPresaleReserved(["0xA","0xB"],[0,0])
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setPresaleActive = async () => {
  const result = await contract.methods.setPresaleActive(true)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setSaleActive = async () => {
  const result = await contract.methods.setSaleActive(true)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setBaseURI = async () => {
  const result = await contract.methods.setBaseURI("http://")
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setPrice = async () => {
  const result = await contract.methods.setPrice("0")//(10000000)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setAddresses = async () => {
  const result = await contract.methods.setAddresses(
    [
      "0x2A2cea6D046b0F673593E839644dAfb8c8fA8340"
    ]
    )
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const withdrawTeam = async () => {
  const result = await contract.methods.withdrawTeam("110")
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const editWhitelistReserved = async () => {
  const result = await contract.methods.editWhitelistReserved(
    [
      "",
    ],
    [
    ]
    )
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}

const setWhitelistActive = async () => {
  const result = await contract.methods.setWhitelistActive(true)
    .send({ from: accounts[0], gas: 0, value: 0 })
    .on('transactionHash', function(hash){
      document.getElementById("web3_message").textContent="Minting...";
    })
    .on('receipt', function(receipt){
      document.getElementById("web3_message").textContent="Success! Minting finished.";    })
    .catch((revertReason) => {
      getRevertReason(revertReason.receipt.transactionHash);
    });
}