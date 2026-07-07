#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
レシート自動仕分けシステム(フェーズ1: 投函箱方式)
ザ・作兵衛フルーツガーデン用

やること:
  1. デスクトップの「レシート投函箱」フォルダの画像を1枚ずつ読む
  2. レシートなら: 日付・店名・金額を読み取り → リネーム → 月別フォルダへ移動 → CSV台帳に追記
  3. レシートでないなら: 「対象外」フォルダへ移動するだけ(中身は記録しない)
  4. 読み取りに自信がないなら: 「要確認」フォルダへ移動
  5. 写真は絶対に削除しない(移動のみ)
"""

import base64
import csv
import json
import os
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path

# ============================================================
# 設定(フォルダの場所)
# ============================================================
HOME = Path.home()
BOX = HOME / "Desktop" / "レシート投函箱"          # 写真を入れる場所
NEEDS_CHECK = BOX / "要確認"                        # 読み取りに自信がないもの
NOT_RECEIPT = BOX / "対象外"                        # レシート以外の写真
OUTPUT = HOME / "Desktop" / "領収書_整理済み"       # 仕分け後の保存先
SCRIPT_DIR = Path(__file__).resolve().parent
API_KEY_FILE = SCRIPT_DIR / "APIキー.txt"

# 対応する画像の種類
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".gif"}

# 経費カテゴリー(農業所得用の勘定科目)
CATEGORIES = [
    "肥料費", "農具費", "農薬衛生費", "諸材料費", "修繕費",
    "動力光熱費", "作業用衣料費", "車両費", "荷造運賃手数料",
    "雇人費", "消耗品費", "接待交際費", "通信費", "雑費", "不明",
]

CSV_HEADER = ["日付", "店名", "金額(税込)", "カテゴリー", "支払方法", "元ファイル名", "備考"]

# AIに渡す読み取り指示
PROMPT = """この画像を見て、日本のレシート・領収書・請求書かどうか判定してください。

レシート類である場合は、以下を読み取ってください:
- 日付(西暦YYYYMMDD形式。令和などの和暦は西暦に変換)
- 店名(短く。株式会社などは省略してよい)
- 合計金額(税込・数字のみ)
- 支払方法(現金/カード/PayPay等。読み取れなければnull)
- 経費カテゴリー(農園経営の経費として、指定リストから1つ選ぶ。
  判定に迷う場合は勝手に決めず「不明」とし、noteに候補を書くこと)

カテゴリーの目安:
- 肥料費: 肥料、堆肥 / 農具費: 鍬・スコップ等の道具 / 農薬衛生費: 農薬、消毒
- 諸材料費: マルチ、支柱、ビニール等 / 修繕費: 機械や施設の修理
- 動力光熱費: 電気、灯油、機械用燃料 / 作業用衣料費: 作業着、長靴、空調服
- 車両費: ガソリン、車検、軽トラ関係 / 荷造運賃手数料: 段ボール、宅配便、出荷手数料
- 雇人費: アルバイト・パート賃金 / 消耗品費: 事務用品、細かい消耗品
- 接待交際費: 贈答、会食 / 通信費: 電話、ネット / 雑費: その他

