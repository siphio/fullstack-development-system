import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { date, taskIds } = body;

  if (!date || !taskIds || !Array.isArray(taskIds)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Update positions in a transaction-like manner
  const updates = taskIds.map((id: string, position: number) =>
    supabase
      .from('tasks')
      .update({ position, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Failed to update some positions', details: errors.map((e) => e.error?.message) },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, updated: taskIds.length });
}
