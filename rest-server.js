const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require('body-parser');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const acc = require('./src/endpoint/AccountService.js');
const contractService = require('./src/endpoint/ContractService');

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
    res.end(JSON.stringify(await acc.createAccount(req.params.initialBalance), null, 3));
});

app.post('/api/v1/contract', async (req, res) => {
    const bytecode = req.body.bytecode;
    try {
        const data = await contractService.createContract({bytecode});
        console.log('Create contract', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Create contract', 'ERROR', {e});
        res.status(500).send({e});
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
        res.status(500).send({e});
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
        res.status(500).send({e});
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
        res.status(500).send({e});
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
        res.status(500).send({e});
    }
})

app.post('/api/v1/contract/execute-transaction', async (req, res) => {
    const contractId = req.body.contractId;
    const functionName = req.body.functionName;
    const argument = req.body.argument;
    const gasValue = req.body.gasValue;

    try {
        const data = await contractService.executeTransactionOnContract({contractId, functionName, argument, gasValue});
        console.log('Execute transaction on contract', 'SUCCESS', data);
        res.status(200).send(data)
    } catch (e) {
        console.log('Execute transaction on contract', 'ERROR', {e});
        res.status(500).send({e});
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
        res.status(500).send({e});
    }
})