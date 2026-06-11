import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rows = db.prepare("SELECT * FROM vocab ORDER BY created_at DESC, id DESC").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];
  const insert = db.prepare(
    "INSERT INTO vocab (word, definition, translation, example) VALUES (@word, @definition, @translation, @example)",
  );
  const insertMany = db.transaction((rows: typeof items) => {
    for (const r of rows) {
      if (!r.word?.trim()) continue;
      insert.run({
        word: r.word.trim(),
        definition: r.definition ?? "",
        translation: r.translation ?? "",
        example: r.example ?? "",
      });
    }
  });
  insertMany(items);
  return NextResponse.json({ ok: true, count: items.length });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  db.prepare("DELETE FROM vocab WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
