'use strict';

module.exports = {
    Account: class {

        constructor(accountId, privateKey) {
            this.accountId = accountId.toString();
            this.privateKey = privateKey.toString();
            this.publicKey = privateKey.publicKey.toString();
            this.solidityAddress = accountId.toSolidityAddress();
        }
    }
}
