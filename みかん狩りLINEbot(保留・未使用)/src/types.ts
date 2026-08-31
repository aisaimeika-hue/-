export interface Env {
  LINE_CHANNEL_ACCESS_TOKEN: string;
  LINE_CHANNEL_SECRET: string;
  NOTION_TOKEN: string;
  NOTION_DUTY_DATA_SOURCE_ID: string;
  NOTION_LINE_REGISTRY_DATA_SOURCE_ID: string;
  NOTION_CLOSURE_LOG_DATA_SOURCE_ID: string;
  NOTION_FAQ_DATA_SOURCE_ID: string;
  ADMIN_USER_IDS: string;
}

export interface LineEvent {
  type: string;
  replyToken?: string;
  source: { userId?: string; type: string };
  message?: { type: string; text?: string };
  postback?: { data: string };
}

export interface LineWebhookBody {
  events: LineEvent[];
}
