export function page(title: string, body: string, opts?: { wide?: boolean }): string {
  const maxWidth = opts?.wide ? 980 : 640;
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0 0 48px;
    background: #fbf6ea; color: #2b2117;
    font-family: -apple-system, "Hiragino Sans", "Yu Gothic", sans-serif;
    line-height: 1.7;
  }
  .wrap { max-width: ${maxWidth}px; margin: 0 auto; padding: 24px 16px 0; }
  h1 { font-size: 1.4rem; margin: 0 0 4px; }
  h2 { font-size: 1.15rem; margin: 0 0 12px; }
  .sub { color: #6c5c48; font-size: 0.9rem; margin: 0 0 24px; }
  .card {
    background: #fffdf8; border: 1px solid #e3d6bb; border-radius: 14px;
    padding: 20px; margin-bottom: 20px;
  }
  .duty-orchard { font-size: 1.8rem; font-weight: 800; color: #b8471f; margin: 8px 0; }
  .btn {
    display: inline-block; width: 100%; text-align: center;
    background: #b8471f; color: #fff; font-weight: 700; font-size: 1.1rem;
    padding: 16px; border-radius: 10px; border: none; cursor: pointer;
    text-decoration: none;
  }
  .btn:disabled { background: #cbb99e; }
  details { border-top: 1px solid #e3d6bb; padding: 10px 0; }
  details summary { font-weight: 700; cursor: pointer; }
  .note { color: #6c5c48; font-size: 0.85rem; }
  .closed-list { list-style: none; padding: 0; }
  .closed-list li { padding: 6px 0; border-bottom: 1px solid #e3d6bb; }

  nav.site-nav {
    position: sticky; top: 0; z-index: 10;
    background: rgba(251,246,234,0.94); backdrop-filter: blur(4px);
    border-bottom: 1px solid #e3d6bb;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px; font-size: 0.85rem;
  }
  nav.site-nav .brand { font-weight: 800; color: #b8471f; }
  nav.site-nav .links { display: flex; gap: 16px; flex-wrap: wrap; }
  nav.site-nav .links a { color: #4a3d2c; text-decoration: none; }
  nav.site-nav .links a:hover { color: #b8471f; }

  .hero {
    position: relative; overflow: hidden;
    background: linear-gradient(160deg, #f0954b 0%, #e07a30 100%);
    color: #fff; padding: 56px 16px; text-align: center; margin-bottom: 0;
  }
  .hero .photo-placeholder {
    position: absolute; inset: 0; opacity: 0.18;
    background:
      radial-gradient(circle at 15% 25%, #fff 0, transparent 12%),
      radial-gradient(circle at 85% 20%, #fff 0, transparent 10%),
      radial-gradient(circle at 50% 80%, #fff 0, transparent 16%);
  }
  .hero .inner { position: relative; }
  .hero .emoji { font-size: 2.6rem; }
  .hero h1 { font-size: 1.9rem; color: #fff; margin: 8px 0 6px; }
  .hero .sub { color: #ffe6cf; font-size: 1rem; margin-bottom: 18px; }
  .hero .duty-banner {
    display: inline-block; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.4);
    border-radius: 16px; padding: 14px 22px; margin-top: 4px;
  }
  .hero .duty-banner .duty-orchard { color: #fff; }

  .pill-btn {
    display: inline-block; background: #b8471f; color: #fff; font-weight: 700;
    font-size: 0.85rem; padding: 10px 24px; border-radius: 999px; border: none;
    text-decoration: none; cursor: pointer;
  }
  .photo-box {
    aspect-ratio: 4 / 3; border-radius: 12px; margin-bottom: 12px;
    background: linear-gradient(135deg, #f6ead2 0%, #efd9b0 100%);
    display: flex; align-items: center; justify-content: center;
    color: #b89a68; font-size: 0.75rem; flex-direction: column; gap: 6px;
  }
  .photo-box .big { font-size: 1.8rem; }

  section { padding: 40px 0; }
  section.alt { background: #f3ead9; }
  .section-inner { max-width: ${maxWidth}px; margin: 0 auto; padding: 0 16px; }
  .section-title {
    display: flex; align-items: center; gap: 10px; justify-content: center;
    font-size: 1.25rem; font-weight: 800; margin: 0 0 28px;
  }
  .section-title::before, .section-title::after { content: ""; width: 28px; height: 2px; background: #b8471f; }

  .appeal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
  .appeal-card { background: #fffdf8; border: 1px solid #e3d6bb; border-radius: 14px; padding: 20px; }
  .appeal-card .icon { font-size: 1.8rem; }
  .appeal-card h3 { margin: 8px 0 6px; font-size: 1rem; }
  .appeal-card p { margin: 0; font-size: 0.9rem; color: #4a3d2c; }

  table.price { width: 100%; border-collapse: collapse; background: #fffdf8; border-radius: 10px; overflow: hidden; }
  table.price th, table.price td { padding: 10px 12px; border-bottom: 1px solid #e3d6bb; text-align: left; font-size: 0.9rem; }
  table.price th { background: #f0954b; color: #fff; }

  .orchard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
  .orchard-card { background: #fffdf8; border: 1px solid #e3d6bb; border-radius: 14px; padding: 16px; }
  .orchard-card h3 { margin: 0 0 6px; font-size: 1.05rem; color: #b8471f; border-left: 3px solid #b8471f; padding-left: 8px; }
  .orchard-card p { margin: 4px 0; font-size: 0.85rem; }
  .orchard-card .catch { color: #4a3d2c; margin-bottom: 8px; }
  .orchard-card .meta { color: #6c5c48; }
  .orchard-card a { color: #b8471f; }

  .access-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
  .access-card { background: #fffdf8; border: 1px solid #e3d6bb; border-radius: 14px; padding: 18px; }
  .access-card h3 { margin: 0 0 8px; font-size: 1rem; }

  footer.site-footer { text-align: center; color: #6c5c48; font-size: 0.8rem; padding: 32px 16px 0; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}
