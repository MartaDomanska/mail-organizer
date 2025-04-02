import { openAiCredentials, gmailCredentials } from "./config.js";

import { getDynamoDbData } from "./datasources/dynamoDbDatasource.js";
import { getMessagesFromGmail } from "./datasources/gmailApiDatasource.js";

const run = async () => {
  try {
    const tableName = "Config";
    const primaryKey = "current";

    const configData = await getDynamoDbData(tableName, primaryKey);

    console.log("Pobrane dane z DynamoDB:", configData);

    const openAiCredentialsFromDb = configData.OpenAi || openAiCredentials;
    const gmailCredentialsFromDb = configData.Gmail || gmailCredentials;

    console.log("Dane OpenAI:", openAiCredentialsFromDb);
    console.log("Dane Gmail:", gmailCredentialsFromDb);

    const messages = await getMessagesFromGmail();

    if (messages.length > 0) {
      console.log(`Znaleziono ${messages.length} wiadomości w Gmailu!`);
      console.log("Wiadomości:", messages);
    } else {
      console.log("Brak nowych wiadomości w Gmailu.");
    }
  } catch (error) {
    console.error("Błąd:", error.message);
  }
};

run();
