export interface Database {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: string;
          title: string;
          content: string;
          date: string;
          author: string;
          image?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blogs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>;
      };
      shops: {
        Row: {
          id: string;
          name: string;
          address: string;
          description: string;
          rating: number;
          phone?: string;
          category: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shops']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['shops']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          seller: string;
          whatsapp_link: string;
          image: string;
          category: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      settings: {
        Row: {
          id: string;
          whatsapp_link: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
    };
  };
}