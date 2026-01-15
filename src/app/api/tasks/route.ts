import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { toTask } from '@/types';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .gte('scheduled_date', start)
    .lte('scheduled_date', end)
    .order('position', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data.map(toTask) });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, scheduledDate, category } = body;

  if (!title || !scheduledDate) {
    return NextResponse.json({ error: 'Title and scheduledDate required' }, { status: 400 });
  }

  // Get max position for the date
  const { data: existingTasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('scheduled_date', scheduledDate)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition =
    existingTasks?.[0]?.position !== undefined ? existingTasks[0].position + 1 : 0;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      scheduled_date: scheduledDate,
      category: category || 'general',
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: toTask(data) }, { status: 201 });
}
