export interface Env {
  NOTION_TOKEN: string;
  NOTION_DUTY_DATA_SOURCE_ID: string;
  NOTION_CLOSURE_LOG_DATA_SOURCE_ID: string;
  NOTION_FAQ_DATA_SOURCE_ID: string;
  ADMIN_KEY: string;
}

export const ORCHARDS: { slug: string; name: string }[] = [
  { slug: "okumoto", name: "奥本園" },
  { slug: "yamasa", name: "ヤマサ園" },
  { slug: "okayasu", name: "岡安園" },
  { slug: "yoshida", name: "吉田園" },
  { slug: "ishii", name: "石井園" },
  { slug: "shimoto", name: "しもと園" },
  { slug: "iijima", name: "飯島園" },
  { slug: "shindo", name: "進藤園" },
  { slug: "maruyu", name: "丸ユ園" },
];
