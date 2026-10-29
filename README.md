# 機統複習前端

本專案整理 Assignment 5-8 的指定題目解法，以及第 9 章到第 10 章考試範圍重點。

## 本地啟動

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
npm run preview
```

Vite 設定使用 `base: './'`，build 後會輸出到 `docs/`，上傳到 GitHub Pages 子路徑時也能正常載入靜態資源。

## GitHub Pages

### 最簡單方式：Deploy from branch

推到 GitHub 後：

1. 進入 GitHub repo 的 `Settings`。
2. 點左側 `Pages`。
3. 在 `Build and deployment` 的 `Source` 選 `Deploy from a branch`。
4. `Branch` 選 `main`，資料夾選 `/docs`，按 `Save`。
5. 部署完成後，Pages 網址通常會是 `https://niwi7yming4.github.io/Prob/`。

不要選 `/root`，因為 repo 根目錄的 `index.html` 是 Vite 本地開發用，GitHub Pages 直接讀它時會去抓 `/src/main.tsx`，造成 404。

### 進階方式：GitHub Actions

本專案也提供 GitHub Actions 部署設定。若要用 Actions：

1. 進入 GitHub repo 的 `Settings`。
2. 點左側 `Pages`。
3. 在 `Build and deployment` 的 `Source` 選 `GitHub Actions`。
4. 回到 `Actions` 分頁，等待 `Deploy Vite site to Pages` 跑完。
5. 部署完成後，Pages 網址通常會是 `https://niwi7yming4.github.io/Prob/`。

## 編碼

所有原始碼以 UTF-8 without BOM 儲存。若在 Windows PowerShell 讀取中文檔，請使用 `-Encoding UTF8`。

## 工業安全 × AI 影像判讀（48 題範例）

- GitHub Pages：<https://niwi7yming4.github.io/Prob/safety-quiz/>
- 可維護原始檔：`public/safety-quiz/index.html`
- 靜態網站輸出：`docs/safety-quiz/index.html`
- 48 個不同原始影像 ID，四種實驗條件各 12 題；每人每張原始影像只出現一次。
- 流程：4 題快速 Demo／48 題完整施測（兩組各 24 題，組間休息）→ 初答 → 模擬 AI 建議 → 終答 → Jian 12 題信任量表（分 3 頁）→ 3 題介面體驗小評估 → 結果摘要。
- 支援研究者題庫核對、作答結果 CSV／JSON 匯出、localStorage 暫存；不蒐集或上傳資料至伺服器。
- 題庫為 48 張不同照片、9 種主題：防護手套 6、警示錐 6、施工機具 8、護目鏡 6、工程車輛 6、安全鞋 4、反光背心 4、安全帽 4、人員與機具同場 4。
- 影像與物件標註來自 [Ultralytics Construction-PPE](https://docs.ultralytics.com/datasets/detect/construction-ppe/)（AGPL-3.0）和 [Roboflow Construction Site Safety](https://universe.roboflow.com/roboflow-universe-projects/construction-site-safety/dataset/28)（專案標示 CC BY 4.0），後者經 [Kaggle 公開鏡像](https://www.kaggle.com/datasets/snehilsanyal/construction-site-safety-image-dataset-roboflow)取得。逐題檔名、來源、類別、答案、文字正反向均見 `docs/safety-quiz/data.json`；來源清單見 `docs/safety-quiz/sources.csv`。
- **重要：** 資料集標註不等於人工確認的標準答案；負向問句為展示版的暫行安排，正式研究應檢查否定語句對反應時間的影響。圖片可能包含不同原始權利人，正式對外使用前應依圖片來源檢查再利用權利。
- 這是研究操作原型，不是真正執行電腦視覺辨識的 AI 系統。
