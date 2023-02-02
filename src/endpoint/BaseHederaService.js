'use strict';
const {Client} = require("@hashgraph/sdk");
class BaseHederaService{
}

BaseHederaService.prototype.getHederaClient = function () {
    // Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = !process.env.REACT_APP_MY_ACCOUNT_ID ? '0.0.2428967' : process.env.REACT_APP_MY_ACCOUNT_ID;
    const myPrivateKey = !process.env.REACT_APP_MY_PRIVATE_KEY ? 'b7fb238125019955e221a73e9861555e0096138dbd530735745b7ca24c268d59' : process.env.REACT_APP_MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }
    console.log(myAccountId)

    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    return client;

};

module.exports = BaseHederaService;
