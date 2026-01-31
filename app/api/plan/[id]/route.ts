// app/api/plan/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 1. Definiujemy typ propsów zgodnie z nowym standardem
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest, // Dobra praktyka: używamy NextRequest
  context: RouteContext, // params są wewnątrz contextu jako Promise
) {
  try {
    // 2. MUSISZ poczekać (await) na params
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Nie znaleziono planu" },
        { status: 404 },
      );
    }

    return NextResponse.json(data.plan_data);
  } catch (error: any) {
    console.error("Błąd podczas pobierania planu:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 },
    );
  }
}
