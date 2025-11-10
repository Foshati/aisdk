import { streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model, webSearch } = await req.json();

  const systemPrompt = webSearch
    ? "You are a helpful assistant that can answer questions, analyze images, and help with tasks. When web search is enabled, provide comprehensive and up-to-date information."
    : "You are a helpful assistant that can answer questions, analyze images, and help with tasks.";

  const result = streamText({
    model: deepseek(model || "deepseek-chat"),
    messages: messages || [],
    system: systemPrompt,
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}