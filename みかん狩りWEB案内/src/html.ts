export function page(title: string, body: string): string {
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
    margin: 0; padding: 24px 16px 48px;
    background: #fbf6ea; color: #2b2117;
    font-family: -apple-system, "Hiragino Sans", "Yu Gothic", sans-serif;
    line-height: 1.7;
  }
  .wrap { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 1.4rem; margin: 0 0 4px; }
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
</style>
</head>
<body>
<div class="wrap">
${body}
</div>
</body>
</html>`;
}
