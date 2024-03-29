const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const AccountService = require('./src/endpoint/AccountService.js');
const HCSService = require("./src/endpoint/HCSService.js");
const ContractService = require("./src/endpoint/ContractService.js");

const FileService = require('./src/endpoint/FileService.js');
const hcsService = new HCSService();
const contractService = new ContractService();
const fileService = new FileService();
const accountService = new AccountService();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);
// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

// create a GET route
app.get('/api/v1/hedera', (req, res) => {
    res.send({ express: 'Welcome to Hedera — let’s build the future' });
});

app.post('/api/v1/account/:initialBalance', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(await accountService.createAccount(req.params.initialBalance), null, 3));
});

app.get('/api/v1/account/info/:accountId', async (req, res) => {
    res.send(JSON.stringify(await accountService.getAccountInfo(req.params.accountId), null, 3));
});

app.get('/api/v1/account/balance/:accountId', async (req, res) => {
    res.send(JSON.stringify(await accountService.getHbarAccountBalance(req.params.accountId), null, 3));
});

app.delete('/api/v1/account', async (req, res) => {
    const {
        accountId,
        accountPrivateKey
    } = req.body

    try {
        const data = await accountService.deleteAccount({accountId, accountPrivateKey});
        console.log('Execute account deleting', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Execute account deleting', 'ERROR', {e});
        res.status(500).send({e});
    }
});

app.post('/api/v1/account/transaction/cryptoTransfer', async (req, res) => {
    const {
        amount,
        memo,
        senderId,
        senderPrivateKey,
        receiverId
    } = req.body

    try {
        const data = await accountService.transferHbars({amount, memo, senderId, senderPrivateKey, receiverId});
        console.log('Execute transfer Hbars', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Execute transfer Hbars', 'ERROR', {e});
        res.status(500).send({e});
    }
});

app.post('/api/v1/topic/', async (req, res) => {
    let topicId = await hcsService.createTopic();
    res.send({ topic: `${topicId}`});
});
app.get('/api/v1/topic/:topicId', async (req, res) => {
    let topicInfo = await hcsService.getTopicInfo(req.params.topicId);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(topicInfo, null, 3));
});

app.post('/api/v1/submitMessage', async (req, res) => {
    console.log(req.query.topicId);
    console.log(req.query.message);
    res.send({ message: await hcsService.submitMessage(req.query.topicId, req.query.message) });
});

app.post('/api/v1/subscribe',  (req, res) => {
    let result = hcsService.subscribeToTopic(req.query.topicId);
    res.send({ message: result ? "New messages in this topics will be printed to the console..." : "Subscription failed"});
});

app.post('/api/v1/contract', async (req, res) => {
    const bytecodeFileId = req.body.bytecodeFileId;
    const tokenAddressSol = req.body.tokenAddressSol;
    try {
        const contract = await contractService.createContract({bytecodeFileId, tokenAddressSol});
        console.log('Create contract', 'SUCCESS', contract);
        res.status(200).send(contract);
    } catch (e) {
        console.log('Create contract', 'ERROR', {e});
        res.status(500).send(e.toString());
    }
})

app.get('/api/v1/contract/:contractId', async (req, res) => {
    const contractId = req.params.contractId;
    try {
        const data = await contractService.getInfoContract({contractId});
        console.log('Get info contract', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Get info contract', 'ERROR', {e});
        res.status(500).send({error : e.toString()});
    }
})

app.delete('/api/v1/contract/:contractId', async (req, res) => {
    const contractId = req.params.contractId;
    try {
        const data = await contractService.deleteContract({contractId});
        console.log('Delete contract', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Delete contract', 'ERROR', {e});
        res.status(500).send({error : e.toString()});
    }
})

app.get('/api/v1/contract/:contractId/bytecode', async (req, res) => {
    const contractId = req.params.contractId;
    try {
        const data = await contractService.getBytecodeContract({contractId});
        console.log('Get bytecode contract', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Get bytecode contract', 'ERROR', {e});
        res.status(500).send({error : e.toString()});
    }
})

app.get('/api/v1/contract/:contractId/state-size', async (req, res) => {
    const contractId = req.params.contractId;
    try {
        const data = await contractService.getStateSizeContract({contractId});
        console.log('Get state size contract', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Get state size contract', 'ERROR', {e});
        res.status(500).send({error : e.toString()});
    }
})

app.post('/api/v1/contract/execute-transaction', async (req, res) => {
    const contractId = req.body.contractId;
    const functionName = req.body.functionName;
    const argument = req.body.argument;
    const gasValue = req.body.gasValue;
    const tokenId = req.body.tokenId;

    try {
        const data = await contractService.executeTransactionOnContract({contractId, functionName, argument, gasValue, tokenId});
        console.log('Execute transaction on contract', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Execute transaction on contract', 'ERROR', {e});
        res.status(500).send(`${e}`);
    }
})

app.post('/api/v1/contract/call-method', async (req, res) => {
    const contractId = req.body.contractId;
    const functionName = req.body.functionName;
    const argument = req.body.argument;
    const gasValue = req.body.gasValue;

    try {
        const data = await contractService.callMethodOnContract({contractId, functionName, argument, gasValue});
        console.log('Call method on contract', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Call method on contract', 'ERROR', {e});
        res.status(500).send({error : e.toString()});
    }
})
// File Service
app.post('/api/v1/file/create',  async (req, res) => {
    res.send({fileID: await fileService.createFile(req.query.text)});
});
app.post('/api/v1/file/append',  async (req, res) => {
    res.send({result: await fileService.appendFile(req.query.text,req.query.fileID)});
});
app.post('/api/v1/file/getcontent',  async (req, res) => {
    res.send({result: await fileService.getContent(req.query.fileID)});
});
app.post('/api/v1/file/getinfo',  async (req, res) => {
    res.send({result: await fileService.getInfo(req.query.fileID)});
});

app.post('/api/v1/contract/addBytecode', async (req, res) => {
    console.log('Add the Bytecode File to Hedera (and Create a Token!)');
    const bytecode = req.body.bytecode;
    try {
        const tokenInfo = await fileService.addBytecodeFileToHedera({bytecode});
        console.log('Token Info:', 'SUCCESS', tokenInfo);
        res.status(200).send(tokenInfo);
    } catch (e) {
        console.log('Create Token Info:', 'ERROR', {e});
        res.status(500).send(e.toString());
    }
})
