import { getMessages } from "./datasources/gmailApiDatasource.js";
import { categoryMessages } from "./datasources/openAI.js";

const run = async () => {
  try {
    const messages = await getMessages();

    if (messages.length > 0) {
      // console.log(`Znaleziono ${messages.length} wiadomości w Gmailu!`);
      // console.log("Wiadomości:", messages);

      const promises = [];

      for (const message of messages) {
        const requestPromise = categoryMessages(message.body);

        promises.push(requestPromise);
      }

      const results = await Promise.allSettled(promises);

      for (const result of results) {
        if (result.status === "fulfilled") {
          console.log(result.value);
        } else {
          console.error(result.reason);
        }
      }
    } else {
      console.log("Brak nowych wiadomości w Gmailu.");
    }
  } catch (error) {
    console.error("Błąd:", error.message);
  }
};

run();
