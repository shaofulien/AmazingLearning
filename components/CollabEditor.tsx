"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#a855f7", "#ef4444", "#eab308"];

export default function CollabEditor({
  room,
  userName,
  onEditorReady,
}: {
  room: string;
  userName: string;
  onEditorReady?: (editor: Editor) => void;
}) {
  const [connected, setConnected] = useState(false);
  const [peers, setPeers] = useState(0);

  const { ydoc, provider } = useMemo(() => {
    const ydoc = new Y.Doc();
    const wsUrl =
      process.env.NEXT_PUBLIC_COLLAB_WS_URL ||
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:1234`;
    const provider = new WebsocketProvider(wsUrl, `amazing-learning-${room}`, ydoc);
    return { ydoc, provider };
  }, [room]);

  useEffect(() => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    provider.awareness.setLocalStateField("user", { name: userName || "我", color });
  }, [provider, userName]);

  useEffect(() => {
    const onStatus = (e: { status: string }) => setConnected(e.status === "connected");
    const onAwareness = () => setPeers(provider.awareness.getStates().size);
    provider.on("status", onStatus);
    provider.awareness.on("change", onAwareness);
    return () => {
      provider.off("status", onStatus);
      provider.awareness.off("change", onAwareness);
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({ history: false }),
        Collaboration.configure({ document: ydoc }),
        CollaborationCursor.configure({ provider }),
      ],
      editorProps: {
        attributes: {
          class: "focus:outline-none min-h-[60vh] px-4 py-3 text-[15px] leading-relaxed",
        },
      },
    },
    [ydoc],
  );

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2 text-xs text-zinc-500">
        <span>
          房間：<span className="font-mono">{room}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-400"}`}
          />
          {connected ? `已連線 · ${peers} 人在線` : "未連線"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
