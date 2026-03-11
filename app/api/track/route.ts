// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { event, params } = await req.json();

    if (!event) {
      return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const { error } = await supabase.from("events").insert({
      name: event,
      params: params ?? {},
    });

    if (error) {
      console.error("[TRACK] Supabase error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TRACK] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
