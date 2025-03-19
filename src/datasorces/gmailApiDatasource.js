import { google } from "googleapis";
import getDynamoDbData from "./dynamoDbDatasource";

/**
 * Function to obtain Gmail login data from DynamoDB.
 * @returns {Promise<Object>}
 */
const getGmailCredentials = async () => {
  const tableName = "Config";
  const configKey = "current";

  try {
    const data = await getDynamoDbData(tableName, configKey);

    const { GMAIL_ACCESS_KEY, GMAIL_SECRET_KEY } = data;

    return {
      clientId: GMAIL_ACCESS_KEY,
      clientSecret: GMAIL_SECRET_KEY,
    };
  } catch (err) {
    console.error("Błąd podczas pobierania danych logowania do Gmaila:", err);
    throw err;
  }
};

/**
 * Function for authorisation in the Gmail API.
 * @returns {Promise<Object>}
 */
const authorizeGmail = async () => {
  const { clientId, clientSecret } = await getGmailCredentials();

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  const accessToken = "<YOUR_ACCESS_TOKEN>";
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.gmail({ version: "v1", auth: oauth2Client });
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
    // Change of message label (moving to a new folder)
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
