const {
    FileCreateTransaction, Hbar, PrivateKey
} = require("@hashgraph/sdk");
const BaseHederaService = require('./BaseHederaService.js');

class FileService extends BaseHederaService {
    async createFile(text) {

        const client = this.getHederaClient();
        const filePublicKey = client.operatorPublicKey;

        //Create the transaction
        const transaction = await new FileCreateTransaction()
            .setKeys([filePublicKey]) //A different key then the client operator key
            .setContents(text)
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client);

        //Sign with the file private key
        const signTx = await transaction.sign(PrivateKey.generateED25519());

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