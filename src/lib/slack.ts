/**
 * Slack API helpers: list conversations (channels, DMs, groups) and fetch history.
 * Requires SLACK_BOT_TOKEN with scopes: channels:read, groups:read, im:read, mpim:read, channels:history, groups:history, im:history, mpim:history
 */

const SLACK_API = "https://slack.com/api";

export type SlackConversation = {
  id: string;
  name: string;
  is_channel: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_private: boolean;
  is_archived: boolean;
  user?: string; // for DMs, the other user id
};

export type SlackMessage = {
  type: string;
  user?: string;
  text: string;
  ts: string;
  thread_ts?: string;
};

export type ConversationWithMessages = {
  conversation: SlackConversation;
  messages: SlackMessage[];
};

async function slackFetch(
  token: string,
  path: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const url = new URL(path, SLACK_API);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as { ok: boolean; error?: string };
  if (!data.ok) {
    throw new Error(data.error ?? "Slack API error");
  }
  return data;
}

/** List all conversations the bot can see: public/private channels, DMs, group DMs */
export async function listConversations(token: string): Promise<SlackConversation[]> {
  const types = "public_channel,private_channel,im,mpim";
  const out: SlackConversation[] = [];
  let cursor: string | undefined;
  do {
    const params: Record<string, string> = {
      types,
      limit: "200",
      exclude_archived: "true",
    };
    if (cursor) params.cursor = cursor;
    const data = (await slackFetch(token, "/conversations.list", params)) as {
      channels?: Array<{
        id: string;
        name?: string;
        is_channel?: boolean;
        is_im?: boolean;
        is_mpim?: boolean;
        is_private?: boolean;
        is_archived?: boolean;
        user?: string;
      }>;
      response_metadata?: { next_cursor?: string };
    };
    const channels = data.channels ?? [];
    for (const ch of channels) {
      out.push({
        id: ch.id,
        name: ch.name ?? ch.id,
        is_channel: !!ch.is_channel,
        is_im: !!ch.is_im,
        is_mpim: !!ch.is_mpim,
        is_private: !!ch.is_private,
        is_archived: !!ch.is_archived,
        user: ch.user,
      });
    }
    cursor = data.response_metadata?.next_cursor;
  } while (cursor);
  return out;
}

/** Fetch recent messages in a conversation (last 4 weeks of activity) */
export async function getConversationHistory(
  token: string,
  channelId: string,
  options?: { limit?: number; oldest?: string }
): Promise<SlackMessage[]> {
  const params: Record<string, string> = {
    channel: channelId,
    limit: String(options?.limit ?? 100),
  };
  if (options?.oldest) params.oldest = options.oldest;
  const data = (await slackFetch(token, "/conversations.history", params)) as {
    messages?: Array<{ type: string; user?: string; text: string; ts: string; thread_ts?: string }>;
  };
  const messages = data.messages ?? [];
  return messages
    .filter((m) => m.type === "message" && m.text)
    .map((m) => ({
      type: m.type,
      user: m.user,
      text: m.text,
      ts: m.ts,
      thread_ts: m.thread_ts,
    }));
}

/** Resolve user ID to display name (optional, for labeling) */
export async function getUsersInfo(
  token: string,
  userIds: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const id of [...new Set(userIds)].filter(Boolean)) {
    try {
      const data = (await slackFetch(token, "/users.info", { user: id })) as {
        user?: { real_name?: string; name?: string };
      };
      result[id] = data.user?.real_name ?? data.user?.name ?? id;
    } catch {
      result[id] = id;
    }
  }
  return result;
}
