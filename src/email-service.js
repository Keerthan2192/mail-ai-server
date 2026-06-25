import OpenAI from "openai";
import { z } from "zod";
import { config } from "./config.js";

const aiEmailSchema = z.object({
  subject: z.string().min(3),
  body: z.string().min(20),
});

function getClient() {
  if (!config.openaiApiKey) {
    throw new Error("Missing OPENAI_API_KEY in backend environment configuration.");
  }

  return new OpenAI({
    apiKey: config.openaiApiKey,
    baseURL: config.openaiBaseUrl,
  });
}

function buildMessages(prompt, tone) {
  return [
    {
      role: "system",
      content:
        "You are an expert executive communications assistant. Write concise, polished, human-sounding emails. Return valid JSON with exactly two keys: subject and body. Do not return markdown.",
    },
    {
      role: "user",
      content: [
        `Tone: ${tone}`,
        `Email request: ${prompt}`,
        "Include a clear subject line, a natural greeting, concise paragraphs, and a sign-off.",
      ].join("\n"),
    },
  ];
}

export async function generateEmail(prompt, tone) {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: config.openaiModel,
    temperature: 0.8,
    max_tokens: 700,
    response_format: { type: "json_object" },
    messages: buildMessages(prompt, tone),
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("The AI provider returned an empty response.");
  }

  const parsed = aiEmailSchema.parse(JSON.parse(content));

  return {
    ...parsed,
    model: completion.model,
  };
}
