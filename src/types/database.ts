export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          image: string | null;
          subscription_status: 'free' | 'premium';
          subscription_start: string | null;
          subscription_end: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          role: 'user' | 'admin';
          blocked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          image?: string | null;
          subscription_status?: 'free' | 'premium';
          subscription_start?: string | null;
          subscription_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          role?: 'user' | 'admin';
          blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          image?: string | null;
          subscription_status?: 'free' | 'premium';
          subscription_start?: string | null;
          subscription_end?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          role?: 'user' | 'admin';
          blocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
