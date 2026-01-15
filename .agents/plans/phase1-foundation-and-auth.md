# Phase 1: Foundation & Authentication

## Overview

**Goal**: Next.js 14 + Supabase Auth + Tailwind/shadcn foundation for TaskFlow
**Complexity**: High | **Playwright Tier**: 2 (Desktop + Mobile)

**User Story**: As a user, I want to sign up/login so my tasks are private and synced.

---

## MUST READ BEFORE IMPLEMENTING

- `PRD.md:267-299` - Database schema
- `PRD.md:559-585` - Design tokens
- `CLAUDE.md:51-100` - Directory structure
- `ui-design-referance.png` - Visual reference

---

## FILES TO CREATE

```
src/
├── app/
│   ├── (auth)/layout.tsx, login/page.tsx, signup/page.tsx
│   ├── (dashboard)/layout.tsx, page.tsx
│   ├── api/auth/signout/route.ts, health/route.ts
│   ├── layout.tsx, globals.css
├── components/auth/LoginForm.tsx, SignupForm.tsx
├── lib/supabase/client.ts, server.ts, middleware.ts
├── lib/utils.ts
├── types/index.ts
├── middleware.ts
supabase/
├── migrations/00001_create_tables.sql
├── seed.sql
```

---

## IMPLEMENTATION TASKS

### 1. CREATE Next.js Project

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

### 2. ADD Dependencies

```bash
pnpm add @supabase/supabase-js@^2.43.0 @supabase/ssr@^0.8.0 clsx tailwind-merge
pnpm add -D tailwindcss-animate
```

### 3. CREATE `src/types/index.ts`

```typescript
export type TaskCategory = 'meeting' | 'general' | 'urgent';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  position: number;
  category: TaskCategory;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  position: number;
  category: 'meeting' | 'general' | 'urgent';
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? undefined,
    scheduledDate: row.scheduled_date,
    position: row.position,
    category: row.category,
    isCompleted: row.is_completed,
    completedAt: row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface WeekStats {
  completed: number;
  pending: number;
  completionRate: number;
  streak: number;
  trend: 'up' | 'down' | 'neutral';
}
```

### 4. CREATE `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5. UPDATE `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#EDE9E3',
        foreground: '#1E2433',
        card: { DEFAULT: '#FFFFFF', foreground: '#1E2433' },
        primary: { DEFAULT: '#7C3AED', foreground: '#FFFFFF' },
        'category-meeting': '#F0D9E8',
        'category-general': '#DCD5C9',
        'category-urgent': '#7C3AED',
        success: '#10B981',
        muted: { DEFAULT: '#F5F5F4', foreground: '#737373' },
        border: '#E5E5E5',
        input: '#E5E5E5',
        ring: '#7C3AED',
      },
      fontFamily: { sans: ['var(--font-plus-jakarta-sans)', 'system-ui', 'sans-serif'] },
      borderRadius: { container: '1.25rem', card: '0.75rem' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
```

### 6. UPDATE `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 30 20% 92%;
    --foreground: 222 24% 16%;
    --card: 0 0% 100%;
    --card-foreground: 222 24% 16%;
    --primary: 262 83% 58%;
    --primary-foreground: 0 0% 100%;
    --muted: 30 10% 96%;
    --muted-foreground: 0 0% 45%;
    --border: 30 10% 90%;
    --input: 30 10% 90%;
    --ring: 262 83% 58%;
    --radius: 0.75rem;
  }
  * { @apply border-border; }
  body { @apply bg-background text-foreground antialiased; }
}
```

### 7. UPDATE `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TaskFlow - Weekly Task Dashboard',
  description: 'Visualize and conquer your weekly workload',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body className="min-h-screen bg-background font-sans">{children}</body>
    </html>
  );
}
```

### 8. INIT shadcn/ui

```bash
pnpm dlx shadcn@latest init -y
pnpm dlx shadcn@latest add button input label card -y
```

### 9. INIT Supabase

```bash
supabase init
```

### 10. CREATE `supabase/migrations/00001_create_tables.sql`

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description TEXT,
  scheduled_date DATE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('meeting', 'general', 'urgent')),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_date ON tasks(user_id, scheduled_date);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_count INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completion_date DATE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own prefs" ON user_preferences FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 11. CREATE `supabase/seed.sql`

```sql
-- Test user: test@taskflow.dev / TestPassword123!
-- Sample tasks seeded after user signs up via the trigger
-- Run `supabase db reset` after test user creation to populate tasks
```

### 12. CREATE `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### 13. CREATE `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 14. CREATE `src/lib/supabase/server.ts`

```typescript
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
}
```

### 15. CREATE `src/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');

  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
