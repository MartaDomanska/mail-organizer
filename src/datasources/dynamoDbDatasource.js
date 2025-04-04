import AWS from "aws-sdk";
import { awsConfig } from "../config.js";

AWS.config.update({
  region: awsConfig.region,
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
});

const docClient = new AWS.DynamoDB.DocumentClient();

const getDynamoDbData = async (tableName, primaryKey) => {
  const params = {
    TableName: tableName,
    Key: {
      ConfigKey: primaryKey,
    },
  };

  console.info(params);

  try {
    const data = await docClient.get(params).promise();
    if (!data.Item) {
      throw new Error(`No data found for ${primaryKey}`);
    }
    console.info(data.Item);
    return data.Item;
  } catch (err) {
    console.error("Error while retrieving data from DynamoDB:", err);
    throw err;
  }
};

const getGmailTokens = async () => {
  try {
    const configData = await getDynamoDbData("Config", "current");
    if (!configData.Gmail) {
      throw new Error("No Gmail configuration in the base.");
    }
    return configData.Gmail;
  } catch (error) {
    console.error("Error when downloading Gmail tokens:", error);
    throw error;
  }
};

export { getDynamoDbData, getGmailTokens };
