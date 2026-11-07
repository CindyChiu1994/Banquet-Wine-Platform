# 宴遇｜宴客酒款媒合平台 Demo

繁體中文、桌機優先的課程展示作品。可切換宴客主人、平台、兩家酒商與合作餐廳，操作需求、提案、餐廳履約及兩種異常；所有付款與合作資料均為模擬。

## 本機啟動

使用 Node.js 24，在此資料夾執行：

```powershell
npm.cmd ci
npm.cmd run dev
```

開啟 `http://127.0.0.1:5173/`。右欄「展示工具」提供空白需求、正常起點、餐廳取消前與驗齡前四個情境入口。載入或重設需確認，會取代目前展示資料。

## 驗證與建置

```powershell
npm.cmd run test -- --run
npm.cmd run build
npm.cmd run preview
```

建置預覽為 `http://127.0.0.1:4173/`，正式產物在 `dist/`。瀏覽器驗收透過 Playwright MCP 執行，案例結果與截圖見下方連結。

## 文件

- [展示手冊與八分鐘腳本](docs/demo-runbook.md)
- [設計與六張操作流程圖](openspec/changes/banquet-wine-platform-demo/design.md)
- [E2E 清單及證據](openspec/changes/banquet-wine-platform-demo/e2e-testing.md)
- [追蹤任務](openspec/changes/banquet-wine-platform-demo/tasks.md)

本版採 React、TypeScript strict、Vite、原生 CSS 與 localStorage，資料僅保存在同一瀏覽器與網站來源。分潤 P0 僅計算金額並顯示待結算；酒商支付分潤與餐廳確認收款屬 P1。正式登入、跨裝置同步、真實交易與公開部署不在此次範圍。