重要:
- 金額や日付がはっきり読み取れない場合は、推測で埋めずconfidenceを"low"にすること
- レシート類でない場合(人物・風景・書類以外の写真)は is_receipt を false にし、
  他の項目はすべてnullにすること(写真の中身を説明しないこと)"""

OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "is_receipt": {"type": "boolean"},
        "date": {"type": ["string", "null"], "description": "YYYYMMDD"},
        "store": {"type": ["string", "null"]},
        "amount": {"type": ["integer", "null"]},
        "payment": {"type": ["string", "null"]},
        "category": {"type": "string", "enum": CATEGORIES},
        "confidence": {"type": "string", "enum": ["high", "low"]},
        "note": {"type": "string"},
    },
    "required": ["is_receipt", "date", "store", "amount", "payment",
                 "category", "confidence", "note"],
    "additionalProperties": False,
}


def get_api_key():
    """APIキーを環境変数またはAPIキー.txtから読む"""
    key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if key:
        return key
    if API_KEY_FILE.exists():
        key = API_KEY_FILE.read_text(encoding="utf-8").strip()
        if key:
            return key
    print("❌ APIキーが見つかりません。")
    print(f"   「{API_KEY_FILE}」というファイルを作って、")
    print("   その中にAPIキー(sk-ant-で始まる文字列)を貼り付けて保存してください。")
    sys.exit(1)


def ensure_folders():
    """必要なフォルダを作る(既にあれば何もしない)"""
    for folder in [BOX, NEEDS_CHECK, NOT_RECEIPT, OUTPUT]:
        folder.mkdir(parents=True, exist_ok=True)


def to_jpeg_if_needed(path: Path) -> tuple[Path, bool]:
    """HEIC等はAPIが読めないので、一時的にJPEGへ変換したコピーを作る。
    元の写真には一切手を付けない。戻り値: (APIに渡すファイル, 一時ファイルかどうか)"""
    if path.suffix.lower() in {".heic", ".heif"}:
        tmp = Path(tempfile.mkdtemp()) / (path.stem + ".jpg")
        result = subprocess.run(
            ["sips", "-s", "format", "jpeg", str(path), "--out", str(tmp)],
            capture_output=True,
        )
        if result.returncode != 0 or not tmp.exists():
            raise RuntimeError("HEIC変換に失敗")
        return tmp, True
    return path, False


MEDIA_TYPES = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".gif": "image/gif",
}


def read_receipt(client, image_path: Path) -> dict:
    """AIで画像を読み取る"""
    api_file, is_tmp = to_jpeg_if_needed(image_path)
    try:
        data = base64.standard_b64encode(api_file.read_bytes()).decode("utf-8")
        media_type = MEDIA_TYPES.get(api_file.suffix.lower(), "image/jpeg")
        response = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=1024,
            output_config={"format": {"type": "json_schema", "schema": OUTPUT_SCHEMA}},
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image",
                     "source": {"type": "base64", "media_type": media_type, "data": data}},
                    {"type": "text", "text": PROMPT},
                ],
            }],
        )
        text = next(b.text for b in response.content if b.type == "text")
        return json.loads(text)
    finally:
        if is_tmp:
            shutil.rmtree(api_file.parent, ignore_errors=True)


def safe_move(src: Path, dest_dir: Path, new_name: str = None) -> Path:
    """移動する(同名ファイルがあれば _2, _3 と番号を付ける)。削除は絶対にしない"""
    dest_dir.mkdir(parents=True, exist_ok=True)
    name = new_name or src.name
    dest = dest_dir / name
    counter = 2
    while dest.exists():
        dest = dest_dir / f"{Path(name).stem}_{counter}{Path(name).suffix}"
        counter += 1
    shutil.move(str(src), str(dest))
    return dest


def clean_store_name(store: str) -> str:
    """ファイル名に使えない文字を取り除く"""
    for ch in '/\\:*?"<>|':
        store = store.replace(ch, "")
    return store.strip()[:20] or "店名不明"


def append_csv(year: str, row: list):
    """CSV台帳に1行追記(なければヘッダー付きで新規作成)"""
    csv_path = OUTPUT / f"経費台帳_{year}.csv"
    is_new = not csv_path.exists()
    with open(csv_path, "a", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        if is_new:
            writer.writerow(CSV_HEADER)
        writer.writerow(row)


def valid_date(s) -> bool:
    try:
        datetime.strptime(str(s), "%Y%m%d")
        return True
    except (ValueError, TypeError):
        return False


def main():
    ensure_folders()

    # 投函箱の直下にある画像だけを対象にする(要確認・対象外の中は触らない)
    images = sorted(
        p for p in BOX.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS and not p.name.startswith(".")
    )
    if not images:
        print("📭 投函箱に写真がありません。")
        print(f"   iPhoneからAirDropした写真を「{BOX}」に入れてから、もう一度実行してください。")
        return

    try:
        import anthropic
    except ImportError:
        print("❌ 部品(anthropic)が入っていません。「仕分け実行.command」から起動してください。")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=get_api_key())

    done, check, skip = [], [], []
    print(f"🔍 {len(images)}枚の写真を処理します...\n")

    for i, img in enumerate(images, 1):
        print(f"  [{i}/{len(images)}] {img.name} ... ", end="", flush=True)
        try:
            result = read_receipt(client, img)
        except Exception as e:
            moved = safe_move(img, NEEDS_CHECK)
            check.append((moved.name, f"読み取りエラー: {e}"))
            print("⚠️ エラー → 要確認へ")
            continue

        if not result.get("is_receipt"):
            safe_move(img, NOT_RECEIPT)
            skip.append(img.name)
            print("📷 レシートではない → 対象外へ")
            continue

        date, store, amount = result.get("date"), result.get("store"), result.get("amount")
        ok = (result.get("confidence") == "high"
              and valid_date(date) and store and isinstance(amount, int) and amount > 0)

        if not ok:
            moved = safe_move(img, NEEDS_CHECK)
            check.append((moved.name, result.get("note") or "日付・店名・金額のどれかが読み取れず"))
            print("⚠️ 自信なし → 要確認へ")
            continue

        store_clean = clean_store_name(store)
        year, month = date[:4], date[4:6]
        new_name = f"{date}_{store_clean}_{amount}円{img.suffix.lower()}"
        moved = safe_move(img, OUTPUT / f"{year}年{month}月", new_name)
        append_csv(year, [
            f"{year}/{month}/{date[6:8]}", store_clean, amount,
            result.get("category", "不明"), result.get("payment") or "",
            img.name, result.get("note", ""),
        ])
        done.append(moved.name)
        print(f"✅ {new_name}")

    # サマリー報告
    print("\n" + "=" * 50)
    print(f"📊 処理結果: 処理 {len(done)}件 / 要確認 {len(check)}件 / 対象外 {len(skip)}件")
    if done:
        print(f"\n✅ 整理済み({len(done)}件) → 「領収書_整理済み」フォルダとCSV台帳に記帳しました")
    if check:
        print(f"\n⚠️ 要確認({len(check)}件) → 「レシート投函箱/要確認」を見てください:")
        for name, reason in check:
            print(f"   ・{name}: {reason}")
    if skip:
        print(f"\n📷 対象外({len(skip)}件) → レシートではない写真として移動しました(中身は記録していません)")
    print("=" * 50)


if __name__ == "__main__":
    main()
