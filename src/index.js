import insertData from "./datasources/dynamoDbDatasource";
import getOpenAiCredentials from "./datasources/openaiDatasource";
import getGmailCredentials from "./datasources/gmailApiDatasource";
import AWS from "aws-sdk";

AWS.config.update({
  region: "eu-central-1",
});

const run = async () => {
  try {
    const openAiCredentials = await getOpenAiCredentials();
    const gmailCredentials = await getGmailCredentials();

    console.log("Dane OpenAI:", openAiCredentials);
    console.log("Dane Gmail:", gmailCredentials);

    const params = {
      TableName: "Config",
      Item: {
        current: "1",
        OpenAi: openAiCredentials,
        Gmail: gmailCredentials,
      },
    };

    const data = await insertData(params);
    console.log("Dane zostały wstawione:", data);
  } catch (error) {
    console.error("Błąd:", error);
  }
};

run();
