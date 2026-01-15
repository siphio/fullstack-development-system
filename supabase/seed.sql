-- Test user: test@taskflow.dev / TestPassword123!
-- Sample tasks seeded after user signs up via the trigger
-- Run `supabase db reset` after test user creation to populate tasks

-- Function to seed test tasks for a given user
CREATE OR REPLACE FUNCTION seed_test_tasks(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_monday DATE := v_today - ((EXTRACT(ISODOW FROM v_today)::INT - 1) || ' days')::INTERVAL;
BEGIN
  -- Delete existing tasks for this user
  DELETE FROM tasks WHERE user_id = p_user_id;

  -- Insert sample tasks across the week
  INSERT INTO tasks (user_id, title, description, scheduled_date, position, category, is_completed, completed_at)
  VALUES
    -- Monday
    (p_user_id, 'Team standup', 'Daily sync with engineering team', v_monday, 0, 'meeting', true, NOW()),
    (p_user_id, 'Review PRs', 'Check open pull requests', v_monday, 1, 'general', false, NULL),

    -- Tuesday
    (p_user_id, 'Client call', 'Discuss Q1 objectives with client', v_monday + INTERVAL '1 day', 0, 'meeting', false, NULL),
    (p_user_id, 'Update documentation', NULL, v_monday + INTERVAL '1 day', 1, 'general', false, NULL),

    -- Wednesday
    (p_user_id, 'Sprint planning', 'Plan next sprint tasks', v_monday + INTERVAL '2 days', 0, 'meeting', false, NULL),
    (p_user_id, 'Urgent bug fix', 'Fix critical production issue', v_monday + INTERVAL '2 days', 1, 'urgent', false, NULL),

    -- Thursday
    (p_user_id, '1:1 with manager', 'Weekly check-in', v_monday + INTERVAL '3 days', 0, 'meeting', false, NULL),
    (p_user_id, 'Code review', 'Review feature branch', v_monday + INTERVAL '3 days', 1, 'general', false, NULL),

    -- Friday
    (p_user_id, 'Deploy to staging', 'Push release candidate', v_monday + INTERVAL '4 days', 0, 'urgent', false, NULL),
    (p_user_id, 'Week retrospective', 'Document learnings', v_monday + INTERVAL '4 days', 1, 'general', false, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
