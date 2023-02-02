const {
    FileCreateTransaction, Hbar, PrivateKey, Key, PublicKey
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
}

module.exports = FileService;