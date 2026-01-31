// app/api/generate-plan/route.ts
import { NextResponse } from "next/server";
import { generateTripPlan } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destination, days } = body;

    if (!destination || !days) {
      return NextResponse.json(
        { error: "Brak wymaganych danych: destination i days" },
        { status: 400 },
      );
    }

    // Generuj plan
    const { plan, sources } = await generateTripPlan(destination, days);

    // Zapisz do Supabase
    let planId = null;
    try {
      const { data, error } = await supabase
        .from("plans")
        .insert({
          destination,
          plan_data: { plan, sources },
        })
        .select()
        .single();

      if (error) {
        console.error("Błąd zapisu do Supabase:", error);
      } else {
        planId = data?.id;
      }
    } catch (dbError) {
      console.error("Błąd połączenia z bazą:", dbError);
    }

    return NextResponse.json({
      plan,
      sources,
      id: planId,
    });
  } catch (error: any) {
    console.error("Błąd główny:", error);
    return NextResponse.json(
      { error: error.message || "Wystąpił błąd serwera" },
      { status: 500 },
    );
  }
}
