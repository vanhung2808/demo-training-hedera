const {
    FileCreateTransaction, Hbar, PrivateKey, Key, PublicKey, FileId, FileAppendTransaction, FileContentsQuery,
    FileInfoQuery
} = require("@hashgraph/sdk");
const BaseHederaService = require('./BaseHederaService.js');

class FileService extends BaseHederaService {
    async createFile(text) {

        const client = this.getHederaClient();
        //const filePublicKey = client.operatorPublicKey;
        const filePrivateKey = PrivateKey.fromStringED25519('b7fb238125019955e221a73e9861555e0096138dbd530735745b7ca24c268d59');
        // const filePublicKey= PublicKey.fromStringED25519("302a300506032b657003210080005e4c83a7e0bdd8c1cfe767e6607c48207dd03cbb7641f6c68b39b0a0bec5");
        //Create the transaction
        const transaction = await new FileCreateTransaction()
            .setKeys([filePrivateKey]) //A different key then the client operator key
            .setContents(text)
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client);

        //Sign with the file private key
        const signTx = await transaction.sign(PrivateKey.fromStringED25519('b7fb238125019955e221a73e9861555e0096138dbd530735745b7ca24c268d59'));

        //Sign with the client operator private key and submit to a Hedera network
        const submitTx = await signTx.execute(client);

        //Request the receipt
        const receipt = await submitTx.getReceipt(client);

        //Get the file ID
        console.log("The new file ID is: " + receipt.fileId);
        return receipt.fileId.toString();
    }

    async appendFile(text, fileID) {
        const fileId = FileId.fromString(fileID);
        const client = this.getHederaClient();
        //const filePublicKey = client.operatorPublicKey;
        const filePrivateKey = PrivateKey.fromStringED25519('b7fb238125019955e221a73e9861555e0096138dbd530735745b7ca24c268d59');
        const transaction = await new FileAppendTransaction()
            .setFileId(fileID)
            .setContents(text)
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client);

//Sign with the file private key
        const signTx = await transaction.sign(filePrivateKey);

//Sign with the client operator key and submit to a Hedera network
        const txResponse = await signTx.execute(client);

//Request the receipt
        const receipt = await txResponse.getReceipt(client);

//Get the transaction consensus status
        const transactionStatus = receipt.status;
        return {"status": transactionStatus};
    }

    async getContent(fileID) {
        const fileId = FileId.fromString(fileID);
        const client = this.getHederaClient();
        const query = new FileContentsQuery()
            .setFileId(fileID);
        const contents = await query.execute(client);
        return {"content": contents.toString()};
    }

    async getInfo(fileID) {
        const fileId = FileId.fromString(fileID);
        const query = new FileInfoQuery()
            .setFileId(fileId);
        const client = this.getHederaClient();

//Sign the query with the client operator private key and submit to a Hedera network
        const getInfo = await query.execute(client);

        console.log("File info response: " + getInfo);
        return {"file info" : getInfo};
    }
}

module.exports = FileService;