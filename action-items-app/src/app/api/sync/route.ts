import { NextResponse } from "next/server";
import { listConversations, getConversationHistory, getUsersInfo } from "@/lib/slack";
import { extractActionItems } from "@/lib/claude";
import { initDb, insertTask } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // allow long run for many conversations

export async function POST() {
  const token = process.env.SLACK_BOT_TOKEN;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!token || !anthropicKey) {
    return NextResponse.json(
      { error: "Missing SLACK_BOT_TOKEN or ANTHROPIC_API_KEY" },
      { status: 400 }
    );
  }

  try {
    await initDb();
    const conversations = await listConversations(token);
    const userIds = new Set<string>();
    for (const c of conversations) {
      if (c.user) userIds.add(c.user);
    }
    const userNames = await getUsersInfo(token, [...userIds]);

    let totalAdded = 0;
    const limitPerChannel = 50; // messages per conversation to analyze
    const fourWeeksAgo = Math.floor(Date.now() / 1000) - 4 * 7 * 24 * 3600;

    for (const conv of conversations) {
      try {
        const rawMessages = await getConversationHistory(token, conv.id, {
          limit: limitPerChannel,
          oldest: String(fourWeeksAgo),
        });
        if (rawMessages.length === 0) continue;

        const authorNames = await getUsersInfo(
          token,
          rawMessages.map((m) => m.user).filter(Boolean) as string[]
        );
        const messages = rawMessages.map((m) => ({
          user: m.user,
          text: m.text,
          authorName: m.user ? authorNames[m.user] ?? m.user : undefined,
        }));

        const label =
          conv.is_im && conv.user
            ? `DM with ${userNames[conv.user] ?? conv.user}`
            : conv.name ?? conv.id;

        const items = await extractActionItems(anthropicKey, label, messages);
        for (const item of items) {
          let priority = item.priority;
          if (item.sourceAuthor?.toLowerCase().includes("dhara tanwani")) {
            priority = "high";
          }
          await insertTask({
            title: item.title,
            description: item.description ?? null,
            category: item.category,
            priority,
            due_date: item.dueDate,
            source_author: item.sourceAuthor ?? null,
            source_context: item.sourceContext ?? label,
          });
          totalAdded++;
        }
      } catch (err) {
        console.warn(`Skip conversation ${conv.id}:`, err);
      }
    }

    return NextResponse.json({ ok: true, tasksAdded: totalAdded });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}
