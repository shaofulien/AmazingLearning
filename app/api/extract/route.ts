import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

const ExtractResult = z.object({
  vocabulary: z.array(
    z.object({
      word: z.string().describe("The vocabulary word or phrase, in its base form"),
      definition: z.string().describe("A simple English definition"),
      translation: z.string().describe("Traditional Chinese (zh-TW) translation"),
      example: z.string().describe("A natural example sentence using the word"),
    }),
  ),
  errors: z.array(
    z.object({
      original: z.string().describe("The learner's original sentence containing the mistake"),
      corrected: z.string().describe("The corrected sentence"),
      explanation: z.string().describe("Brief explanation in Traditional Chinese of why it was wrong"),
    }),
  ),
});

const SYSTEM = `You analyze notes from an online English lesson taken by a Taiwanese student (native language: Traditional Chinese). The notes may contain a mix of English and Chinese, new vocabulary the teacher introduced, and sentences the student wrote or said (some with mistakes the teacher corrected).

Extract:
1. vocabulary — words/phrases worth learning. Skip basic words the student clearly already knows. Deduplicate.
2. errors — sentences where a learner mistake is visible or a correction is shown in the notes. If no mistakes are present, return an empty array. Do not invent mistakes.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "尚未設定 ANTHROPIC_API_KEY，請在 .env.local 填入後重新啟動。" },
      { status: 500 },
    );
  }
  const { text } = await req.json();
  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "請提供筆記內容" }, { status: 400 });
  }

  const client = new Anthropic();
  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    messages: [{ role: "user", content: `Lesson notes:\n\n${text}` }],
    output_config: { format: zodOutputFormat(ExtractResult) },
  });

  if (!response.parsed_output) {
    return NextResponse.json({ error: "AI 解析失敗，請再試一次" }, { status: 502 });
  }
  return NextResponse.json(response.parsed_output);
}
