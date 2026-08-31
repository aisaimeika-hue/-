import type { Env } from "./types";

export async function verifySignature(
  body: string,
  signature: string | null,
  channelSecret: string,
): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(channelSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return expected === signature;
}

export async function replyMessage(
  env: Env,
  replyToken: string,
  text: string,
  quickReplyLabels?: string[],
): Promise<void> {
  const message: Record<string, unknown> = { type: "text", text };
  if (quickReplyLabels?.length) {
    message.quickReply = {
      items: quickReplyLabels.map((label) => ({
        type: "action",
        action: { type: "message", label, text: label },
      })),
    };
  }

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [message],
    }),
  });
}
