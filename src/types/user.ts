export interface User {
  id: number | string;
  username: string;
  first_name: string;
  last_name: string;
  email?: string;
  role?: string;
  avatar?: string;
  profile_picture_data?: string;
}