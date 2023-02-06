const {
    Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, AccountInfoQuery, AccountDeleteTransaction,
    TransferTransaction
} = require("@hashgraph/sdk");
const BaseHederaService = require("./BaseHederaService.js");
const myAccountId = !process.env.REACT_APP_MY_ACCOUNT_ID ? '0.0.2428967' : process.env.REACT_APP_MY_ACCOUNT_ID;
// const {Account: AccountService} = require("./models");

class AccountService extends BaseHederaService {
    async createAccount(initialBalance) {
        const client = this.getHederaClient();

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
        /*let obj = JSON.stringify(new AccountService(newAccountId, newAccountPrivateKey));
        console.log(obj);
        return new AccountService(newAccountId, newAccountPrivateKey);*/
        let obj = {
            accountId: newAccountId.toString(),
            accountKey: newAccountPrivateKey.toString(),
            accountPublicKey: newAccountPublicKey.toString(),
            solidityAddress: newAccountId.toSolidityAddress()
        };
        console.log(obj);
        return obj;
    }

    async getAccountInfo(accountId) {
        const client = this.getHederaClient();

        //Create the account info query
        const query = new AccountInfoQuery()
            .setAccountId(accountId);

        //Sign with client operator private key and submit the query to a Hedera network
        const accountInfo = await query.execute(client);

        //Print the account info to the console
        console.log(accountInfo);
        return accountInfo;
    }

    async deleteAccount({accountId, accountPrivateKey}) {
        const client = this.getHederaClient();

        //Create the transaction to delete an account
        const transaction = await new AccountDeleteTransaction()
            .setAccountId(accountId)
            .setTransferAccountId(myAccountId)
            .freezeWith(client);

        const privateKey = PrivateKey.fromStringED25519(accountPrivateKey);
        //Sign the transaction with the account key
        const signTx = await transaction.sign(privateKey);

        //Sign with the client operator private key and submit to a Hedera network
        const txResponse = await signTx.execute(client);

        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);

        //Get the transaction consensus status
        const transactionStatus = receipt.status;

        console.log("The transaction consensus status is " +transactionStatus.toString());

        return transactionStatus.toString();
    }

    async getHbarAccountBalance(accountId) {
        const client = this.getHederaClient();

        //Create the account balance query
        const query = new AccountBalanceQuery()
            .setAccountId(accountId);

        //Submit the query to a Hedera network
        const accountBalance = await query.execute(client);

        //Print the balance of hbars
        console.log("The hbar account balance for this account is " +accountBalance.hbars);
        return accountBalance.hbars;
    }

    async transferHbars({amount, memo, senderId, senderPrivateKey, receiverId}) {
        const client = this.getHederaClient();

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

module.exports = AccountService;