import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rows = db.prepare("SELECT * FROM errors ORDER BY created_at DESC, id DESC").all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];
  const insert = db.prepare(
    "INSERT INTO errors (original, corrected, explanation) VALUES (@original, @corrected, @explanation)",
  );
  const insertMany = db.transaction((rows: typeof items) => {
    for (const r of rows) {
      if (!r.original?.trim() || !r.corrected?.trim()) continue;
      insert.run({
        original: r.original.trim(),
        corrected: r.corrected.trim(),
        explanation: r.explanation ?? "",
      });
    }
  });
  insertMany(items);
  return NextResponse.json({ ok: true, count: items.length });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  db.prepare("DELETE FROM errors WHERE id = ?").run(id);
  return NextResponse.json({ ok: true });
}
