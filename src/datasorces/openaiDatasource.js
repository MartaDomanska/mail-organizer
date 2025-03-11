import AWS from "aws-sdk";

const secretsManager = new AWS.SecretsManager();

const getOpenAiCredentials = async () => {
  const secretName = "mail-organizer-secrets";

  try {
    const data = await secretsManager
      .getSecretValue({ SecretId: secretName })
      .promise();

    if (!data.SecretString) {
      throw new Error("Brak SecretString w odpowiedzi");
    }

    const secrets = JSON.parse(data.SecretString);
    return {
      accessKey: secrets.OPENAI_ACCESS_KEY,
      secretKey: secrets.OPENAI_SECRET_KEY,
    };
  } catch (err) {
    console.error("Błąd pobierania sekretu:", err);
    throw err;
  }
};

export default getOpenAiCredentials;