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
