const { ethers } = require("ethers")
const fs = require('fs')

const url = "https://polygon-mumbai.g.alchemy.com/v2/tOykGcyLXC2RW8KmcQ-fKRSmaznAVj4v";

const provider =new ethers.providers.JsonRpcProvider(url);

const privateKey = '257d6b7fe2b9ce653d9c0d71142d622cdaef51ffbda647fe84950fd7043ffe21';

const contractAddress = "0x51F86db5721Ec0b87A9A85b825f1b78AF751CfcF";

// const contractAbi = fs.readFileSync("abi.json").toString()
const contractAbi = require("../config/abi.json");

const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider);

async function getGasPrice() {
    let feeData = await provider.getFeeData()
    return feeData.gasPrice
}

async function getWallet(privateKey) {
    const wallet = await new ethers.Wallet(privateKey, provider)
    return wallet
}

async function getChain(_provider) {
    let chainId = await _provider.getNetwork()
    return chainId.chainId
}

async function getContractInfo(index, id) {
    let contract = await contractInstance.getERC1155byIndexAndId(index, id)

    return contract;
}

async function getNonce(signer) {
    return (await signer).getTransactionCount()
}

async function mintERC1155(index, name, amount) {
    try {
        if (await getChain(provider) === 80001) {
            const wallet = getWallet(privateKey)
            const nonce = await getNonce(wallet)
            const gasFee = await getGasPrice()
            let rawTxn = await contractInstance.populateTransaction.mint(index, name, amount, {
                gasPrice: gasFee,
                nonce: nonce
            })
            console.log("...Submitting transaction with gas price of:", ethers.utils.formatUnits(gasFee, "gwei"), " - & nonce:", nonce)
            let signedTxn = (await wallet).sendTransaction(rawTxn)
            let reciept = (await signedTxn).wait()
            if (reciept) {
                console.log("Transaction is successful!!!" + '\n' + "Transaction Hash:", (await signedTxn).hash + '\n' + "Block Number: " + (await reciept).blockNumber + '\n' + "Navigate to https://polygonscan.com/tx/" + (await signedTxn).hash, "to see your transaction")
            } else {
                console.log("Error submitting transaction")
            }
        }
        else {
            console.log("Wrong network - Connect to configured chain ID first!")
        }
    } catch (e) {
        console.log("Error Caught in Catch Statement: ", e)
    }
}

module.exports = mintERC1155;