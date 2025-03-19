import AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * Function to retrieve data from DynamoDB based on table name and primary key.
 * @param {string} tableName
 * @param {string} primaryKey
 * @returns {Promise<Object>}
 */
const getDynamoDbData = async (tableName, primaryKey) => {
  const params = {
    TableName: tableName,
    Key: {
      ConfigKey: primaryKey,
    },
  };

  try {
    const data = await docClient.get(params).promise();
    if (!data.Item) {
      throw new Error(`No data found for ${primaryKey}`);
    }
    return data.Item;
  } catch (err) {
    console.error("Error while retrieving data from DynamoDB:", err);
    throw err;
  }
};

export default getDynamoDbData;
