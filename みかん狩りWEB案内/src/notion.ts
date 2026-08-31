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

export interface FaqEntry {
  question: string;
  answer: string;
}

export async function getActiveFaqs(env: Env): Promise<FaqEntry[]> {
  const results = await queryDataSource(env, env.NOTION_FAQ_DATA_SOURCE_ID, {
    property: "有効",
    checkbox: { equals: true },
  });
  return results.map((r) => ({
    question: r.properties["質問キーワード"]?.title?.[0]?.plain_text ?? "",
    answer: r.properties["回答"]?.rich_text?.[0]?.plain_text ?? "",
  }));
}
