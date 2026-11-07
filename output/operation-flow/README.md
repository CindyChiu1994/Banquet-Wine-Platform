# Mermaid 本機工具與流程圖

已安裝全域 `@mermaid-js/mermaid-cli`，驗證版本為 **12.2.0**。安裝來源：[Mermaid CLI 官方專案](https://github.com/mermaid-js/mermaid-cli)。

2026-11-07 已使用本機 Chrome 成功渲染 `design.md` 的 Operation Flow 六張圖，產物為本資料夾的 `flow-1.svg` 至 `flow-6.svg`。開啟 [審閱頁面](index.html) 可依序查看；原規格與情境對照仍以 [design.md](../../openspec/changes/banquet-wine-platform-demo/design.md) 為準。

在專案根目錄的 PowerShell 執行：

```powershell
mmdc.cmd --version
mmdc.cmd -i output/operation-flow/flow-1.mmd -o output/operation-flow/flow-1.svg -p output/operation-flow/puppeteer-config.json -c output/operation-flow/mermaid-config.json -b white
```

本機 PowerShell 限制 `.ps1`，因此使用 `mmdc.cmd`。`puppeteer-config.json` 指向既有 Chrome，無須另下載瀏覽器；渲染其他檔案時也請帶入此 `-p` 設定。若移到其他電腦，需將設定中的 Chrome 路徑更新為該電腦的實際位置。

圖檔在本機渲染，未送至線上渲染服務。此次驗證涵蓋 Mermaid 渲染成功，不表示平台功能已實作或通過功能測試。
