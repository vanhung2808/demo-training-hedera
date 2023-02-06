'use strict';

module.exports = {
    Account: class {

        constructor(accountId, privateKey) {
            this.accountId = accountId.toString();
            this.privateKey = privateKey.toString();
            this.publicKey = privateKey.publicKey.toString();
            this.solidityAddress = accountId.toSolidityAddress();
        }
    },

    Contract: class {

        constructor(contractId, contractAddress) {
            this.contractId = contractId;
            this.contractAddress = contractAddress;
        }
    },

    ContractTokenInfo: class {

        constructor(tokenId, tokenAddressSol, totalSupplyLow, bytecodeFileId, fileAppendRxStatus) {
            this.tokenId = tokenId;
            this.tokenAddressSol = tokenAddressSol;
            this.totalSupplyLow = totalSupplyLow;
            this.bytecodeFileId = bytecodeFileId;
            this.fileAppendRxStatus = fileAppendRxStatus;
        }
    }
}
