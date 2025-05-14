import OpenAI from "openai";
import { openAiConfig } from "../config.js";

const openai = new OpenAI({
  apiKey: openAiConfig.apiKey,
});

export const categoryMessages = async (emailText) => {
  const prompt = `Skategoryzuj wiadomość ${emailText} do jednej z kategorii: Praca, Rodzina, Inne. Zwróć tylko jedną z tych trzech kategorii.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

  const category = response.choices[0].message.content.trim();
  console.log(category);
  return category;
};

export default openai;
