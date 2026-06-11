"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Editor } from "@tiptap/react";
import AssistantPanel from "@/components/AssistantPanel";
import ExtractPanel from "@/components/ExtractPanel";

const CollabEditor = dynamic(() => import("@/components/CollabEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm text-zinc-400">
      載入編輯器中…
    </div>
  ),
});

function LessonInner() {
  const params = useSearchParams();
  const room = params.get("room") || "lesson";
  const editorRef = useRef<Editor | null>(null);
  const [tab, setTab] = useState<"assistant" | "extract">("assistant");
  const [userName, setUserName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // localStorage is only available after hydration; the editor mounts once the name is set.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserName(localStorage.getItem("al-username") || "我");
  }, []);

  const getText = useCallback(() => editorRef.current?.getText() ?? "", []);

  function copyShareLink() {
    navigator.clipboard.writeText(location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex h-[calc(100vh-110px)] flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="text-zinc-500">我的名字：</label>
        <input
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
            localStorage.setItem("al-username", e.target.value);
          }}
          className="w-28 rounded-lg border border-zinc-200 bg-white px-2 py-1 focus:border-sky-400 focus:outline-none"
        />
        <button
          onClick={copyShareLink}
          className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1 text-sky-700 hover:bg-sky-100"
        >
          {copied ? "已複製 ✅" : "📋 複製連結給老師"}
        </button>
        <span className="text-xs text-zinc-400">
          老師打開同一個連結就能一起編輯（可用 ?room=任意名稱 換房間）
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[2fr_1fr]">
        {userName !== "" && (
          <CollabEditor
            room={room}
            userName={userName}
            onEditorReady={(e) => (editorRef.current = e)}
          />
        )}

        <div className="flex min-h-0 flex-col rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex border-b border-zinc-100">
            <button
              onClick={() => setTab("assistant")}
              className={`flex-1 py-2 text-sm font-medium ${
                tab === "assistant" ? "border-b-2 border-sky-500 text-sky-700" : "text-zinc-400"
              }`}
            >
              🤖 AI 小幫手
            </button>
            <button
              onClick={() => setTab("extract")}
              className={`flex-1 py-2 text-sm font-medium ${
                tab === "extract" ? "border-b-2 border-violet-500 text-violet-700" : "text-zinc-400"
              }`}
            >
              ✨ AI 整理
            </button>
          </div>
          <div className="min-h-0 flex-1">
            {tab === "assistant" ? (
              <AssistantPanel getContext={getText} />
            ) : (
              <ExtractPanel getText={getText} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense>
      <LessonInner />
    </Suspense>
  );
}
