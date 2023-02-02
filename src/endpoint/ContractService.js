const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, ContractCreateFlow, ContractInfoQuery,
    ContractDeleteTransaction, ContractByteCodeQuery, ContractExecuteTransaction, ContractFunctionParameters,
    ContractCallQuery
} = require("@hashgraph/sdk");

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

function createContract({bytecode}) {
    return new Promise(async (resolve, reject) => {
        try {
            //Create the transaction
            const contractCreate = new ContractCreateFlow()
                .setGas(100_000)
                .setBytecode(bytecode);

            //Sign the transaction with the client operator key and submit to a Hedera network
            const txResponse = await contractCreate.execute(client);

            //Get the receipt of the transaction
            const receipt = (await txResponse).getReceipt(client);

            //Get the new contract ID
            const newContractId = (await receipt).contractId;

            const contractId = newContractId.toString();

            console.log("The new contract ID is " + contractId);

            resolve({contractId});
        } catch (e) {
            reject(e);
        }
    })
}

function getInfoContract({contractId}) {
    return new Promise(async (resolve, reject) => {
        try {
            //Create the query
            const query = new ContractInfoQuery()
                .setContractId(contractId);

            const info = await query.execute(client);

            resolve({info});
        } catch (e) {
            reject(e);
        }
    })
}
function deleteContract({contractId}) {
    return new Promise( async (resolve, reject) => {
        try {
            //Create the transaction
            const transactionReceipt = await (await new ContractDeleteTransaction()
                .setContractId(contractId)
                .setTransferContractId(myAccountId)
                .execute(client))
                .getReceipt(client);
            const status = await transactionReceipt.status;
            resolve({status});

        } catch (e) {
            reject(e);
        }
    })
}

function getBytecodeContract({contractId}) {
    return new Promise( async (resolve, reject) => {
        try {
            //Create the query
            const content = await new ContractByteCodeQuery()
                .setContractId(contractId)
                .execute(client);

            const bytecode = content.toString('hex');
            resolve({bytecode});

        } catch (e) {
            reject(e);
        }
    })
}

function getStateSizeContract({contractId}) {
    return new Promise(async (resolve, reject) => {
        try {
            //Create the query
            const query = new ContractInfoQuery()
                .setContractId(contractId);

            const info = await query.execute(client);
            const stateSize = info.storage.toNumber();
            resolve({stateSize});
        } catch (e) {
            reject(e);
        }
    })
}

function executeTransactionOnContract({contractId, functionName, argument, gasValue}) {
    return new Promise(async (resolve, reject) => {
        try {
            const contractExecTxnId = await new ContractExecuteTransaction()
                .setContractId(contractId)
                .setGas(gasValue)
                .setFunction(functionName, new ContractFunctionParameters().addString(argument))
                .execute(client);

            const receipt = await contractExecTxnId.getReceipt(client);
            resolve({receipt})
        } catch (e) {
            reject(e);
        }
    })
}

function callMethodOnContract({contractId, functionName, argument, gasValue}) {
    return new Promise(async (resolve, reject) => {
        try {
            let contractCallResult;
            if (null != argument) {
                const cost = await new ContractCallQuery()
                    .setContractId(contractId)
                    .setGas(gasValue)
                    .setFunction(functionName, new ContractFunctionParameters().addString(argument))
                    .getCost(client);

                const estimatedCost = await cost + cost / 50; // add 2% of this cost
                contractCallResult = await new ContractCallQuery()
                    .setContractId(contractId)
                    .setQueryPayment(estimatedCost)
                    .setGas(gasValue)
                    .setFunction(functionName, new ContractFunctionParameters().addString(argument))
                    .execute(client);
            } else {
                const cost = await new ContractCallQuery()
                    .setContractId(contractId)
                    .setGas(gasValue)
                    .setFunction(functionName)
                    .getCost(client);
                const estimatedCost = await cost + cost / 50; // add 2% of this cost
                contractCallResult = await new ContractCallQuery()
                    .setContractId(contractId)
                    .setQueryPayment(estimatedCost)
                    .setGas(gasValue) //get this value from remix + trial and error on hedera.
                    .setFunction(functionName)
                    .execute(client);
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

module.exports = {
    createContract,
    getInfoContract,
    deleteContract,
    getBytecodeContract,
    getStateSizeContract,
    executeTransactionOnContract,
    callMethodOnContract
};