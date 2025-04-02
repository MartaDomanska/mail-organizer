import { google } from "googleapis";
import { getDynamoDbData } from "./dynamoDbDatasource.js";

/**
 * Function to obtain Gmail login data from DynamoDB.
 * @returns {Promise<Object>}
 */

const getGmailCredentials = async () => {
  const tableName = "Config";
  const configKey = "current";

  try {
    const data = await getDynamoDbData(tableName, configKey);
    console.log("Pobrane dane z DynamoDB:", data);

    const { GMAIL_ACCESS_TOKEN, GMAIL_REFRESH_TOKEN } = data.Gmail;

    if (!GMAIL_ACCESS_TOKEN || !GMAIL_REFRESH_TOKEN) {
      throw new Error("Brak tokenów w odpowiedzi z DynamoDB");
    }

    return {
      accessToken: GMAIL_ACCESS_TOKEN,
      refreshToken: GMAIL_REFRESH_TOKEN,
    };
  } catch (err) {
    console.error("Błąd podczas pobierania danych logowania do Gmaila:", err);
    throw err;
  }
};

/**
 * Function for authorization in the Gmail API.
 * @returns {Promise<Object>}
 */
const authorizeGmail = async () => {
  const { clientId, clientSecret, accessToken, refreshToken } =
    await getGmailCredentials();

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);

  // Set access and refresh token
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Handle token refresh
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      console.log("New access token:", tokens.access_token);

      // Save new access token to DynamoDB
      await updateDynamoDbData("Config", "current", {
        GMAIL_ACCESS_TOKEN: tokens.access_token,
      });
    }

    if (tokens.refresh_token) {
      console.log("New refresh token:", tokens.refresh_token);

      // Save new refresh token to DynamoDB if it changed
      await updateDynamoDbData("Config", "current", {
        GMAIL_REFRESH_TOKEN: tokens.refresh_token,
      });
    }
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
};

/**
 * Function to update DynamoDB with new data (e.g., access token).
 * @param {string} tableName
 * @param {string} configKey
 * @param {Object} data
 * @returns {Promise<void>}
 */
const updateDynamoDbData = async (tableName, configKey, data) => {
  try {
    // Implement the function to update DynamoDB with new token values
    // Example (pseudo code):
    await updateItemInDynamoDb(tableName, configKey, data);
    console.log("DynamoDB updated successfully.");
  } catch (err) {
    console.error("Error updating DynamoDB:", err);
    throw err;
  }
};

/**
 * Function to download messages from Gmail.
 * @param {string} label
 * @returns {Promise<Array>}
 */
const getMessagesFromGmail = async (label = "INBOX") => {
  const gmail = await authorizeGmail();

  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      labelIds: [label],
    });

    return res.data.messages || [];
  } catch (err) {
    console.error("Błąd podczas pobierania wiadomości:", err);
    throw err;
  }
};

/**
 * Function to move messages to another folder by changing the label.
 * @param {string} messageId
 * @param {string} newLabelId
 * @returns {Promise<void>}
 */
const moveMessageToFolder = async (messageId, newLabelId) => {
  const gmail = await authorizeGmail();

  try {
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      resource: {
        addLabelIds: [newLabelId],
      },
    });

    console.log(
      `Wiadomość ${messageId} została przeniesiona do folderu ${newLabelId}`
    );
  } catch (err) {
    console.error("Błąd podczas przenoszenia wiadomości:", err);
    throw err;
  }
};

/**
 * Function to retrieve available labels (folders) from your Gmail account.
 * @returns {Promise<Array>}
 */
const getLabels = async () => {
  const gmail = await authorizeGmail();

  try {
    const res = await gmail.users.labels.list({
      userId: "me",
    });

    return res.data.labels || [];
  } catch (err) {
    console.error("Błąd podczas pobierania etykiet:", err);
    throw err;
  }
};

export {
  getGmailCredentials,
  getMessagesFromGmail,
  moveMessageToFolder,
  getLabels,
};
