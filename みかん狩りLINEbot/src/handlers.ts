import type { Env, LineEvent } from "./types";
import { replyMessage } from "./line";
import {
  getTodayDuty,
  lookupOrchardByUserId,
  registerOrchardUserId,
  logClosure,
  getTodayClosures,
  findFaqAnswer,
} from "./notion";

const ORCHARD_NAMES = [
  "奥本園", "ヤマサ園", "岡安園", "吉田園", "石井園",
  "しもと園", "飯島園", "進藤園", "丸ユ園",
];

const SEASON_START = "2026-10-15";
const SEASON_END = "2026-11-30";
const CLOSED_KEYWORDS = ["工事", "駐車場予約", "バス予約", "団体予約"];
const DUTY_KEYWORDS = ["今日", "本日", "当番", "やって", "開い"];

function isAdmin(env: Env, userId: string | undefined): boolean {
  if (!userId) return false;
  return env.ADMIN_USER_IDS.split(",").map((s) => s.trim()).includes(userId);
}

async function handleDutyInquiry(env: Env): Promise<string> {
  const duty = await getTodayDuty(env);
  if (!duty) {
    return `只今はみかん狩りシーズン期間外です。シーズンは${SEASON_START}〜${SEASON_END}です。`;
  }
  if (duty.kubun === "土日(全園開園)") {
    return `本日は土日祝のため全園営業中です!(共同当番: ${duty.orchard})`;
  }
  return `本日の当番は${duty.orchard}です。平日は当番園のみの営業となります。`;
}

async function handleClosureButton(env: Env, userId: string | undefined): Promise<string> {
  if (!userId) return "エラー: ユーザー情報が取得できませんでした。";
  const orchard = await lookupOrchardByUserId(env, userId);
  if (!orchard) {
    return `まだ園の登録がされていません。お使いの園の名前(例:${ORCHARD_NAMES[0]})をそのまま送信して登録してください。`;
  }
  await logClosure(env, orchard);
  return `本日の休園連絡を受け付けました(${orchard})。お疲れ様です。`;
}

async function handleAdminStatus(env: Env): Promise<string> {
  const closures = await getTodayClosures(env);
  if (closures.length === 0) return "【管理者確認】本日の休園連絡はまだありません。";
  return `【管理者確認】本日の休園連絡: ${closures.join("、")}`;
}

export async function handleEvent(env: Env, event: LineEvent): Promise<void> {
  if (!event.replyToken) return;
  const userId = event.source.userId;

  if (event.type === "postback" && event.postback?.data === "action=closure") {
    const reply = await handleClosureButton(env, userId);
    await replyMessage(env, event.replyToken, reply);
    return;
  }

  if (event.type !== "message" || event.message?.type !== "text") return;
  const text = event.message.text ?? "";

  if (ORCHARD_NAMES.includes(text) && userId) {
    await registerOrchardUserId(env, text, userId);
    await replyMessage(env, event.replyToken, `${text}として登録しました。次回から休園ボタンが使えます。`);
    return;
  }

  if (text === "休園状況" && isAdmin(env, userId)) {
    await replyMessage(env, event.replyToken, await handleAdminStatus(env));
    return;
  }

  if (CLOSED_KEYWORDS.some((k) => text.includes(k))) {
    if (isAdmin(env, userId)) {
      await replyMessage(env, event.replyToken, "【管理者確認用】この機能は工事中です。表示・導線は動作しています。");
    } else {
      await replyMessage(env, event.replyToken, "この機能は只今準備中です。今しばらくお待ちください。");
    }
    return;
  }

  if (DUTY_KEYWORDS.some((k) => text.includes(k))) {
    await replyMessage(env, event.replyToken, await handleDutyInquiry(env));
    return;
  }

  const faqAnswer = await findFaqAnswer(env, text);
  if (faqAnswer) {
    await replyMessage(env, event.replyToken, faqAnswer);
    return;
  }

  await replyMessage(
    env,
    event.replyToken,
    "ご質問ありがとうございます。「今日」と送ると本日の当番園がわかります。詳しいお問い合わせは観光案内所までお願いします。",
  );
}
