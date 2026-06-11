"use client";

import { useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPanel({ getContext }: { getContext?: () => string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    const history = [...messages, { role: "user" as const, content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: getContext?.() ?? "" }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages([...history, { role: "assistant", content: snapshot }]);
        scrollToBottom();
      }
    } catch (err) {
      setMessages([
        ...history,
        { role: "assistant", content: `⚠️ 發生錯誤：${err instanceof Error ? err.message : err}` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="mt-8 text-center text-sm text-zinc-400">
            上課時有不懂的單字、文法，
            <br />
            隨時問 AI 小幫手 👋
            <div className="mx-auto mt-4 max-w-[240px] space-y-1 text-left text-xs text-zinc-400">
              <p>例如：</p>
              <p>・「figure out 和 find out 差在哪？」</p>
              <p>・「這句這樣講自然嗎？I am agree with you.」</p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-8 bg-sky-100 text-sky-950"
                : "mr-4 bg-zinc-100 text-zinc-800"
            }`}
          >
            {m.content || (busy && i === messages.length - 1 ? "思考中…" : "")}
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-zinc-100 p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="問 AI 小幫手…（Enter 送出，Shift+Enter 換行）"
          className="flex-1 resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="rounded-lg bg-sky-600 px-4 text-sm font-medium text-white disabled:opacity-40"
        >
          送出
        </button>
      </div>
    </div>
  );
}
