import { google } from "googleapis";
import { getDynamoDbData } from "./dynamoDbDatasource.js";

/**
 * Function to obtain Gmail login data from DynamoDB.
 * @returns {Promise<Object>}
 */

const getGmailCredentials = async () => {
  const tableName = "Config";
  const configKey = "current";

  const data = await getDynamoDbData(tableName, configKey);
  console.log("Retrieved data from DynamoDB:", data);

  const { GMAIL_ACCESS_KEY, GMAIL_SECRET_KEY, GMAIL_REFRESH_TOKEN } =
    data.Gmail;

  if (!GMAIL_ACCESS_KEY || !GMAIL_SECRET_KEY || !GMAIL_REFRESH_TOKEN) {
    throw new Error("No clientId or clientSecret in the Gmail configuration.");
  }

  return {
    clientId: GMAIL_ACCESS_KEY,
    clientSecret: GMAIL_SECRET_KEY,
    refreshToken: GMAIL_REFRESH_TOKEN,
  };
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

  await oauth2Client.getAccessToken();

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  //TODO: 1) czy tylko maja byc brane pod uwage nieprzeczytane wiadomosci.
  //      2) ustawienie dynamiecznego pobierania wiadomości z zakresu ostatniego tygodnia.
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "in:anywhere is:unread after:2025/04/25 before:2025/05/02",
  });

  const messages = res.data.messages || [];

  const promises = messages.map(async (message) => {
    const res = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });

    const headers = res.data.payload.headers || [];
    // TODO: zastanowic sie kiedy wiadomosc brac pod uwage - tj. w przypadku braku tytulu oraz tresci wiadomosci (ew. wziac pod folder - "bez kategorii").
    const subject =
      headers.find((header) => header.name === "Subject")?.value ||
      "No subject";
    const sender =
      headers.find((header) => header.name === "From")?.value || "No sender";

    // TODO: w body pojawia sie tresc z '\r\n' - zastanowic sie czy to zostawic
    const contentMessages = res.data.payload.parts[0].body.data || "";

    const dataObject = Buffer.from(contentMessages, "base64").toString("utf-8");

    return { ...message, subject, sender, body: dataObject };
  });

  const messagesWithDetails = await Promise.all(promises);

  return messagesWithDetails;
};

export { getGmailCredentials, authorizeGmail };
