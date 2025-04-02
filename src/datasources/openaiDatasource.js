import AWS from "aws-sdk";
import axios from "axios";

const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * Function to retrieve OpenAI credentials from DynamoDB.
 * @returns {Promise<Object>}
 */
const getOpenAiCredentials = async () => {
  const tableName = "Config";
  const configKey = "current";

  try {
    const params = {
      TableName: tableName,
      Key: {
        ConfigKey: configKey,
      },
    };

    const data = await docClient.get(params).promise();

    if (!data.Item) {
      throw new Error("No data found for 'current' key in DynamoDB");
    }

    const { OPENAI_ACCESS_KEY } = data.Item;

    return {
      accessKey: OPENAI_ACCESS_KEY,
    };
  } catch (err) {
    console.error("Error retrieving data from DynamoDB:", err);
    throw err;
  }
};

/**
 * Function to send a message to OpenAI for processing.
 * @param {string} message
 * @returns {Promise<Object>}
 */
const sendMessageToOpenAi = async (message) => {
  const { accessKey } = await getOpenAiCredentials();

  const openAiApiUrl = "https://api.openai.com/v1/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessKey}`,
  };

  const payload = {
    model: "text-davinci-003",
    prompt: message,
    max_tokens: 150,
    temperature: 0.7,
  };

  try {
    const response = await axios.post(openAiApiUrl, payload, { headers });

    const responseText = response.data.choices[0].text.trim();

    const score = response.data.choices[0].logprobs
      ? response.data.choices[0].logprobs.token_logprobs[0]
      : null;

    return {
      message: responseText,
      score: score,
    };
  } catch (err) {
    console.error("Error during communication with OpenAI:", err);
    throw err;
  }
};

/**
 * Function to rate a message by sending it to OpenAI and getting a response.
 * @param {string} message
 * @returns {Promise<Object>}
 */
const rateMessage = async (message) => {
  try {
    const openAiResponse = await sendMessageToOpenAi(message);

    return openAiResponse;
  } catch (err) {
    console.error("Error while rating the message:", err);
    throw err;
  }
};

export { getOpenAiCredentials, sendMessageToOpenAi, rateMessage };
