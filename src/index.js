import { authorizeGmail } from "./datasources/gmailApiDatasource.js";
import { askQuestion } from "./datasources/openAI.js";

const run = async () => {
  try {
    await askQuestion();

    const messages = await authorizeGmail();

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
