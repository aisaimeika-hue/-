import type { Env } from "./types";
import { ORCHARDS } from "./types";
import { page } from "./html";
import { getTodayDuty, logClosure, getTodayClosures, getActiveFaqs } from "./notion";

const SEASON_START = "2026-10-15";
const SEASON_END = "2026-11-30";

async function renderDutyBanner(env: Env): Promise<string> {
  const duty = await getTodayDuty(env);
  if (!duty) {
    return `<p>只今はみかん狩りシーズン期間外です。シーズンは${SEASON_START}〜${SEASON_END}です。</p>`;
  }
  if (duty.kubun === "土日(全園開園)") {
    return `<p>本日は土日祝のため<strong>全園営業中</strong>です!</p><div class="duty-orchard">共同当番: ${duty.orchard}</div>`;
  }
  return `<p>本日の当番園は</p><div class="duty-orchard">${duty.orchard}</div><p class="note" style="color:#ffe6cf">平日は当番園のみの営業となります。</p>`;
}

async function renderHome(env: Env): Promise<string> {
  const dutyHtml = await renderDutyBanner(env);
  const faqs = await getActiveFaqs(env);
  const faqHtml = faqs
    .map((f) => `<details><summary>${f.question.split(",")[0]}</summary><p>${f.answer}</p></details>`)
    .join("\n");

  const orchardCards = ORCHARDS.map(
    (o) => `
    <div class="orchard-card">
      <div class="photo-box"><span class="big">🍊</span><span>写真準備中</span></div>
      <h3>${o.name}</h3>
      <p class="catch">${o.catch}</p>
      <p class="meta">${o.address}</p>
      <p class="meta">TEL: ${o.phone}</p>
      ${o.website ? `<p style="margin-top:10px"><a class="pill-btn" style="font-size:0.75rem;padding:8px 18px" href="${o.website}" target="_blank" rel="noopener">公式サイトを見る</a></p>` : ""}
    </div>`,
  ).join("\n");

  return page(
    "三浦市 みかん狩り",
    `
<nav class="site-nav">
  <div class="brand">🍊 三浦市 みかん狩り</div>
  <div class="links">
    <a href="#miryoku">みかんの魅力</a>
    <a href="#ryokin">料金</a>
    <a href="#en-ichiran">園一覧</a>
    <a href="#access">アクセス</a>
    <a href="#faq">FAQ</a>
  </div>
</nav>

<div class="hero">
  <div class="photo-placeholder"></div>
  <div class="inner">
    <div class="emoji">🍊</div>
    <h1>三浦市 みかん狩り</h1>
    <p class="sub">${SEASON_START}〜${SEASON_END}(雨天休園)</p>
    <div class="duty-banner">${dutyHtml}</div>
  </div>
</div>

<section id="miryoku">
  <div class="section-inner">
    <h2 class="section-title">三浦のみかんが選ばれる理由</h2>
    <div class="appeal-grid">
      <div class="appeal-card">
        <div class="icon">🍊</div>
        <h3>酸味と甘みが濃い</h3>
        <p>海が近く、ミネラル豊富な大地で育つ三浦のみかんは、皮が薄く、酸味と甘みのバランスがとれた"味の濃い"みかんです。</p>
      </div>
      <div class="appeal-card">
        <div class="icon">💎</div>
        <h3>市場に出回らない希少さ</h3>
        <p>三浦のみかんの多くは地元消費とみかん狩りで消費され、市場にはほとんど出回りません。ここでしか味わえない味です。</p>
      </div>
      <div class="appeal-card">
        <div class="icon">🤝</div>
        <h3>農家さんの力になる</h3>
        <p>みかん狩りは摘果作業を手伝うことにもつながります。楽しみながら、高齢化が進む三浦の農家さんを応援できます。</p>
      </div>
    </div>
  </div>
</section>

<section class="alt" id="ryokin">
  <div class="section-inner">
    <h2 class="section-title">料金・基本情報</h2>
    <table class="price">
      <tr><th>区分</th><th>料金(税込)</th><th>内容</th></tr>
      <tr><td>小学生以上</td><td>1,200円</td><td rowspan="3">時間無制限・お土産袋1枚付き(みかん約1kg)。団体(20名以上・要予約)は各50円引き</td></tr>
      <tr><td>小学生未満</td><td>900円</td></tr>
      <tr><td>2歳以下</td><td>無料</td></tr>
    </table>
    <p class="note" style="margin-top:12px">入園時間 9:00〜15:00(受付は14:30まで)。予約不要、当日三浦海岸駅前観光案内所または三崎口駅前観光案内所へお越しいただくか、各園に直接お問い合わせください。</p>
  </div>
</section>

<section id="en-ichiran">
  <div class="section-inner">
    <h2 class="section-title">みかん園一覧(9園)</h2>
    <div class="orchard-grid">
      ${orchardCards}
    </div>
  </div>
</section>

<section class="alt" id="access">
  <div class="section-inner">
    <h2 class="section-title">アクセス</h2>
    <div class="access-grid">
      <div class="access-card">
        <h3>🚗 車・自転車で</h3>
        <p>駅やインターから少し離れた、知る人ぞ知る農園も。ゆったりみかん狩りを楽しめます。</p>
      </div>
      <div class="access-card">
        <h3>🛣️ 高速インターすぐ</h3>
        <p>三浦縦貫道の出口すぐの農園も複数あり。三崎港観光と組み合わせるのに便利です。</p>
      </div>
      <div class="access-card">
        <h3>🚃 三浦海岸駅から徒歩圏内</h3>
        <p>電車でお越しの方や、まぐろきっぷ利用の方におすすめ。駅前観光案内所で当番園をご案内しています。</p>
      </div>
    </div>
  </div>
</section>

<section id="faq">
  <div class="section-inner">
    <h2 class="section-title">よくある質問</h2>
    <div class="card">
      ${faqHtml || "<p>準備中です。</p>"}
    </div>
  </div>
</section>

<footer class="site-footer">
  <p>三浦市 みかん狩り組合 ／ シーズン: ${SEASON_START}〜${SEASON_END}(雨天休園、お越しの前にご確認ください)</p>
</footer>
`,
    { wide: true },
  );
}

function findOrchard(slug: string) {
  return ORCHARDS.find((o) => o.slug === slug);
}

function renderClosurePage(orchardName: string, done: boolean): string {
  return page(
    `${orchardName} 休園連絡`,
    `
<div class="wrap">
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
</div>
`,
  );
}

async function renderStatus(env: Env): Promise<string> {
  const closures = await getTodayClosures(env);
  return page(
    "本日の休園状況(管理者用)",
    `
<div class="wrap">
<h1>本日の休園状況</h1>
<div class="card">
  ${
    closures.length === 0
      ? "<p>本日の休園連絡はまだありません。</p>"
      : `<ul class="closed-list">${closures.map((c) => `<li>${c}</li>`).join("")}</ul>`
  }
</div>
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
