#!/bin/bash
# 將 wiki/ 目錄內容推送至 GitHub Wiki
# 
# 使用前請先：
# 1. 到 GitHub repo → Settings → 勾選 "Wikis"
# 2. 到 Wiki 頁籤 → 點擊 "Create the first page" → 隨便存一頁（初始化 Wiki repo）
# 3. 然後回來執行此腳本

set -e

REPO_WIKI_URL="https://github.com/chenpoyu/games-kids-playground.wiki.git"
WIKI_DIR="wiki"
TEMP_DIR="/tmp/games-kids-playground-wiki-deploy"

echo "📦 準備推送 Wiki..."

# 清理暫存目錄
rm -rf "$TEMP_DIR"

# Clone wiki repo
echo "📥 Cloning Wiki repo..."
git clone "$REPO_WIKI_URL" "$TEMP_DIR"

# 複製 wiki 內容
echo "📋 複製 Wiki 頁面..."
cp -f "$WIKI_DIR"/*.md "$TEMP_DIR/"

# 推送
cd "$TEMP_DIR"
git add -A
git commit -m "docs: 建置完整 Wiki 文件" || echo "沒有變更需要提交"
git push origin master || git push origin main

# 清理
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Wiki 已推送完成！"
echo "🌐 前往查看：https://github.com/chenpoyu/games-kids-playground/wiki"
