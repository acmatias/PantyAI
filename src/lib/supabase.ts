import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      pantry_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          quantity: number | null;
          category: string;
          expiry_date: string | null;
          image_url: string | null;
          confidence_score: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          quantity?: number | null;
          category?: string;
          expiry_date?: string | null;
          image_url?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          quantity?: number | null;
          category?: string;
          expiry_date?: string | null;
          image_url?: string | null;
          confidence_score?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}