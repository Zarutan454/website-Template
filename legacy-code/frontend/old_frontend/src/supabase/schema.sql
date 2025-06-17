
-- Create missing tables if they don't exist
DO $$
BEGIN
  -- Create mining_status_history table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name = 'mining_status_history'
  ) THEN
    CREATE TABLE public.mining_status_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      previous_status BOOLEAN NOT NULL,
      new_status BOOLEAN NOT NULL,
      changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      change_reason TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;

  -- Create mining_sessions table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name = 'mining_sessions'
  ) THEN
    CREATE TABLE public.mining_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      end_time TIMESTAMP WITH TIME ZONE,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END
$$;

-- Ensure last_activity_at and daily_reset_at are correctly defined as TIMESTAMP WITH TIME ZONE
DO $$
BEGIN
  -- Update the last_activity_at column type if needed
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mining_stats' 
    AND column_name = 'last_activity_at'
    AND data_type <> 'timestamp with time zone'
  ) THEN
    ALTER TABLE public.mining_stats 
    ALTER COLUMN last_activity_at TYPE TIMESTAMP WITH TIME ZONE 
    USING last_activity_at::TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Update the daily_reset_at column type if needed
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mining_stats' 
    AND column_name = 'daily_reset_at'
    AND data_type <> 'timestamp with time zone'
  ) THEN
    ALTER TABLE public.mining_stats 
    ALTER COLUMN daily_reset_at TYPE TIMESTAMP WITH TIME ZONE 
    USING daily_reset_at::TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Update the created_at column type for mining_activities if needed
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mining_activities' 
    AND column_name = 'created_at'
    AND data_type <> 'timestamp with time zone'
  ) THEN
    ALTER TABLE public.mining_activities 
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE 
    USING created_at::TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Fix the last_heartbeat column type if needed (this is likely the cause of the error)
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mining_stats' 
    AND column_name = 'last_heartbeat'
    AND data_type <> 'timestamp with time zone'
  ) THEN
    ALTER TABLE public.mining_stats 
    ALTER COLUMN last_heartbeat TYPE TIMESTAMP WITH TIME ZONE 
    USING last_heartbeat::TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Ensure mining_status_history and mining_sessions tables have consistent timestamp types
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mining_status_history' 
    AND column_name = 'changed_at'
    AND data_type <> 'timestamp with time zone'
  ) THEN
    ALTER TABLE public.mining_status_history 
    ALTER COLUMN changed_at TYPE TIMESTAMP WITH TIME ZONE 
    USING changed_at::TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mining_sessions' 
    AND column_name = 'start_time'
    AND data_type <> 'timestamp with time zone'
  ) THEN
    ALTER TABLE public.mining_sessions 
    ALTER COLUMN start_time TYPE TIMESTAMP WITH TIME ZONE 
    USING start_time::TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mining_sessions' 
    AND column_name = 'end_time'
    AND data_type <> 'timestamp with time zone'
  ) THEN
    ALTER TABLE public.mining_sessions 
    ALTER COLUMN end_time TYPE TIMESTAMP WITH TIME ZONE 
    USING end_time::TIMESTAMP WITH TIME ZONE;
  END IF;
END
$$;

-- Fix mining tables for realtime support
ALTER TABLE IF EXISTS public.mining_stats REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.mining_activities REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.mining_status_history REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.mining_sessions REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'mining_stats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mining_stats;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'mining_activities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mining_activities;
  END IF;
  
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name = 'mining_status_history'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'mining_status_history'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mining_status_history;
    END IF;
  END IF;
  
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' 
    AND table_name = 'mining_sessions'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'mining_sessions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mining_sessions;
    END IF;
  END IF;
END
$$;

-- Ensure check_daily_mining_limits trigger works on INSERT as well
DROP TRIGGER IF EXISTS check_daily_mining_limits ON public.mining_stats;
CREATE TRIGGER check_daily_mining_limits
  BEFORE INSERT OR UPDATE ON public.mining_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_reset_daily_mining_limits();

-- Create or replace function to clean up stale mining states
CREATE OR REPLACE FUNCTION public.cleanup_stale_mining_states(auto_cleanup BOOLEAN DEFAULT true)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inactive_threshold INTERVAL := '1 hour';
  cleanup_count INTEGER := 0;
  inactive_user RECORD;
BEGIN
  -- Find users who are marked as mining but haven't sent a heartbeat in over an hour
  FOR inactive_user IN
    SELECT user_id
    FROM mining_stats
    WHERE 
      is_mining = true
      AND (
        last_heartbeat IS NULL 
        OR last_heartbeat < (now() - inactive_threshold)
      )
  LOOP
    IF auto_cleanup THEN
      -- Update mining stats to set is_mining to false
      UPDATE mining_stats
      SET 
        is_mining = false,
        updated_at = now()
      WHERE user_id = inactive_user.user_id;
      
      -- Close any open mining sessions if they exist
      IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'mining_sessions'
      ) THEN
        UPDATE mining_sessions
        SET 
          end_time = now(),
          status = 'auto_terminated'
        WHERE 
          user_id = inactive_user.user_id
          AND end_time IS NULL;
      END IF;
        
      -- Log the automatic cleanup if the table exists
      IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'mining_status_history'
      ) THEN
        INSERT INTO mining_status_history (
          user_id,
          previous_status,
          new_status,
          changed_at,
          change_reason
        ) VALUES (
          inactive_user.user_id,
          true,
          false,
          now(),
          'auto_cleanup'
        );
      END IF;
    END IF;
    
    cleanup_count := cleanup_count + 1;
  END LOOP;
  
  RETURN cleanup_count;
END;
$$;
