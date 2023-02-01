const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar} = require("@hashgraph/sdk");
const {Account: AccountService} = require("./models");
module.exports = {

     createAccount: async function(initialBalance) {

        //Grab your Hedera testnet account ID and private key from your .env file
        const myAccountId = !process.env.REACT_APP_MY_ACCOUNT_ID ? '0.0.2428967': process.env.REACT_APP_MY_ACCOUNT_ID;
        const myPrivateKey = !process.env.REACT_APP_MY_PRIVATE_KEY? 'b7fb238125019955e221a73e9861555e0096138dbd530735745b7ca24c268d59': process.env.REACT_APP_MY_PRIVATE_KEY;

        // If we weren't able to grab it, we should throw a new error
        if (!myAccountId || !myPrivateKey) {
            throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
        }
        console.log(myAccountId)

        // Create our connection to the Hedera network
        // The Hedera JS SDK makes this really easy!
        const client = Client.forTestnet();
        client.setOperator(myAccountId, myPrivateKey);

        //Create new keys
        const newAccountPrivateKey = PrivateKey.generateED25519();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        //Create a new account with 1,000 tinybar starting balance
        const newAccount = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(Hbar.fromTinybars(initialBalance))
            .execute(client);

        // Get the new account ID
        const getReceipt = await newAccount.getReceipt(client);
        const newAccountId = getReceipt.accountId;

        console.log("The new account ID is: " + newAccountId);

        //Verify the account balance
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(client);

        console.log("The new account balance is: " + accountBalance.hbars.toTinybars() + " tinybar.");
        let obj = JSON.stringify(new AccountService(newAccountId, newAccountPrivateKey));
        console.log(obj);
        return new AccountService(newAccountId, newAccountPrivateKey);
    }

    getAccountInfo: async function(accountId) {
        //Grab your Hedera testnet account ID and private key from your .env file
        const myAccountId = !process.env.REACT_APP_MY_ACCOUNT_ID ? '0.0.2428967': process.env.REACT_APP_MY_ACCOUNT_ID;
        const myPrivateKey = !process.env.REACT_APP_MY_PRIVATE_KEY? 'b7fb238125019955e221a73e9861555e0096138dbd530735745b7ca24c268d59': process.env.REACT_APP_MY_PRIVATE_KEY;

        // If we weren't able to grab it, we should throw a new error
        if (!myAccountId || !myPrivateKey) {
            throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
        }
        console.log(myAccountId)

        // Create our connection to the Hedera network
        const client = Client.forTestnet();
        client.setOperator(myAccountId, myPrivateKey);

        //Create the account info query
        const query = new AccountInfoQuery()
            .setAccountId(accountId);

        //Sign with client operator private key and submit the query to a Hedera network
        const accountInfo = await query.execute(client);

        //Print the account info to the console
        console.log(accountInfo);
        return accountInfo;
    }
    //throws HederaStatusException
}
