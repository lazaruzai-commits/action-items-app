import { NextResponse } from "next/server";
import { getTasks, initDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDb();
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load tasks" },
      { status: 500 }
    );
  }
}
