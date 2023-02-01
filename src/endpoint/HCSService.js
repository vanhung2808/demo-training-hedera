const {TopicCreateTransaction, TopicInfoQuery, TopicMessageSubmitTransaction} = require("@hashgraph/sdk");
const BaseHederaService = require('./BaseHederaService.js');

class HCSService extends BaseHederaService {
    async getTopicInfo(topicId) {

        const client = this.getHederaClient();
        //Create the account info query
        const query = new TopicInfoQuery()
            .setTopicId(topicId);

        //Submit the query to a Hedera network
        const info = await query.execute(client);

        //Print the account key to the console
        console.log(info);
        return info;
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
HCSService.prototype.submitMessage = async function (topicId, message) {
    //Create the transaction
    const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message);
    //Get the transaction message
    return transaction.getMessage();
}

module.exports = HCSService;