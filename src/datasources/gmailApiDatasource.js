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
      //TODO: czy tylko maja byc brane pod uwage nieprzeczytane wiadomosci
      q: "in:anywhere is:unread",
      // maxResults: 10,
    });

    const messages = res.data.messages || [];

    // const testMessage = await gmail.users.messages.get({
    //   userId: "me",
    //   id: "19670e68c409c491",
    //   format: "full",
    // });

    // const dataObject = Buffer.from(testMessage.data.payload.parts[0].body.data,
    //   "base64").toString("utf-8")

    // console.log("email response", dataObject);

    const promises = messages.map(async (message) => {
      const res = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const headers = res.data.payload.headers || [];

      const subject = headers.find((header) => header.name === "Subject")?.value || "No subject";
      const sender = headers.find((header) => header.name === "From")?.value || "No sender";

      const contentMessages = res.data.payload.parts[0].body.data || "";

      const dataObject = Buffer.from(contentMessages, "base64").toString("utf-8")

      return { ...message, subject, sender, body: dataObject};
    });

    const messagesWithDetails = await Promise.all(promises);

    return messagesWithDetails;
  } catch (err) {
    console.error("Failed to authorize Gmail API:", err);
    throw err;
  }
};

export { getGmailCredentials, authorizeGmail };
