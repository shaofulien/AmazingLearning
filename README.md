# Amazing Learning 🎓

線上英語課（Zoom 視訊）時搭配使用的個人學習網站。

## 功能

| 功能 | 說明 |
|---|---|
| 📝 **上課共筆** | 即時共同編輯器（Tiptap + Yjs）。把連結傳給老師，兩人同時打字、互相看得到游標。網址加 `?room=任意名稱` 可換房間。 |
| 🤖 **AI 小幫手** | 上課時隨時提問（單字差異、文法、句子是否自然）。它看得到目前的共筆內容，回答即時串流顯示。 |
| ✨ **AI 整理** | 下課前一鍵把筆記丟給 Claude，自動萃取「值得學的單字」（含英文解釋、中文翻譯、例句）和「被糾正的句子」（原句、訂正、中文說明），勾選後存入單字本／錯題本。 |
| 🔁 **間隔複習** | 類 Anki 的 SM-2 演算法。單字和錯題都變成卡片，按「重來／困難／記得／簡單」自動排下次複習時間。 |

## 快速開始

```bash
# 1. 安裝
npm install

# 2. 設定 API key
cp .env.example .env.local
# 編輯 .env.local，填入 ANTHROPIC_API_KEY

# 3. 啟動（同時啟動網站 :3000 和共同編輯伺服器 :1234）
npm run dev
```

打開 http://localhost:3000 。

## 跟老師一起用

共同編輯需要老師也能連到你的伺服器。兩種方式：

1. **區網／VPN**：老師和你在同一網路時，直接給老師 `http://你的IP:3000/lesson`。
2. **部署到雲端**（推薦）：把 Next.js 部署到任何支援 Node 的主機（需要長駐程序跑 `server/collab-server.cjs`，例如 Railway、Fly.io、自己的 VPS）。設定 `NEXT_PUBLIC_COLLAB_WS_URL=wss://你的網域:1234`（或經由反向代理）。

> 注意：目前沒有登入機制，資料存在伺服器本機的 SQLite（`data/learning.db`）。部署到公開網路時請自行加上存取保護（例如 Basic Auth 或 Cloudflare Access）。

## 技術架構

- **Next.js 16**（App Router）+ TypeScript + Tailwind CSS
- **Tiptap 2 + Yjs + y-websocket** — 即時協作（`server/collab-server.cjs` 是獨立的 WebSocket relay）
- **better-sqlite3** — 單字、錯題、複習排程（`lib/db.ts`）
- **Anthropic API（claude-opus-4-8）**
  - `/api/extract` — structured output（zod schema）萃取單字與錯題
  - `/api/chat` — 串流回應的 AI 小幫手
- **SM-2** 間隔複習演算法（`lib/srs.ts`）
