import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Good {greeting}, {user?.email?.split('@')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Let&apos;s make it productive.</p>
      </div>
      <div className="bg-card rounded-xl p-8 shadow-card text-center">
        <h2 className="text-xl font-semibold mb-2">Weekly Grid Coming Soon</h2>
        <p className="text-muted-foreground">Phase 1 complete! Weekly calendar with drag-and-drop in Phase 2.</p>
      </div>
    </div>
  );
}
