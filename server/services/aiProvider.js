import OpenAI from "openai";

/**
 * Simple wrapper around OpenAI's Chat Completion endpoint.
 * Uses the model specified in the environment (default: gpt-4o-mini).
 * The function expects a prompt string and an array of citation objects
 *   { title, snippet, fileUrl }
 */
export async function queryLLM({ prompt, citations }) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // Base URL can be overridden for Azure OpenAI if needed.
  });

  const systemPrompt = `You are an academic assistant. Use ONLY the information supplied in the citations. Do NOT hallucinate facts. Cite each source as a footnote like [^1] and list the citations at the end of the answer.`;

  const citationText = citations
    .map((c, i) => `[${i + 1}] ${c.title} – ${c.snippet}`)
    .join("\n");

  const userMessage = `${prompt}\n\nRelevant citations:\n${citationText}`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.2,
    max_tokens: 1024,
  });

  return response.choices[0].message.content.trim();
}
