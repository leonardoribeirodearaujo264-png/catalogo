import type { User } from "@supabase/supabase-js";

export type { User };

export interface AuthState {
  user: User | null;
  loading: boolean;
}
