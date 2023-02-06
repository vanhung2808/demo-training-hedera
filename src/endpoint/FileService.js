const {
    FileCreateTransaction, Hbar, PrivateKey, FileId, FileAppendTransaction, FileContentsQuery, FileInfoQuery,
    TokenCreateTransaction, TokenInfoQuery, Client, AccountId
} = require("@hashgraph/sdk");
const BaseHederaService = require('./BaseHederaService.js');
const {ContractTokenInfo} = require("./models");

class FileService extends BaseHederaService {
    async createFile(text) {

        const client = this.getHederaClient();
        const fileCreateTx = await new FileCreateTransaction()
            .setKeys([this.operatorKey]) //A different key then the client operator key
            .setContents(text)
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client);
        //Sign with the file private key
        const fileCreateSign = await fileCreateTx.sign(this.operatorKey);

        //Sign with the client operator private key and submit to a Hedera network
        const fileCreateSubmit = await fileCreateSign.execute(client);

        //Request the receipt
        const fileCreateRx = await fileCreateSubmit.getReceipt(client);

        //Get the file ID
        const bytecodeFileId = fileCreateRx.fileId;
        console.log("The new file ID is: " + bytecodeFileId);
        return bytecodeFileId.toString();
    }

     addBytecodeFileToHedera({bytecode}) {
        return new Promise(async (resolve, reject) => {
            try {
                //Create a fungible token
                const tokenCreateTx = await new TokenCreateTransaction()
                    .setTokenName("hbarRocks")
                    .setTokenSymbol("HROK")
                    .setDecimals(0)
                    .setInitialSupply(100)
                    .setTreasuryAccountId(this.operatorId)
                    .setAdminKey(this.treasuryKey)
                    .setSupplyKey(this.treasuryKey)
                    .freezeWith(this.client)
                    .sign(this.treasuryKey);
                const tokenCreateSubmit = await tokenCreateTx.execute(this.client);
                const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);
                const tokenId = tokenCreateRx.tokenId;
                const tokenAddressSol = tokenId.toSolidityAddress();
                console.log(`- Token ID: ${tokenId}`);
                console.log(`- Token ID in Solidity format: ${tokenAddressSol}`);

                // Token query 1
                const tokenInfo1 = await this.tQueryFcn(tokenId);
                console.log(`- Initial token supply: ${tokenInfo1.totalSupply.low}`);

                //Create a file on Hedera and store the hex-encoded bytecode
                const fileCreateTx = new FileCreateTransaction().setKeys([this.operatorKey]);
                const fileSubmit = await fileCreateTx.execute(this.client);
                const fileCreateRx = await fileSubmit.getReceipt(this.client);
                const bytecodeFileId = fileCreateRx.fileId;
                console.log(`- The smart contract bytecode file ID is: ${bytecodeFileId}`);

                // Append contents to the file
                const fileAppendTx = new FileAppendTransaction()
                    .setFileId(bytecodeFileId)
                    .setContents(bytecode)
                    .setMaxChunks(10)
                    .setMaxTransactionFee(new Hbar(2));
                const fileAppendSubmit = await fileAppendTx.execute(this.client);
                const fileAppendRx = await fileAppendSubmit.getReceipt(this.client);
                console.log(`- Content added: ${fileAppendRx.status}`);

                resolve(new ContractTokenInfo(`${tokenId}`, `${tokenAddressSol}`,
                    `${tokenId}`, `${bytecodeFileId}`, `${fileAppendRx.status}`));
            } catch (e) {
                reject(e);
            }
        })
    }

    async appendFile(text, fileID) {
        const client = this.getHederaClient();
        //const filePublicKey = client.operatorPublicKey;
        const transaction = await new FileAppendTransaction()
            .setFileId(fileID)
            .setContents(text)
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client);

        //Sign with the file private key
        const signTx = await transaction.sign(this.operatorKey);

        //Sign with the client operator key and submit to a Hedera network
        const txResponse = await signTx.execute(client);

        //Request the receipt
        const receipt = await txResponse.getReceipt(client);

        //Get the transaction consensus status
        const transactionStatus = receipt.status;
        return {"status": transactionStatus};
    }

    async getContent(fileID) {
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
        return {"file info": getInfo};
    }
}

module.exports = FileService;
