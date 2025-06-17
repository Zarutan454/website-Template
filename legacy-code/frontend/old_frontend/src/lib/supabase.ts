
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
export const supabase = createClient(
  'https://xhdjkcrzdjjihtwkhhro.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZGprY3J6ZGpqaWh0d2toaHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMzgxNTcsImV4cCI6MjA1NjkxNDE1N30.ItSJqdGYJJpin_GLCxGqwK4OqzoGrKASlVTUBPCkdKI'
);