```

### 16. CREATE `src/middleware.ts`

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### 17. CREATE `src/app/(auth)/layout.tsx`

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">TaskFlow</h1>
          <p className="text-muted-foreground mt-1">Organize your week, conquer your goals</p>
        </div>
        {children}
      </div>
    </div>
  );
}
```

### 18. CREATE `src/components/auth/LoginForm.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div data-testid="auth-error-message" className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="auth-email-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="auth-password-input" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading} data-testid="auth-submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline" data-testid="auth-signup-link">Sign up</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

### 19. CREATE `src/components/auth/SignupForm.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div data-testid="auth-error-message" className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="auth-email-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="auth-password-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required data-testid="auth-confirm-password-input" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading} data-testid="auth-submit-btn">
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline" data-testid="auth-login-link">Sign in</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

### 20. CREATE `src/app/(auth)/login/page.tsx`

```tsx
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return <div data-testid="login-page"><LoginForm /></div>;
}
```

### 21. CREATE `src/app/(auth)/signup/page.tsx`

```tsx
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return <div data-testid="signup-page"><SignupForm /></div>;
}
```

### 22. CREATE `src/app/(dashboard)/layout.tsx`

```tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-layout">
      <header className="h-16 border-b bg-card flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold">TaskFlow</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="text-sm text-muted-foreground hover:text-foreground" data-testid="signout-btn">Sign out</button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
```

### 23. CREATE `src/app/(dashboard)/page.tsx`

```tsx
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
```

### 24. CREATE `src/app/api/auth/signout/route.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
```

### 25. CREATE `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### 26. DELETE default page and START services

```bash
rm -f src/app/page.tsx
supabase start
supabase db reset
pnpm build
```

---

## VALIDATION COMMANDS

```bash
pnpm exec tsc --noEmit    # Type check
pnpm lint                  # Lint
pnpm build                 # Build
supabase status           # DB running
curl http://localhost:3000/api/health  # Health check
```

---

## PLAYWRIGHT VALIDATION

**Config**: Tier 2 | Base URL: http://localhost:3000 | Test User: test@taskflow.dev / TestPassword123!

### Required Test IDs

| Element | Test ID |
|---------|---------|
| Login page | `login-page` |
| Signup page | `signup-page` |
| Email input | `auth-email-input` |
| Password input | `auth-password-input` |
| Confirm password | `auth-confirm-password-input` |
| Submit button | `auth-submit-btn` |
| Error message | `auth-error-message` |
| Dashboard layout | `dashboard-layout` |
| Dashboard page | `dashboard-page` |
| Sign out button | `signout-btn` |

### Flow 1: Signup Happy Path

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | NAVIGATE | /signup | Form visible |
| 2 | TYPE | auth-email-input | `test-{ts}@example.com` |
| 3 | TYPE | auth-password-input | `TestPassword123!` |
| 4 | TYPE | auth-confirm-password-input | `TestPassword123!` |
| 5 | CLICK | auth-submit-btn | Redirects to / |
| 6 | VERIFY | dashboard-page | Dashboard visible |

### Flow 2: Login Happy Path

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | NAVIGATE | /login | Form visible |
| 2 | TYPE | auth-email-input | `test@taskflow.dev` |
| 3 | TYPE | auth-password-input | `TestPassword123!` |
| 4 | CLICK | auth-submit-btn | Redirects to / |
| 5 | VERIFY | dashboard-page | Dashboard visible |

### Flow 3: Login Error

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | NAVIGATE | /login | Form visible |
| 2 | TYPE | auth-email-input | `wrong@email.com` |
| 3 | TYPE | auth-password-input | `wrongpass` |
| 4 | CLICK | auth-submit-btn | Error appears |
| 5 | VERIFY | auth-error-message | Error text visible |

### Flow 4: Protected Route Redirect

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | NAVIGATE | / | (not logged in) |
| 2 | VERIFY | URL | Redirected to /login |

### Flow 5: Sign Out

| Step | Action | Target | Expected |
|------|--------|--------|----------|
| 1 | (logged in) | / | Dashboard visible |
| 2 | CLICK | signout-btn | Signs out |
| 3 | VERIFY | login-page | Login form visible |

---

## ACCEPTANCE CRITERIA

- [ ] Next.js 14 builds without errors
- [ ] Supabase local running with tables created
- [ ] RLS enabled on tasks and user_preferences
- [ ] Signup creates user and redirects to dashboard
- [ ] Login authenticates and redirects to dashboard
- [ ] Protected routes redirect unauthenticated users
- [ ] Sign out clears session
- [ ] All test IDs present on elements
- [ ] Playwright flows pass on Desktop (1280x720) and Mobile (375x667)
