import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  const dueCount =
    (db.prepare("SELECT COUNT(*) AS c FROM vocab WHERE due_at <= datetime('now')").get() as { c: number }).c +
    (db.prepare("SELECT COUNT(*) AS c FROM errors WHERE due_at <= datetime('now')").get() as { c: number }).c;
  const vocabCount = (db.prepare("SELECT COUNT(*) AS c FROM vocab").get() as { c: number }).c;
  const errorCount = (db.prepare("SELECT COUNT(*) AS c FROM errors").get() as { c: number }).c;

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-bold">歡迎回來 👋</h1>
      <p className="mt-1 text-zinc-500">線上英語課的學習助手：上課共筆、AI 整理、間隔複習。</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/review"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow"
        >
          <p className="text-3xl font-bold text-amber-600">{dueCount}</p>
          <p className="mt-1 text-sm text-zinc-500">今天要複習的卡片</p>
        </Link>
        <Link
          href="/vocabulary"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow"
        >
          <p className="text-3xl font-bold text-sky-600">{vocabCount}</p>
          <p className="mt-1 text-sm text-zinc-500">單字本累積單字</p>
        </Link>
        <Link
          href="/vocabulary?tab=errors"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow"
        >
          <p className="text-3xl font-bold text-rose-500">{errorCount}</p>
          <p className="mt-1 text-sm text-zinc-500">錯題本累積筆數</p>
        </Link>
      </div>

      <div className="mt-8 rounded-xl border border-sky-200 bg-sky-50 p-5">
        <h2 className="font-semibold text-sky-900">要上課了嗎？</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-sky-900/80">
          <li>打開 Zoom 跟老師視訊</li>
          <li>進入「上課中」頁面，把網址（含房間名稱）傳給老師，兩人就能即時共同編輯筆記</li>
          <li>有問題隨時問右側的 AI 小幫手</li>
          <li>下課前按「✨ 用 AI 整理」，自動把新單字和被糾正的句子存起來</li>
        </ol>
        <Link
          href="/lesson"
          className="mt-4 inline-block rounded-lg bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          開始上課 →
        </Link>
      </div>
    </div>
  );
}
