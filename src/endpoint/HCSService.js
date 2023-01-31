const {TopicCreateTransaction} = require("@hashgraph/sdk");
const BaseHederaService = require('./BaseHederaService.js');

class HCSService extends BaseHederaService {
    async createTopic2() {

        const client = this.getHederaClient();
        //Create a new topic
        let txResponse = await new TopicCreateTransaction().execute(client);

        //Grab the newly generated topic ID
        let receipt = await txResponse.getReceipt(client);
        let topicId = receipt.topicId;
        console.log(`Your topic ID is: ${topicId}`);

        // Wait 5 seconds between consensus topic creation and subscription creation
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return topicId;
    }

}

HCSService.prototype.createTopic = async function () {
    const client = this.getHederaClient();
    //Create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);

    //Grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);

    // Wait 2 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return topicId;
}

module.exports = HCSService;