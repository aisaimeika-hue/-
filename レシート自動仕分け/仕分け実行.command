#!/bin/bash
# レシート仕分けを実行する(このファイルをダブルクリックするだけでOK)
cd "$(dirname "$0")"

# 初回だけ: 必要な部品を自動でインストールする
if [ ! -d "venv" ]; then
  echo "🔧 初回セットアップ中です(1〜2分かかります)..."
  python3 -m venv venv
  ./venv/bin/pip install --quiet --upgrade pip
  ./venv/bin/pip install --quiet anthropic
  echo "✅ セットアップ完了"
fi

./venv/bin/python receipt_sorter.py

echo ""
read -p "Enterキーを押すとこの画面が閉じます..."
