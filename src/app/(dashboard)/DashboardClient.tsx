'use client';

import {
  TopNavBar,
  WeeklyGrid,
  InsightsSidebar,
  NewTaskButton,
} from '@/components/dashboard';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';

interface DashboardClientProps {
  userEmail: string;
}

export function DashboardClient({ userEmail }: DashboardClientProps) {
  const {
    weekData,
    goToNextWeek,
    goToPrevWeek,
    goToThisWeek,
    isCurrentWeek,
  } = useWeekNavigation();

  return (
    <>
      <TopNavBar
        weekLabel={weekData.label}
        onPrevWeek={goToPrevWeek}
        onNextWeek={goToNextWeek}
        onThisWeek={goToThisWeek}
        isCurrentWeek={isCurrentWeek}
        userEmail={userEmail}
      />
      <div className="flex flex-1 overflow-hidden" data-testid="dashboard-page">
        <WeeklyGrid weekData={weekData} />
        <InsightsSidebar />
      </div>
      <NewTaskButton />
    </>
  );
}
