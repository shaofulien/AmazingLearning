"use client";

import { useCallback, useEffect, useState } from "react";

interface Card {
  card_type: "vocab" | "error";
  id: number;
  // vocab
  word?: string;
  definition?: string;
  translation?: string;
  example?: string;
  // error
  original?: string;
  corrected?: string;
  explanation?: string;
}

const GRADES = [
  { key: "again", label: "重來", hint: "10 分鐘後", cls: "bg-red-500" },
  { key: "hard", label: "困難", hint: "間隔 ×1.2", cls: "bg-amber-500" },
  { key: "good", label: "記得", hint: "正常間隔", cls: "bg-green-600" },
  { key: "easy", label: "簡單", hint: "間隔加長", cls: "bg-sky-600" },
] as const;

export default function ReviewPage() {
  const [queue, setQueue] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const cards = await fetch("/api/review").then((r) => r.json());
    setQueue(cards);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Fetch the due cards once on mount; all setState happens after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const card = queue[0];

  async function grade(g: (typeof GRADES)[number]["key"]) {
    if (!card) return;
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ card_type: card.card_type, id: card.id, grade: g }),
    });
    setFlipped(false);
    setDone((d) => d + 1);
    setQueue((q) => q.slice(1));
  }

  if (loading) {
    return <p className="mt-16 text-center text-zinc-400">載入中…</p>;
  }

  if (!card) {
    return (
      <div className="mx-auto mt-16 max-w-md text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-4 text-xl font-bold">今天的複習完成了！</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {done > 0 ? `這次複習了 ${done} 張卡片。` : "目前沒有到期的卡片。"}
          記憶會依照你的回饋自動安排下次複習時間。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <p className="mb-3 text-center text-xs text-zinc-400">
        剩餘 {queue.length} 張 · 已完成 {done} 張
      </p>

      <div
        onClick={() => setFlipped(true)}
        className="min-h-[260px] cursor-pointer rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
      >
        {card.card_type === "vocab" ? (
          <>
            <p className="text-xs text-zinc-400">這個單字是什麼意思？</p>
            <p className="mt-6 text-3xl font-bold">{card.word}</p>
            {flipped && (
              <div className="mt-6 border-t border-zinc-100 pt-5 text-left">
                <p className="text-lg font-medium text-sky-700">{card.translation}</p>
                {card.definition && <p className="mt-1 text-sm text-zinc-600">{card.definition}</p>}
                {card.example && <p className="mt-2 text-sm italic text-zinc-400">{card.example}</p>}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-zinc-400">這句哪裡有問題？正確說法是？</p>
            <p className="mt-6 text-xl font-semibold">{card.original}</p>
            {flipped && (
              <div className="mt-6 border-t border-zinc-100 pt-5 text-left">
                <p className="text-lg font-medium text-green-700">{card.corrected}</p>
                {card.explanation && (
                  <p className="mt-1 text-sm text-zinc-600">{card.explanation}</p>
                )}
              </div>
            )}
          </>
        )}
        {!flipped && <p className="mt-8 text-xs text-zinc-300">點一下看答案</p>}
      </div>

      {flipped && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.key}
              onClick={() => grade(g.key)}
              className={`rounded-xl py-3 text-white ${g.cls}`}
            >
              <span className="block text-sm font-semibold">{g.label}</span>
              <span className="block text-[10px] opacity-80">{g.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
