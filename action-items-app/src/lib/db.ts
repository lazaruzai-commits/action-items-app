/**
 * Task storage using Vercel Postgres.
 * Run the schema in Vercel Dashboard (Storage -> Postgres -> Query) or use the SQL below.
 */

import { sql } from "@vercel/postgres";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: "high" | "medium" | "low";
  due_date: string | null;
  source_author: string | null;
  source_context: string | null;
  created_at: string;
};

export async function initDb(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS action_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'Other',
      priority TEXT NOT NULL CHECK (priority IN ('high','medium','low')) DEFAULT 'medium',
      due_date DATE,
      source_author TEXT,
      source_context TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getTasks(): Promise<Task[]> {
  const { rows } = await sql`
    SELECT id, title, description, category, priority, due_date, source_author, source_context, created_at
    FROM action_items
    ORDER BY
      CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      due_date ASC NULLS LAST,
      created_at DESC
  `;
  return rows as Task[];
}

export async function insertTask(t: {
  title: string;
  description?: string | null;
  category: string;
  priority: "high" | "medium" | "low";
  due_date?: string | null;
  source_author?: string | null;
  source_context?: string | null;
}): Promise<Task> {
  const { rows } = await sql`
    INSERT INTO action_items (title, description, category, priority, due_date, source_author, source_context)
    VALUES (${t.title}, ${t.description ?? null}, ${t.category}, ${t.priority}, ${t.due_date ?? null}, ${t.source_author ?? null}, ${t.source_context ?? null})
    RETURNING id, title, description, category, priority, due_date, source_author, source_context, created_at
  `;
  return rows[0] as Task;
}

export async function insertTasks(tasks: Parameters<typeof insertTask>[0][]): Promise<Task[]> {
  const result: Task[] = [];
  for (const t of tasks) {
    result.push(await insertTask(t));
  }
  return result;
}

export async function deleteTask(id: string): Promise<void> {
  await sql`DELETE FROM action_items WHERE id = ${id}`;
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<Task, "title" | "description" | "category" | "priority" | "due_date">>
): Promise<Task | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (updates.title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${i++}`);
    values.push(updates.description);
  }
  if (updates.category !== undefined) {
    fields.push(`category = $${i++}`);
    values.push(updates.category);
  }
  if (updates.priority !== undefined) {
    fields.push(`priority = $${i++}`);
    values.push(updates.priority);
  }
  if (updates.due_date !== undefined) {
    fields.push(`due_date = $${i++}`);
    values.push(updates.due_date);
  }
  if (fields.length === 0) return null;
  const idParam = i;
  const { rows } = await sql.query(
    `UPDATE action_items SET ${fields.join(", ")} WHERE id = $${idParam} RETURNING id, title, description, category, priority, due_date, source_author, source_context, created_at`,
    [...values, id]
  );
  return (rows[0] as Task) ?? null;
}
