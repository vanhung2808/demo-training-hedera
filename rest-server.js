const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const acc = require('./src/endpoint/AccountService.js');
const HCSService = require('./src/endpoint/HCSService.js');
const FileService = require('./src/endpoint/FileService.js');
const hcsService = new HCSService();
const fileService = new FileService();

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