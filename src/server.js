import cors from "cors";
import express from "express";
import OpenAI from "openai";
import { z } from "zod";
import { config } from "./config.js";
import { getDb } from "./db.js";
import { generateEmail } from "./email-service.js";

const app = express();

const requestSchema = z.object({
  prompt: z.string().trim().min(8, "Please provide a more specific prompt."),
  tone: z.enum(["Professional", "Friendly", "Formal", "Casual"]),
});

app.use(
  cors({
    origin: config.frontendOrigin,
  }),
);
app.use(express.json());

app.get("/health", (_, response) => {
  response.json({ status: "ok" });
});

app.get("/api/v1/emails/history", async (_, response) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      `
        SELECT id, prompt, tone, subject, body, model, created_at
        FROM email_generations
        ORDER BY created_at DESC, id DESC
        LIMIT 10
      `,
    );

    response.json(
      rows.map((row) => ({
        id: row.id,
        prompt: row.prompt,
        tone: row.tone,
        subject: row.subject,
        body: row.body,
        model: row.model,
        generatedAt: row.created_at,
      })),
    );
  } catch {
    response.status(500).json({
      error: "Unable to load email history right now.",
    });
  }
});

app.post("/api/v1/emails/generate", async (request, response) => {
  try {
    const { prompt, tone } = requestSchema.parse(request.body);
    const email = await generateEmail(prompt, tone);

    const db = await getDb();
    const [result] = await db.execute(
      `
        INSERT INTO email_generations (prompt, tone, subject, body, model)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        prompt,
        tone,
        email.subject,
        email.body,
        email.model,
      ],
    );

    const [savedRows] = await db.execute(
      `
        SELECT id, prompt, tone, subject, body, model, created_at
        FROM email_generations
        WHERE id = ?
      `,
      [result.insertId],
    );

    const savedRow = savedRows[0];

    response.json({
      id: savedRow.id,
      prompt: savedRow.prompt,
      tone: savedRow.tone,
      subject: savedRow.subject,
      body: savedRow.body,
      model: savedRow.model,
      generatedAt: savedRow.created_at,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).json({
        error: error.issues[0]?.message ?? "Invalid request.",
      });
      return;
    }

    if (error instanceof OpenAI.APIError) {
      let message = "The AI provider could not complete the request right now.";

      if (error.status === 401) {
        message = "Authentication failed. Check your backend API key.";
      } else if (error.status === 402) {
        message =
          "The AI provider rejected the request due to account credit or token limits.";
      } else if (error.status === 429) {
        message = "Rate limit reached. Please try again shortly.";
      }

      response.status(error.status || 502).json({ error: message });
      return;
    }

    response.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Unexpected server error while generating the email.",
    });
  }
});

app.delete("/api/v1/emails/history", async (_, response) => {
  try {
    const db = await getDb();
    await db.execute("DELETE FROM email_generations");
    response.json({ success: true });
  } catch {
    response.status(500).json({
      error: "Unable to clear email history right now.",
    });
  }
});

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
  console.log(
    `MySQL database: ${config.dbName} on ${config.dbHost}:${config.dbPort}`,
  );
});


//pm2 start npm --name "ai-mailer-server" -- start
