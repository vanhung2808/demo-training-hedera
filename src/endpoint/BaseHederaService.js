'use strict';
const {Client, AccountId, PrivateKey, TokenInfoQuery} = require("@hashgraph/sdk");

class BaseHederaService {
    // TESTNET CREDENTIALS
    OPERATOR_ID = '0.0.2428967'
    OPERATOR_PBKEY = '1d57da743b4fa00b50e94da0bd0436ba7828e06807073218de213a8007bf23af'
    OPERATOR_PVKEY = 'b7fb238125019955e221a73e9861555e0096138dbd530735745b7ca24c268d59'

    TREASURY_ID = '0.0.2917624'
    TREASURY_PBKEY = '302a300506032b6570032100a34122a17c6cd91d068e733f7aa95a1404e606e7c8c6b8548856431d458ce203'
    TREASURY_PVKEY = '302e020100300506032b6570042204201e369c54b484eed8ecd03df0b2b3210256709974ca7c0da9708ff81b464a5602'

    ALICE_ID = '0.0.2665800'
    ALICE_PBKEY = '302a300506032b6570032100afc57fa3b68641034108ddfe22cff9d2dcad2461e2a8dd0d95a7e311af095ebf'
    ALICE_PVKEY = '302e020100300506032b657004220420b18c1fe7238d4e7dfe73405de458905f0b6b74419056382bba9f47f20a271793'

    BOB_ID = '0.0.2667824'
    BOB_PBKEY = '302a300506032b6570032100d918da30b825d0cdcc1fff01ae5cc9716c2e1d2d8b9e3ab8c7a50755de6a5c3b'
    BOB_PVKEY = '302e020100300506032b657004220420ed8f85706372da5a1f4d3c8b409187e3278dd2087a5c86cefc96a55823d0987e'

    client = this.getHederaClient();

    operatorId = AccountId.fromString(this.OPERATOR_ID);
    operatorKey = PrivateKey.fromString(this.OPERATOR_PVKEY);
    treasuryId = AccountId.fromString(this.TREASURY_ID);
    treasuryKey = PrivateKey.fromString(this.TREASURY_PVKEY);
    aliceId = AccountId.fromString(this.ALICE_ID);
    aliceyKey = PrivateKey.fromString(this.ALICE_PVKEY);

    async tQueryFcn(tId) {
        return await new TokenInfoQuery().setTokenId(tId).execute(this.client);
    }

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
