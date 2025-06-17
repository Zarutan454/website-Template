
interface SupabaseResponse<T> {
  data: T | null;
  error: unknown;
}

interface SupabaseFunctions {
  invoke: (name: string, options?: { body?: any }) => Promise<{ data: any; error: any }>;
}

interface SupabaseStorage {
  from: (bucket: string) => {
    upload: (path: string, file: File) => Promise<{ data: any; error: any }>;
    getPublicUrl: (path: string) => { data: { publicUrl: string } };
  };
}

interface SupabaseAuth {
  getUser: () => Promise<{ data: { user: any | null }; error: any | null }>;
  signIn: (options: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any | null }>;
}

interface SupabaseQueryBuilder<T> {
  select: (columns?: string) => SupabaseQueryBuilder<T>;
  eq: (column: string, value: any) => SupabaseQueryBuilder<T>;
  in: (column: string, values: any[]) => SupabaseQueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseQueryBuilder<T>;
  limit: (count: number) => Promise<SupabaseResponse<T[]>>;
  single: () => Promise<SupabaseResponse<T>>;
  maybeSingle: () => Promise<SupabaseResponse<T>>;
}

interface SupabaseMutationBuilder<T> {
  insert: (data: any) => SupabaseMutationBuilder<T>;
  upsert: (data: any) => SupabaseMutationBuilder<T>;
  update: (data: any) => SupabaseMutationBuilder<T>;
  eq: (column: string, value: any) => SupabaseMutationBuilder<T>;
  select: (columns?: string) => SupabaseMutationBuilder<T>;
  single: () => Promise<SupabaseResponse<T>>;
  maybeSingle: () => Promise<SupabaseResponse<T>>;
}

interface SupabaseClientInterface {
  from: <T>(table: string) => {
    select: (columns?: string) => SupabaseQueryBuilder<T>;
    insert: (data: any) => SupabaseMutationBuilder<T>;
    update: (data: any) => SupabaseMutationBuilder<T>;
    upsert: (data: any) => SupabaseMutationBuilder<T>;
    delete: () => SupabaseMutationBuilder<T>;
  };
  auth: SupabaseAuth;
  storage: SupabaseStorage;
  functions: SupabaseFunctions;
}

import { supabase as realSupabase } from '@/lib/supabase';

export const supabase = realSupabase;
