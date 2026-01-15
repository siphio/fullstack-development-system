'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InsightsSidebar() {
  return (
    <aside
      className="w-80 shrink-0 hidden xl:block border-l bg-card p-4 space-y-4 overflow-y-auto"
      data-testid="insights-sidebar"
    >
      {/* Completion Chart Placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="relative w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">--%</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Completed</span>
              <span className="ml-auto font-medium">--</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-muted-foreground">Pending</span>
              <span className="ml-auto font-medium">--</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats Placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tasks Completed</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tasks Pending</span>
            <span className="font-medium">--</span>
          </div>
        </CardContent>
      </Card>

      {/* Streak Placeholder */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="font-semibold">-- Day Streak</div>
              <div className="text-sm text-muted-foreground">Keep it up!</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines Placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No upcoming deadlines
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
