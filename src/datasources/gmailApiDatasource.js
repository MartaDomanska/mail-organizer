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
    console.log("Retrieved data from DynamoDB:", data);

    const { GMAIL_ACCESS_KEY, GMAIL_SECRET_KEY, GMAIL_REFRESH_TOKEN } =
      data.Gmail;

    if (!GMAIL_ACCESS_KEY || !GMAIL_SECRET_KEY || !GMAIL_REFRESH_TOKEN) {
      throw new Error(
        "No clientId or clientSecret in the Gmail configuration."
      );
    }

    return {
      clientId: GMAIL_ACCESS_KEY,
      clientSecret: GMAIL_SECRET_KEY,
      refreshToken: GMAIL_REFRESH_TOKEN,
    };
  } catch (err) {
    console.error("Error when downloading Gmail login details:", err);
    throw err;
  }
};

/**
 * Function for authorization in the Gmail API.
 * @returns {Promise<Object>}
 */
const authorizeGmail = async () => {
  const { clientId, clientSecret, refreshToken } = await getGmailCredentials();

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  try {
    await oauth2Client.getAccessToken();

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const res = await gmail.users.messages.list({
      userId: "me",
      q: "in:anywhere is:unread",
      // maxResults: 10,
    });

    const messages = res.data.messages || [];

    /**
     * Get the subject of the message
     * @param {Object} message
     * @returns {Object}
     */

    const messagesWithSubject = await Promise.all(
      messages.map(async (message) => {
        const res = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });

        const headers = res.data.payload.headers || [];
        const subject =
          headers.find((header) => header.name === "Subject")?.value ||
          "No subject";

        return { ...message, subject };
      })
    );

    return messagesWithSubject;
  } catch (err) {
    console.error("Failed to authorize Gmail API:", err);
    throw err;
  }
};

export { getGmailCredentials, authorizeGmail };
