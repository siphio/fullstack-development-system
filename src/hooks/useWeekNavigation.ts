'use client';

import { useState, useCallback, useMemo } from 'react';
import { getWeekData, getNextWeek, getPrevWeek } from '@/lib/date-utils';
import { isThisWeek } from 'date-fns';
import type { WeekData } from '@/types';

export function useWeekNavigation() {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const weekData: WeekData = useMemo(
    () => getWeekData(currentDate),
    [currentDate]
  );

  const goToNextWeek = useCallback(() => {
    setCurrentDate((d) => getNextWeek(d));
  }, []);

  const goToPrevWeek = useCallback(() => {
    setCurrentDate((d) => getPrevWeek(d));
  }, []);

  const goToThisWeek = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const isCurrentWeek = useMemo(
    () => isThisWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );

  return {
    weekData,
    currentDate,
    goToNextWeek,
    goToPrevWeek,
    goToThisWeek,
    isCurrentWeek,
  };
}
