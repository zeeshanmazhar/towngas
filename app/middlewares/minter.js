const ethers = require('ethers');


const url = "https://polygon-mumbai.g.alchemy.com/v2/tOykGcyLXC2RW8KmcQ-fKRSmaznAVj4v";

// Define an Alchemy Provider
const provider =new ethers.providers.JsonRpcProvider(url);

// Get contract ABI file
const contract = require("../config/abi.json");

// Create a signer
const privateKey = '50a70dd07254a31c06a8e765f6c4b8bb2072a86a5ab9ec0028c65b917efcfee9';
const publicKey = '0xcAfc2Dae33396659D977E1A7d9Daf757288b09e1';
const signer = new ethers.Wallet(privateKey, provider)

// Get contract ABI and address
const abi = contract;
const contractAddress = '0xA4766Ceb9E84a71D282A4CED9fB8Fe93C49b2Ff7'

// Create a contract instance
const myNftContract = new ethers.Contract(contractAddress, abi, signer)

// Get the NFT Metadata IPFS URL
const tokenUri = "https://gateway.pinata.cloud/ipfs/QmYueiuRNmL4MiA2GwtVMm6ZagknXnSpQnB3z2gWbz36hP"

// Call mintNFT function
const mintNFT = async (address) => {
    let nftTxn = await myNftContract.mint(1, address);
     await nftTxn.wait()
    // return nftTxn.wait()
    //  .then((tx)=>{
    //     console.log(tx);
    //     return tx;
    //  })

     console.log(`NFT Minted! Check it out at: https://mumbai.polygonscan.com/tx/${nftTxn.hash}`)
     return nftTxn;

}

module.exports = mintNFT;
