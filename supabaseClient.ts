
import { createClient } from '@supabase/supabase-js';

// GANTI DENGAN URL DAN KEY PROYEK SUPABASE ANDA
// Anda bisa mendapatkannya di Dashboard Supabase -> Project Settings -> API
const SUPABASE_URL = 'https://pjhrvpsanyfpoxlvlhyy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaHJ2cHNhbnlmcG94bHZsaHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MzMzMzQsImV4cCI6MjA4MTQwOTMzNH0.ZGrcd2lGX1eDUSl60XOisB3KKDdHJUyOUofuKn4b_I8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
