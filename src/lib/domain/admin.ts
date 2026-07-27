import type { AdminRole } from "./enums";

export interface AdminProfile {
  user_id: string;
  full_name: string | null;
  avatar_media_asset_id: string | null;
  role: AdminRole;
}

export interface AdminSession {
  user_id: string;
  email: string;
  profile: AdminProfile;
}
