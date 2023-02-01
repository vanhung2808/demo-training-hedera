const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const acc = require('./src/endpoint/AccountService.js');
const HCSService = require('./src/endpoint/HCSService.js');
const hcsService = new HCSService();

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