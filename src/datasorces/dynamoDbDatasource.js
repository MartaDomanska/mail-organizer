import AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();

const insertData = async (params) => {
  try {
    const data = await docClient.put(params).promise();
    return "Dane zostały wstawione:" + data;
  } catch (err) {
    throw new Error("Błąd wstawiania danych: " + err.message);
  }
};

export default insertData;