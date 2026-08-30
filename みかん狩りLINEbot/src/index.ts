import type { Env, LineWebhookBody } from "./types";
import { verifySignature } from "./line";
import { handleEvent } from "./handlers";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/webhook" || request.method !== "POST") {
      return new Response("not found", { status: 404 });
    }

    const bodyText = await request.text();
    const signature = request.headers.get("x-line-signature");
    const valid = await verifySignature(bodyText, signature, env.LINE_CHANNEL_SECRET);
    if (!valid) {
      return new Response("invalid signature", { status: 401 });
    }

    const body = JSON.parse(bodyText) as LineWebhookBody;
    for (const event of body.events) {
      await handleEvent(env, event);
    }

    return new Response("ok", { status: 200 });
  },
};
