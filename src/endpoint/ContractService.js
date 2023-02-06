const {
    ContractInfoQuery, ContractDeleteTransaction, ContractByteCodeQuery,
    ContractExecuteTransaction, ContractFunctionParameters, ContractCallQuery, ContractCreateTransaction, Hbar,
    AccountId
} = require("@hashgraph/sdk");
const BaseHederaService = require("./BaseHederaService.js");
const {Contract} = require("./models");

class ContractService extends BaseHederaService {
    createContract({bytecodeFileId, tokenAddressSol}) {
        return new Promise(async (resolve, reject) => {
            try {
                // Instantiate the smart contract
                const contractInstantiateTx = new ContractCreateTransaction()
                    .setBytecodeFileId(bytecodeFileId)
                    .setGas(3000000)
                    .setConstructorParameters(new ContractFunctionParameters().addAddress(tokenAddressSol));
                const contractInstantiateSubmit = await contractInstantiateTx.execute(this.getHederaClient());
                const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(this.getHederaClient());
                const contractId = contractInstantiateRx.contractId;
                const contractAddress = contractId.toSolidityAddress();
                console.log(`- Smart contract ID in Solidity format: ${contractAddress}`);
                resolve(new Contract(`${contractId}`, `${contractAddress}`));
            } catch (e) {
                reject(e);
            }
        })
    }

    getInfoContract({contractId}) {
        return new Promise(async (resolve, reject) => {
            try {
                //Create the query
                const query = new ContractInfoQuery().setContractId(contractId);

                const info = await query.execute(this.getHederaClient());

                resolve({info});
            } catch (e) {
                reject(e);
            }
        })
    }

    deleteContract({contractId}) {
        return new Promise(async (resolve, reject) => {
            try {
                //Create the transaction
                const transactionReceipt = await (await new ContractDeleteTransaction()
                    .setContractId(contractId)
                    .setTransferContractId(this.getHederaClient().operatorAccountId.toString())
                    .execute(this.getHederaClient()))
                    .getReceipt(this.getHederaClient());
                const status = await transactionReceipt.status;
                resolve({status});

            } catch (e) {
                reject(e);
            }
        })
    }

    getBytecodeContract({contractId}) {
        return new Promise(async (resolve, reject) => {
            try {
                //Create the query
                const content = await new ContractByteCodeQuery()
                    .setContractId(contractId)
                    .execute(this.getHederaClient());

                const bytecode = content.toString('hex');
                resolve({bytecode});

            } catch (e) {
                reject(e);
            }
        })
    }

    getStateSizeContract({contractId}) {
        return new Promise(async (resolve, reject) => {
            try {
                //Create the query
                const query = new ContractInfoQuery()
                    .setContractId(contractId);

                const info = await query.execute(this.getHederaClient());
                const stateSize = info.storage.toNumber();
                resolve({stateSize});
            } catch (e) {
                reject(e);
            }
        })
    }

    executeTransactionOnContract({contractId, functionName, argument, gasValue, tokenId}) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`Execute the Smart Contract`);
                //Execute a contract function (mint)
                const contractExecTx = await new ContractExecuteTransaction()
                    .setContractId(contractId)
                    .setGas(gasValue)
                    .setPayableAmount(20)
                    .setFunction(functionName,
                        new ContractFunctionParameters().addUint64(argument)
                    )
                    .setMaxTransactionFee(new Hbar(2));
                const contractExecSubmit = await contractExecTx.execute(this.client);
                const contractExecRx = await contractExecSubmit.getReceipt(this.client);
                console.log(`- New tokens minted: ${contractExecRx.status.toString()}`);

                const tokenInfo3 = await this.tQueryFcn(tokenId);
                console.log(`- New token supply: ${tokenInfo3.totalSupply.low} \n`);
                resolve({tokenInfo3})
            } catch (e) {
                reject(e);
            }
        })
    }

    callMethodOnContract({contractId, functionName, argument, gasValue}) {
        return new Promise(async (resolve, reject) => {
            try {
                let contractCallResult;
                if (null != argument) {
                    const cost = await new ContractCallQuery()
                        .setContractId(contractId)
                        .setGas(gasValue)
                        .setFunction(functionName, new ContractFunctionParameters().addString(argument))
                        .getCost(this.getHederaClient());

                    const estimatedCost = await cost + cost / 50; // add 2% of this cost
                    contractCallResult = await new ContractCallQuery()
                        .setContractId(contractId)
                        .setQueryPayment(estimatedCost)
                        .setGas(gasValue)
                        .setFunction(functionName, new ContractFunctionParameters().addString(argument))
                        .execute(this.getHederaClient());
                } else {
                    const cost = await new ContractCallQuery()
                        .setContractId(contractId)
                        .setGas(gasValue)
                        .setFunction(functionName)
                        .getCost(this.getHederaClient());
                    const estimatedCost = await cost + cost / 50; // add 2% of this cost
                    contractCallResult = await new ContractCallQuery()
                        .setContractId(contractId)
                        .setQueryPayment(estimatedCost)
                        .setGas(gasValue) //get this value from remix + trial and error on hedera.
                        .setFunction(functionName)
                        .execute(this.getHederaClient());
                }
                if (null != contractCallResult.errorMessage) {
                    reject(contractCallResult.errorMessage);
                }
                const result = contractCallResult.getString(0);
                resolve({result})
            } catch (e) {
                reject(e);
            }
        })
    }
}

module.exports = ContractService;
