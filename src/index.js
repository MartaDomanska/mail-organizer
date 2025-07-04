import { getMessages, getLabels, moveMessageToLabel } from "./datasources/gmailApiDatasource.js";
import { categoryMessages } from "./datasources/openAI.js";

const run = async () => {
  try {
    const messages = await getMessages();

    if (messages.length === 0) {
      console.log("Brak nowych wiadomości w Gmailu.");
      return;
    }

    const labels = await getLabels();
    console.log("Dostępne etykiety:", labels.map((label) => `${label.name} => ${label.id}`)
    );

    const promises = messages.map(async (message) => {
      try {
        const category = await categoryMessages(message.body);

        console.log(`Wiadomość ${message.id} zaklasyfikowana jako: ${category}`);

        const label = labels.find(
          (l) => l.name.toLowerCase() === category.toLowerCase()
        );

        if (label) {
          await moveMessageToLabel(message.id, label.id);
          console.log(`Przeniesiono wiadomość do labela "${label.name}"`);
        } else {
          console.warn(`Brak labela dla kategorii: ${category}`);
          const fallbackLabel = labels.find((label) => label.name === "inne");
          if (fallbackLabel) {
            await moveMessageToLabel(message.id, fallbackLabel.id);
            console.log(`Przeniesiono wiadomość do labela "inne"`);
          }
        }
      } catch (err) {
        console.error(`Błąd przy obsłudze wiadomości ${message.id}:`, err);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Błąd główny:", error);
  }
};

run();
