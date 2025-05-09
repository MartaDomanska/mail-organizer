import OpenAI from "openai";
import { openAiConfig } from "../config.js";

const openai = new OpenAI({
  apiKey: openAiConfig.apiKey,
});

export const askQuestion = async () => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Ile jest państw na świecie?" }],
  });
  console.log("Państw na świecie jest:", response.choices[0].message.content);
};

export default openai;
