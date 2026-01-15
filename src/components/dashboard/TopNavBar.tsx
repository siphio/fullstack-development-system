'use client';

import { Calendar, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WeekSelector } from './WeekSelector';

interface TopNavBarProps {
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  isCurrentWeek: boolean;
  userEmail: string;
}

export function TopNavBar({
  weekLabel,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  isCurrentWeek,
  userEmail,
}: TopNavBarProps) {
  const initials = userEmail.split('@')[0].slice(0, 2).toUpperCase();

  return (
    <header
      className="h-16 border-b bg-card flex items-center px-4 md:px-6 gap-4"
      data-testid="top-nav"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <span className="font-semibold hidden sm:inline">TaskFlow</span>
      </div>

      {/* Week Navigation - Desktop */}
      <div className="hidden md:flex items-center gap-2">
        <WeekSelector label={weekLabel} onPrev={onPrevWeek} onNext={onNextWeek} />
      </div>

      {/* Week Navigation - Mobile (compact) */}
      <div className="flex md:hidden items-center">
        <WeekSelector label={weekLabel} onPrev={onPrevWeek} onNext={onNextWeek} />
      </div>

      {/* This Week Button */}
      <Button
        variant={isCurrentWeek ? 'secondary' : 'outline'}
        size="sm"
        onClick={onThisWeek}
        className="hidden sm:flex gap-2"
        data-testid="this-week-btn"
      >
        <Calendar className="h-4 w-4" />
        <span>This Week</span>
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden lg:block w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-9"
          data-testid="search-input"
        />
      </div>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        data-testid="notifications-btn"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </Button>

      {/* User Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full"
            data-testid="user-avatar"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt={userEmail} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{userEmail.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action="/api/auth/signout" method="post">
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full text-left" data-testid="signout-btn">
                Sign out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
