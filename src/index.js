import { authorizeGmail } from "./datasources/gmailApiDatasource.js";
import { categoryMessages } from "./datasources/openAI.js";

const run = async () => {
  try {
    const messages = await authorizeGmail();

    if (messages.length > 0) {
      // console.log(`Znaleziono ${messages.length} wiadomości w Gmailu!`);
      // console.log("Wiadomości:", messages);

      for (const message of messages) {
        const category = await categoryMessages(message.body);

        console.log(`Wiadomość: ${message.body}, należy do kategorii: ${category}`);
      }
    } else {
      console.log("Brak nowych wiadomości w Gmailu.");
    }
  } catch (error) {
    console.error("Błąd:", error.message);
  }
};

run();