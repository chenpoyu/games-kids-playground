# 🚢 CI/CD 部署

## 概述

本專案使用 **GitHub Actions** 自動化流程，推送至 `main` 分支後自動執行：

```
Push to main → 安裝依賴 → 執行測試 → 建構 → 部署至 GitHub Pages
```

## Workflow 設定

> `.github/workflows/deploy.yml`

### 觸發條件

| 事件 | 說明 |
|------|------|
| `push` to `main` | 推送至主分支時自動觸發 |
| `workflow_dispatch` | 可在 GitHub Actions 頁面手動觸發 |

### 執行流程

```
┌─────────────────────────────────────────┐
│  Build Job                              │
│  1. Checkout 原始碼                      │
│  2. Setup Node.js 20 (with npm cache)   │
│  3. npm ci (安裝依賴)                    │
│  4. npm test -- --run (執行測試)          │
│  5. npm run build (建構至 dist/)         │
│  6. Upload artifact                     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Deploy Job                             │
│  1. Deploy to GitHub Pages              │
│  2. 網站更新完成                          │
└─────────────────────────────────────────┘
```

### 關鍵設定

| 項目 | 值 | 說明 |
|------|------|------|
| Node.js 版本 | 20 | LTS 版本，搭配 npm cache 加速 |
| 建構目錄 | `dist/` | Vite 預設輸出目錄 |
| Base URL | `/games-kids-playground/` | GitHub Pages 子路徑 |
| 並行控制 | `cancel-in-progress: true` | 新的部署會取消進行中的舊部署 |

### 權限

```yaml
permissions:
  contents: read      # 讀取原始碼
  pages: write        # 寫入 GitHub Pages
  id-token: write     # OIDC token（部署用）
```

## GitHub Pages 設定

在 GitHub repo 的 **Settings → Pages** 中：

- **Source**: GitHub Actions
- **URL**: `https://chenpoyu.github.io/games-kids-playground/`

## Vite Base 設定

```javascript
// vite.config.js
export default defineConfig({
  base: '/games-kids-playground/',  // 對應 GitHub Pages 子路徑
})
```

## 測試失敗時

若測試步驟失敗，整個 workflow 會中止，**不會部署**。這確保上線的版本永遠通過測試。

## 手動觸發部署

1. 前往 GitHub repo 的 **Actions** 頁面
2. 選擇 **Deploy to GitHub Pages** workflow
3. 點擊 **Run workflow** → **Run workflow**
