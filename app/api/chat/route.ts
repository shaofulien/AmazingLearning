import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const maxDuration = 300;

const SYSTEM = `You are a friendly English-learning assistant sitting beside a Taiwanese student (native language: Traditional Chinese) during their online English lesson over Zoom. The teacher may also read your answers.

Guidelines:
- Answer questions about vocabulary, grammar, pronunciation, and natural usage.
- Keep answers short and scannable — the student is in the middle of a live class.
- When explaining to the student, use Traditional Chinese with English examples. If the question is clearly from the teacher (written in English), answer in English.
- Always include 1-2 example sentences when explaining a word or pattern.
- If the student writes an English sentence and asks for feedback, point out mistakes gently and give the corrected version.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("⚠️ 尚未設定 ANTHROPIC_API_KEY，請在 .env.local 填入後重新啟動。", {
      status: 500,
    });
  }

  const { messages, context } = (await req.json()) as {
    messages: ChatMessage[];
    context?: string;
  };

  const client = new Anthropic();
  const system = context?.trim()
    ? `${SYSTEM}\n\nCurrent shared lesson notes (for reference):\n${context.slice(0, 8000)}`
    : SYSTEM;

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system,
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        try {
          controller.enqueue(
            encoder.encode(`\n⚠️ ${err instanceof Error ? err.message : "串流發生錯誤"}`),
          );
          controller.close();
        } catch {
          /* stream already closed by the client */
        }
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
