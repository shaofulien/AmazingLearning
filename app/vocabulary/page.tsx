"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface VocabRow {
  id: number;
  word: string;
  definition: string;
  translation: string;
  example: string;
  created_at: string;
  due_at: string;
}
interface ErrorRow {
  id: number;
  original: string;
  corrected: string;
  explanation: string;
  created_at: string;
  due_at: string;
}

function VocabularyInner() {
  const params = useSearchParams();
  const [tab, setTab] = useState<"vocab" | "errors">(
    params.get("tab") === "errors" ? "errors" : "vocab",
  );
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [form, setForm] = useState({ word: "", translation: "", definition: "", example: "" });

  const load = useCallback(async () => {
    const [v, e] = await Promise.all([
      fetch("/api/vocab").then((r) => r.json()),
      fetch("/api/errors").then((r) => r.json()),
    ]);
    setVocab(v);
    setErrors(e);
  }, []);

  useEffect(() => {
    // Fetch lists once on mount; all setState happens after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function addWord() {
    if (!form.word.trim()) return;
    await fetch("/api/vocab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ word: "", translation: "", definition: "", example: "" });
    load();
  }

  async function remove(kind: "vocab" | "errors", id: number) {
    await fetch(`/api/${kind}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("vocab")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "vocab" ? "bg-sky-600 text-white" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          📖 單字本（{vocab.length}）
        </button>
        <button
          onClick={() => setTab("errors")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "errors" ? "bg-rose-500 text-white" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          📝 錯題本（{errors.length}）
        </button>
      </div>

      {tab === "vocab" && (
        <>
          <div className="mt-4 grid gap-2 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
            <input
              placeholder="單字（必填）"
              value={form.word}
              onChange={(e) => setForm({ ...form, word: e.target.value })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
            />
            <input
              placeholder="中文意思"
              value={form.translation}
              onChange={(e) => setForm({ ...form, translation: e.target.value })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
            />
            <button
              onClick={addWord}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white"
            >
              手動新增
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {vocab.map((v) => (
              <li
                key={v.id}
                className="group flex items-start justify-between rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div>
                  <p>
                    <span className="text-lg font-semibold">{v.word}</span>
                    <span className="ml-3 text-zinc-500">{v.translation}</span>
                  </p>
                  {v.definition && <p className="mt-1 text-sm text-zinc-500">{v.definition}</p>}
                  {v.example && <p className="mt-1 text-sm italic text-zinc-400">{v.example}</p>}
                </div>
                <button
                  onClick={() => remove("vocab", v.id)}
                  className="text-xs text-zinc-300 hover:text-red-500"
                >
                  刪除
                </button>
              </li>
            ))}
            {vocab.length === 0 && (
              <p className="mt-8 text-center text-sm text-zinc-400">
                還沒有單字。上課時用「✨ AI 整理」自動收集，或在上面手動新增。
              </p>
            )}
          </ul>
        </>
      )}

      {tab === "errors" && (
        <ul className="mt-4 space-y-2">
          {errors.map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div>
                <p className="text-red-600 line-through">{e.original}</p>
                <p className="mt-1 font-medium text-green-700">{e.corrected}</p>
                {e.explanation && <p className="mt-1 text-sm text-zinc-500">{e.explanation}</p>}
              </div>
              <button
                onClick={() => remove("errors", e.id)}
                className="text-xs text-zinc-300 hover:text-red-500"
              >
                刪除
              </button>
            </li>
          ))}
          {errors.length === 0 && (
            <p className="mt-8 text-center text-sm text-zinc-400">
              還沒有錯題紀錄。上課被老師糾正的句子，用「✨ AI 整理」就會自動收進來。
            </p>
          )}
        </ul>
      )}
    </div>
  );
}

export default function VocabularyPage() {
  return (
    <Suspense>
      <VocabularyInner />
    </Suspense>
  );
}
