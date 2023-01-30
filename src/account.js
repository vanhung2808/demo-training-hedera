// const { Client } = require("@hashgraph/sdk");
// const webpack = require('dotenv-webpack'); // only add this if you don't have yet
export async function createAccount() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.REACT_APP_MY_ACCOUNT_ID;
    const myPrivateKey = process.env.REACT_APP_MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }
    console.log(myAccountId)
    console.log(myPrivateKey)
}

