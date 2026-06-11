"use client";

import { useState } from "react";

interface VocabItem {
  word: string;
  definition: string;
  translation: string;
  example: string;
}
interface ErrorItem {
  original: string;
  corrected: string;
  explanation: string;
}

export default function ExtractPanel({ getText }: { getText: () => string }) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [vocab, setVocab] = useState<(VocabItem & { checked: boolean })[]>([]);
  const [errs, setErrs] = useState<(ErrorItem & { checked: boolean })[]>([]);

  async function extract() {
    const text = getText();
    setSaved("");
    setError("");
    if (!text.trim()) {
      setError("筆記是空的，先在左邊寫點東西吧！");
      return;
    }
    setBusy(true);
    setVocab([]);
    setErrs([]);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setVocab(data.vocabulary.map((v: VocabItem) => ({ ...v, checked: true })));
      setErrs(data.errors.map((e: ErrorItem) => ({ ...e, checked: true })));
      if (data.vocabulary.length === 0 && data.errors.length === 0) {
        setError("沒有找到可以整理的單字或錯誤。");
      }
    } catch (err) {
      setError(`整理失敗：${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const pickedVocab = vocab.filter((v) => v.checked);
    const pickedErrs = errs.filter((e) => e.checked);
    setBusy(true);
    try {
      if (pickedVocab.length)
        await fetch("/api/vocab", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pickedVocab),
        });
      if (pickedErrs.length)
        await fetch("/api/errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pickedErrs),
        });
      setSaved(`已存入 ${pickedVocab.length} 個單字、${pickedErrs.length} 筆錯誤 ✅`);
      setVocab([]);
      setErrs([]);
    } catch (err) {
      setError(`儲存失敗：${err instanceof Error ? err.message : err}`);
    } finally {
      setBusy(false);
    }
  }

  const hasResults = vocab.length > 0 || errs.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-zinc-100 p-3">
        <p className="text-xs text-zinc-500">
          下課前按一下，AI 會從左邊的筆記自動整理出新單字和被糾正的句子，存進單字本與錯題本。
        </p>
        <button
          onClick={extract}
          disabled={busy}
          className="w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? "AI 整理中…" : "✨ 用 AI 整理這堂課的筆記"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {saved && <p className="text-xs text-green-600">{saved}</p>}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {vocab.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold text-zinc-500">單字（{vocab.length}）</h3>
            <ul className="space-y-2">
              {vocab.map((v, i) => (
                <li key={i} className="flex gap-2 rounded-lg border border-zinc-200 p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={v.checked}
                    onChange={() =>
                      setVocab(vocab.map((x, j) => (j === i ? { ...x, checked: !x.checked } : x)))
                    }
                    className="mt-1"
                  />
                  <div>
                    <p>
                      <span className="font-semibold">{v.word}</span>
                      <span className="ml-2 text-zinc-500">{v.translation}</span>
                    </p>
                    <p className="text-xs text-zinc-500">{v.definition}</p>
                    <p className="text-xs italic text-zinc-400">{v.example}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {errs.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold text-zinc-500">錯題（{errs.length}）</h3>
            <ul className="space-y-2">
              {errs.map((e, i) => (
                <li key={i} className="flex gap-2 rounded-lg border border-zinc-200 p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={e.checked}
                    onChange={() =>
                      setErrs(errs.map((x, j) => (j === i ? { ...x, checked: !x.checked } : x)))
                    }
                    className="mt-1"
                  />
                  <div>
                    <p className="text-red-600 line-through">{e.original}</p>
                    <p className="text-green-700">{e.corrected}</p>
                    <p className="text-xs text-zinc-500">{e.explanation}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {hasResults && (
        <div className="border-t border-zinc-100 p-3">
          <button
            onClick={save}
            disabled={busy}
            className="w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            儲存勾選的項目
          </button>
        </div>
      )}
    </div>
  );
}
