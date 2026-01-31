// app/api/plan/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Nie znaleziono planu' },
        { status: 404 }
      );
    }

    // Zwracamy plan_data bezpośrednio (zawiera {plan, sources})
    return NextResponse.json(data.plan_data);
  } catch (error: any) {
    console.error('Błąd podczas pobierania planu:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}
