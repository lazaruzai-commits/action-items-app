/**
 * Use Claude to extract action items from conversation text.
 * Rules: Dhara Tanwani -> top priority; infer category, priority, and due date when possible.
 */

import Anthropic from "@anthropic-ai/sdk";

export type ExtractedActionItem = {
  title: string;
  description?: string;
  category: string;
  priority: "high" | "medium" | "low";
  dueDate: string | null; // ISO date or null
  sourceAuthor?: string;
  sourceContext?: string;
};

const HIGH_PRIORITY_AUTHOR = "Dhara Tanwani";

const systemPrompt = `You are an assistant that extracts action items from conversation transcripts.

Rules:
- Only output action items that are clearly tasks for the user (the person whose conversations these are). Ignore general discussion, questions without a clear task, or tasks assigned to others.
- Categorize each action item into one of: Work, Personal, Follow-up, Meeting, Review, Other. Use your judgment.
- Assign priority: high, medium, or low. If the author of the message is "Dhara Tanwani", always set priority to high. Otherwise infer from words like "urgent", "ASAP", "when you can", "no rush", or context.
- If a due date or deadline is mentioned (e.g. "by Friday", "EOD", "next week"), output it as an ISO date (YYYY-MM-DD). Otherwise output null.
- Output valid JSON only, no markdown or extra text.`;

const outputSchema = `{
  "actionItems": [
    {
      "title": "short task title",
      "description": "optional longer description",
      "category": "Work|Personal|Follow-up|Meeting|Review|Other",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD or null",
      "sourceAuthor": "display name if known",
      "sourceContext": "channel or conversation name"
    }
  ]
}`;

export async function extractActionItems(
  apiKey: string,
  conversationLabel: string,
  messages: Array<{ user?: string; text: string; authorName?: string }>
): Promise<ExtractedActionItem[]> {
  if (messages.length === 0) return [];

  const transcript = messages
    .map((m) => {
      const author = m.authorName ?? m.user ?? "Unknown";
      return `[${author}]: ${m.text}`;
    })
    .join("\n");

  const userPrompt = `Conversation: ${conversationLabel}\n\nTranscript:\n${transcript}\n\nExtract all action items for the user. Reply with JSON in this exact shape: ${outputSchema}`;

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content?.find((b) => b.type === "text")?.type === "text"
      ? (response.content.find((b) => b.type === "text") as { type: "text"; text: string }).text
      : "";
  const normalized = text.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();
  let parsed: { actionItems?: ExtractedActionItem[] };
  try {
    parsed = JSON.parse(normalized) as { actionItems?: ExtractedActionItem[] };
  } catch {
    return [];
  }
  const items = parsed.actionItems ?? [];
  return items.map((item) => ({
    ...item,
    priority: item.priority ?? "medium",
    dueDate: item.dueDate ?? null,
    category: item.category ?? "Other",
  }));
}
