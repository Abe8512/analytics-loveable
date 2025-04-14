
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string;
  created_at?: string;
  updated_at?: string;
}
