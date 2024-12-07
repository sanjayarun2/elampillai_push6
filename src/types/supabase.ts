export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string;
          whatsapp_link: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          content: string;
          date: string;
          author: string;
          image?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blogs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          blog_id: string;
          author: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      push_subscriptions: {
        Row: {
          id: string;
          endpoint: string;
          auth: string;
          p256dh: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          last_used: string | null;
        };
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at' | 'last_used'>;
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>;
      };
    };
  };
}