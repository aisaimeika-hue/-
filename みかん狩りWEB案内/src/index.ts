import type { Env } from "./types";
import { ORCHARDS } from "./types";
import { page } from "./html";
import { getTodayDuty, logClosure, getTodayClosures, getActiveFaqs } from "./notion";

const SEASON_START = "2026-10-15";
const SEASON_END = "2026-11-30";

const ACCESS_GROUPS = [
  {
    icon: "🚗",
    title: "車・自転車で行く、特別感あるみかん園(3選)",
    note: `駅やインターから少し離れた分、静かで"知る人ぞ知る"雰囲気。家族や恋人、友人たちとゆったりみかん狩りを楽しみたい方に。`,
    slugs: ["iijima", "ishii", "shimoto"],
  },
  {
    icon: "🛣️",
    title: "高速インターすぐの便利なみかん農園(2選)",
    note: "車で三浦・三崎を訪れるなら、インター近くのみかん園が便利。早めに出てみかん狩りをしてから三崎港方面へ行くもよし、ランチの後に立ち寄るもよし。",
    slugs: ["shindo", "maruyu"],
  },
  {
    icon: "🚃",
    title: "三浦海岸駅から徒歩圏内のみかん園",
    note: "まぐろきっぷ利用など、電車で三浦・三崎に遊びに来た方におすすめ。改札を出てすぐの観光案内所では、土日は担当者がおすすめの農園を、平日は当番の農園名をご案内しています。",
    slugs: ["okayasu", "okumoto", "yamasa", "yoshida"],
  },
];

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

  const renderOrchardCard = (o: (typeof ORCHARDS)[number]) => `
    <div class="orchard-card">
      <div class="photo-box">${o.photo ? `<img src="${o.photo}" alt="${o.name}" loading="lazy">` : `<span class="big">🍊</span><span>写真準備中</span>`}</div>
      <h3>${o.name}</h3>
      <p class="catch">${o.catch}</p>
      <p class="meta">${o.address}</p>
      <p class="meta">TEL: ${o.phone}</p>
      ${o.website ? `<p style="margin-top:10px"><a class="pill-btn" style="font-size:0.75rem;padding:8px 18px" href="${o.website}" target="_blank" rel="noopener">公式サイトを見る</a></p>` : ""}
    </div>`;

  const accessGroupsHtml = ACCESS_GROUPS.map((group) => {
    const cards = group.slugs.map((slug) => ORCHARDS.find((o) => o.slug === slug)).filter(Boolean) as typeof ORCHARDS;
    return `
    <div class="access-group">
      <h3 class="group-title">${group.icon} ${group.title}</h3>
      <p class="note" style="margin-bottom:16px">${group.note}</p>
      <div class="orchard-grid">
        ${cards.map(renderOrchardCard).join("\n")}
      </div>
    </div>`;
  }).join("\n");

  return page(
    "三浦市 みかん狩り",
    `
<nav class="site-nav">
  <div class="brand">🍊 三浦市 みかん狩り</div>
  <div class="links">
    <a href="#miryoku">みかんの魅力</a>
    <a href="#ryokin">料金</a>
    <a href="#en-ichiran">園一覧・アクセス</a>
    <a href="#faq">FAQ</a>
  </div>
</nav>

<div class="hero">
  <div class="photo-bg" style="background-image:url('/images/hero-train.jpg')"></div>
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
    <p style="text-align:center; font-size:1.1rem; font-weight:700; color:#b8471f; margin-bottom:24px">
      甘くて、酸っぱい。だから、濃い。
    </p>
    <div class="appeal-grid">
      <div class="appeal-card">
        <div class="icon">🍊</div>
        <h3>酸味と甘みが濃い</h3>
        <p>海が近く、たっぷりミネラルを含んだ肥沃な大地で育つ三浦のみかんは、皮が薄く、ちゃんと酸っぱくて、でも甘い。一言で表すなら"味が濃いみかん"です。</p>
        <blockquote class="farmer-voice" style="margin-top:12px">「三浦のみかんは酸っぱくて、甘い。だから濃い」</blockquote>
      </div>
      <div class="appeal-card">
        <div class="icon">💎</div>
        <h3>市場に出回らない希少さ</h3>
        <p>三浦のみかんは市場に出回ることはなく、大半は地元で消費されるか、みかん狩りで消費されます。見た目よりも味にこだわることができ、どこの農園も農薬を極力減らして育てています。</p>
        <blockquote class="farmer-voice" style="margin-top:12px">「フルーツはなにかと『甘さ』がもてはやされがちだけど、甘みと酸味のバランスがとれたものほど"味が濃い"と感じるんだよ」</blockquote>
      </div>
      <div class="appeal-card">
        <div class="icon">🤝</div>
        <h3>農家さんの力になる</h3>
        <p>みかん狩りは、実は間接的に「摘果(てきか)作業」を手伝っていることにもなります。楽しむことで農家さんの作業が減り、高齢化が進む三浦の農家さんを応援できます。</p>
      </div>
    </div>
  </div>
</section>

<section class="alt">
  <div class="section-inner">
    <h2 class="section-title">美味しいみかんの見分け方</h2>
    <div class="card">
      <p class="note" style="margin-top:0">農家さんに聞いた見分け方は三者三様。いくつかご紹介します。</p>
      <ul class="tips-list">
        <li>青いみかんより、色づいたみかんを摘むべし</li>
        <li>ひっくり返って実っているみかんよりも、へたが上にあるみかんを選ぶべし</li>
        <li>木ごとに味が違うので、好みの木を見つけるべし</li>
        <li>高いところ・日当たりのいいところの方が美味しいという説は、農家さんの間でも意見が分かれる</li>
      </ul>
      <p class="note" style="margin-top:14px">
        <strong>みかん狩りの鉄則はヘタの2度切り。</strong>まず枝からパチンと切り、さらにヘタをすれすれまで切り落とします。
        そうしないと袋の中で他のみかんを傷つけ、早く傷んでしまう原因になります。
      </p>
      <div class="tips-photo"><img src="/images/tips-nidogiri.jpg" alt="ヘタの2度切りの様子" loading="lazy"></div>
      <p class="note" style="margin-top:10px">
        お土産袋は、大小さまざまなサイズを入れるとたくさん入ります(入れすぎると破れるのでご注意を)。
      </p>
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
    <h2 class="section-title">みかん園一覧・行き方で選ぶ(9園)</h2>
    ${accessGroupsHtml}
  </div>
</section>

<section>
  <div class="section-inner">
    <h2 class="section-title">写真で見る、みかん狩りの様子</h2>
    <div class="gallery-grid">
      <div class="gallery-item"><img src="/images/gallery-jacket.jpg" alt="農園主さんの出迎え" loading="lazy"></div>
      <div class="gallery-item"><img src="/images/gallery-peel.jpg" alt="採れたてみかんを味わう" loading="lazy"></div>
      <div class="gallery-item"><img src="/images/gallery-branch.jpg" alt="たわわに実ったみかん" loading="lazy"></div>
      <div class="gallery-item"><img src="/images/gallery-path.jpg" alt="のどかな園内の小道" loading="lazy"></div>
      <div class="gallery-item"><img src="/images/gallery-shop.jpg" alt="直売所のようす" loading="lazy"></div>
      <div class="gallery-item"><img src="/images/gallery-juice.jpg" alt="自家製ジュース・シロップの直売" loading="lazy"></div>
      <div class="gallery-item"><img src="/images/gallery-family-dog.jpg" alt="ワンちゃんと一緒にみかん狩り" loading="lazy"></div>
      <div class="gallery-item"><img src="/images/gallery-shibainu.jpg" alt="農園で出会える柴犬" loading="lazy"></div>
      <div class="gallery-item"><img src="/images/gallery-jacket-back.jpg" alt="「三浦」の法被姿の農家さん" loading="lazy"></div>
    </div>
    <p class="note" style="margin-top:14px; text-align:center">写真:goooone.help「三浦のみかん狩り」記事より</p>
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
  <p style="font-weight:700; color:#b8471f; font-size:0.95rem">「三浦に行ったら、みかん狩り」を合言葉に。短い旬を、ぜひ味わいに来てください。</p>
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
