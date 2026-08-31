import type { Env } from "./types";

const NOTION_VERSION = "2025-09-03";

function notionHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.NOTION_TOKEN}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

async function queryDataSource(env: Env, dataSourceId: string, filter?: unknown): Promise<any[]> {
  const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
    method: "POST",
    headers: notionHeaders(env),
    body: JSON.stringify(filter ? { filter } : {}),
  });
  const data = await res.json<{ results: any[] }>();
  return data.results ?? [];
}

function todayIsoJst(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

export async function getTodayDuty(env: Env): Promise<{ kubun: string; orchard: string } | null> {
  const dateIso = todayIsoJst();
  const results = await queryDataSource(env, env.NOTION_DUTY_DATA_SOURCE_ID, {
    property: "日付",
    date: { equals: dateIso },
  });
  if (results.length === 0) return null;
  const props = results[0].properties;
  return {
    kubun: props["区分"]?.select?.name ?? "",
    orchard: props["当番園"]?.select?.name ?? "未定",
  };
}

export async function lookupOrchardByUserId(env: Env, userId: string): Promise<string | null> {
  const results = await queryDataSource(env, env.NOTION_LINE_REGISTRY_DATA_SOURCE_ID, {
    property: "LINE_userId",
    rich_text: { equals: userId },
  });
  if (results.length === 0) return null;
  const title = results[0].properties["園名"]?.title;
  return title?.[0]?.plain_text ?? null;
}

export async function registerOrchardUserId(env: Env, orchardName: string, userId: string): Promise<void> {
  await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(env),
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: env.NOTION_LINE_REGISTRY_DATA_SOURCE_ID },
      properties: {
        "園名": { title: [{ text: { content: orchardName } }] },
        "LINE_userId": { rich_text: [{ text: { content: userId } }] },
        "登録日時": { date: { start: new Date().toISOString() } },
      },
    }),
  });
}

export async function logClosure(env: Env, orchardName: string): Promise<void> {
  const dateIso = todayIsoJst();
  await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: notionHeaders(env),
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: env.NOTION_CLOSURE_LOG_DATA_SOURCE_ID },
      properties: {
        "タイトル": { title: [{ text: { content: `${dateIso} ${orchardName}` } }] },
        "日付": { date: { start: dateIso } },
        "園名": { select: { name: orchardName } },
        "連絡時刻": { date: { start: new Date().toISOString() } },
      },
    }),
  });
}

export async function getTodayClosures(env: Env): Promise<string[]> {
  const dateIso = todayIsoJst();
  const results = await queryDataSource(env, env.NOTION_CLOSURE_LOG_DATA_SOURCE_ID, {
    property: "日付",
    date: { equals: dateIso },
  });
  return results.map((r) => r.properties["園名"]?.select?.name).filter(Boolean);
}

export async function findFaqAnswer(env: Env, text: string): Promise<string | null> {
  const results = await queryDataSource(env, env.NOTION_FAQ_DATA_SOURCE_ID, {
    property: "有効",
    checkbox: { equals: true },
  });
  for (const r of results) {
    const keywordText: string = r.properties["質問キーワード"]?.title?.[0]?.plain_text ?? "";
    const keywords = keywordText.split(",").map((k) => k.trim()).filter(Boolean);
    if (keywords.some((k) => text.includes(k))) {
      return r.properties["回答"]?.rich_text?.[0]?.plain_text ?? null;
    }
  }
  return null;
}
