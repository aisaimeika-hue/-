import type { Env } from "./types";
import { ORCHARDS } from "./types";
import { page } from "./html";
import { getTodayDuty, logClosure, getTodayClosures, getActiveFaqs } from "./notion";

const SEASON_START = "2026-10-15";
const SEASON_END = "2026-11-30";

async function renderHome(env: Env): Promise<string> {
  const duty = await getTodayDuty(env);
  const faqs = await getActiveFaqs(env);

  let dutyHtml: string;
  if (!duty) {
    dutyHtml = `<p>只今はみかん狩りシーズン期間外です。シーズンは${SEASON_START}〜${SEASON_END}です。</p>`;
  } else if (duty.kubun === "土日(全園開園)") {
    dutyHtml = `<p>本日は土日祝のため<strong>全園営業中</strong>です!</p><div class="duty-orchard">共同当番: ${duty.orchard}</div>`;
  } else {
    dutyHtml = `<p>本日の当番園は</p><div class="duty-orchard">${duty.orchard}</div><p class="note">平日は当番園のみの営業となります。</p>`;
  }

  const faqHtml = faqs
    .map((f) => `<details><summary>${f.question.split(",")[0]}</summary><p>${f.answer}</p></details>`)
    .join("\n");

  return page(
    "本日のみかん狩り案内",
    `
<h1>みかん狩り組合 本日の案内</h1>
<p class="sub">三浦市 みかん狩り(${SEASON_START}〜${SEASON_END})</p>

<div class="card">
  <h2>今日の当番</h2>
  ${dutyHtml}
</div>

<div class="card">
  <h2>よくある質問</h2>
  ${faqHtml || "<p>準備中です。</p>"}
</div>

<div class="card">
  <h2>バス駐車場予約・団体予約</h2>
  <p class="note">この機能は只今準備中です。今しばらくお待ちください。</p>
</div>
`,
  );
}

function findOrchard(slug: string) {
  return ORCHARDS.find((o) => o.slug === slug);
}

function renderClosurePage(orchardName: string, done: boolean): string {
  return page(
    `${orchardName} 休園連絡`,
    `
<h1>${orchardName} 休園連絡</h1>
<p class="sub">このページは園主専用です。ブックマークしてお使いください。</p>
<div class="card">
${
  done
    ? `<p>本日の休園連絡を受け付けました。お疲れ様です。</p>`
    : `<form method="POST">
    <button class="btn" type="submit">本日休園を連絡する</button>
  </form>`
}
</div>
`,
  );
}

async function renderStatus(env: Env): Promise<string> {
  const closures = await getTodayClosures(env);
  return page(
    "本日の休園状況(管理者用)",
    `
<h1>本日の休園状況</h1>
<div class="card">
  ${
    closures.length === 0
      ? "<p>本日の休園連絡はまだありません。</p>"
      : `<ul class="closed-list">${closures.map((c) => `<li>${c}</li>`).join("")}</ul>`
  }
</div>
`,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const html = (body: string) => new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });

    if (url.pathname === "/") {
      return html(await renderHome(env));
    }

    const closureMatch = url.pathname.match(/^\/kyuen\/([a-z]+)$/);
    if (closureMatch) {
      const orchard = findOrchard(closureMatch[1]);
      if (!orchard) return new Response("not found", { status: 404 });
      if (request.method === "POST") {
        await logClosure(env, orchard.name);
        return html(renderClosurePage(orchard.name, true));
      }
      return html(renderClosurePage(orchard.name, false));
    }

    if (url.pathname === "/status") {
      if (url.searchParams.get("key") !== env.ADMIN_KEY) {
        return new Response("forbidden", { status: 403 });
      }
      return html(await renderStatus(env));
    }

    return new Response("not found", { status: 404 });
  },
};
