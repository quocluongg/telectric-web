export interface Profile {
    id: string;
    updated_at: string | null;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    website: string | null;
    email: string | null;
    role: 'user' | 'admin' | 'moderator';
}
