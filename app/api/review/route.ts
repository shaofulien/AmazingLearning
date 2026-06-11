import { db } from "@/lib/db";
import { nextReview, toSqlite, type Grade, type SrsState } from "@/lib/srs";
import { NextRequest, NextResponse } from "next/server";

// GET: all cards due now (vocab + errors), oldest due first
export async function GET() {
  const vocab = db
    .prepare("SELECT *, 'vocab' AS card_type FROM vocab WHERE due_at <= datetime('now')")
    .all();
  const errors = db
    .prepare("SELECT *, 'error' AS card_type FROM errors WHERE due_at <= datetime('now')")
    .all();
  const cards = [...vocab, ...errors].sort((a, b) =>
    String((a as { due_at: string }).due_at).localeCompare(String((b as { due_at: string }).due_at)),
  );
  return NextResponse.json(cards);
}

// POST: grade one card { card_type, id, grade }
export async function POST(req: NextRequest) {
  const { card_type, id, grade } = (await req.json()) as {
    card_type: "vocab" | "error";
    id: number;
    grade: Grade;
  };
  const table = card_type === "vocab" ? "vocab" : "errors";
  const row = db.prepare(`SELECT ease, interval_days, reps FROM ${table} WHERE id = ?`).get(id) as
    | SrsState
    | undefined;
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });

  const next = nextReview(row, grade);
  db.prepare(
    `UPDATE ${table} SET ease = ?, interval_days = ?, reps = ?, due_at = ? WHERE id = ?`,
  ).run(next.ease, next.interval_days, next.reps, toSqlite(next.due_at), id);

  return NextResponse.json({ ok: true, next_due: toSqlite(next.due_at), interval_days: next.interval_days });
}
