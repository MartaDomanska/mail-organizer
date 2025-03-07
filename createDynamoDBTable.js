import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();  

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const docClient = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: "Config",
  Item: {
    current: "1",
    OpenAi: {
      accessKey: process.env.OPENAI_ACCESS_KEY,  
      secretKey: process.env.OPENAI_SECRET_KEY,  
    },
    Gmail: {
      accessKey: process.env.GMAIL_ACCESS_KEY,  
      secretKey: process.env.GMAIL_SECRET_KEY,  
    },
  },
};

docClient.put(params, (err, data) => {
  if (err) {
    console.log("Błąd wstawiania danych:", err);
  } else {
    console.log("Dane zostały wstawione:", data);
  }
});
