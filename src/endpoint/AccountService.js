const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, AccountInfoQuery, AccountDeleteTransaction, CryptoTransferTransaction, TransferTransaction} = require("@hashgraph/sdk");
const {Account: AccountService} = require("./models");

//Grab your Hedera testnet account ID and private key from your .env file
const myAccountId = !process.env.REACT_APP_MY_ACCOUNT_ID ? '0.0.2428967': process.env.REACT_APP_MY_ACCOUNT_ID;
const myPrivateKey = !process.env.REACT_APP_MY_PRIVATE_KEY? 'b7fb238125019955e221a73e9861555e0096138dbd530735745b7ca24c268d59': process.env.REACT_APP_MY_PRIVATE_KEY;

// If we weren't able to grab it, we should throw a new error
if (!myAccountId || !myPrivateKey) {
    throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
}

// Create our connection to the Hedera network
// The Hedera JS SDK makes this really easy!
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

module.exports = {

     createAccount: async function(initialBalance) {
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
    },

    getAccountInfo: async function(accountId) {
        //Create the account info query
        const query = new AccountInfoQuery()
            .setAccountId(accountId);

        //Sign with client operator private key and submit the query to a Hedera network
        const accountInfo = await query.execute(client);

        //Print the account info to the console
        console.log(accountInfo);
        return accountInfo;
    },

    deleteAccount: async function(newAccountId, accountPrivateKey) {
        //Create the transaction to delete an account
        const transaction = await new AccountDeleteTransaction()
            .setAccountId(newAccountId)
            .setTransferAccountId(myAccountId)
            .freezeWith(client);

        //Sign the transaction with the account key
        const signTx = await transaction.sign(accountPrivateKey);

        //Sign with the client operator private key and submit to a Hedera network
        const txResponse = await signTx.execute(client);

        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);

        //Get the transaction consensus status
        const transactionStatus = receipt.status;

        console.log("The transaction consensus status is " +transactionStatus);

        return transactionStatus;
    },

    getHbarAccountBalance: async function(accountId) {
        //Create the account balance query
        const query = new AccountBalanceQuery()
            .setAccountId(accountId);

        //Submit the query to a Hedera network
        const accountBalance = await query.execute(client);

        //Print the balance of hbars
        console.log("The hbar account balance for this account is " +accountBalance.hbars);
        return accountBalance.hbars;
    },

    transferHbars: async function({amount, memo, senderId, senderPrivateKey, receiverId}) {
        let _client;
        let _senderId;
        const _memo = memo == null ? "" : memo;
        if (senderId == null && senderPrivateKey == null) {
            _client = client;
            _senderId = myAccountId;
        } else {
            _client = Client.forTestnet().setOperator(senderId, senderPrivateKey);
            _senderId = senderId;
        }

        const transaction = new TransferTransaction()
            .addHbarTransfer(_senderId, Hbar.fromTinybars(-amount))
            .addHbarTransfer(receiverId, Hbar.fromTinybars(amount))
            .setTransactionMemo(_memo);

        //Submit the transaction to a Hedera network
        const txResponse = await transaction.execute(_client);

        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(_client);

        //Get the transaction consensus status
        const transactionStatus = receipt.status;
        console.log("The transaction consensus status is " +transactionStatus.toString());
        return transactionStatus.toString();
    }
}
