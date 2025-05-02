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

  const data = await docClient.get(params).promise();
  if (!data.Item) {
    throw new Error(`No data found for ${primaryKey}`);
  }
  return data.Item;
};

export { getDynamoDbData };
