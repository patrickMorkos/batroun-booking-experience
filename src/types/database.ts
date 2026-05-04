export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          role: "admin" | "super_admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          role?: "admin" | "super_admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          role?: "admin" | "super_admin";
          updated_at?: string;
        };
      };
      chalets: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tagline: string;
          capacity: string | null;
          features: string[];
          weekday_price: number;
          weekend_price: number;
          check_in: string;
          check_out: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tagline: string;
          capacity?: string | null;
          features?: string[];
          weekday_price: number;
          weekend_price: number;
          check_in?: string;
          check_out?: string;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          tagline?: string;
          capacity?: string | null;
          features?: string[];
          weekday_price?: number;
          weekend_price?: number;
          check_in?: string;
          check_out?: string;
          display_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      chalet_images: {
        Row: {
          id: string;
          chalet_id: string;
          storage_path: string;
          url: string;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          chalet_id: string;
          storage_path: string;
          url: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          chalet_id?: string;
          storage_path?: string;
          url?: string;
          display_order?: number;
          is_primary?: boolean;
        };
      };
      page_views: {
        Row: {
          id: string;
          page_path: string;
          chalet_slug: string | null;
          session_id: string;
          user_agent: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          page_path: string;
          chalet_slug?: string | null;
          session_id: string;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          page_path?: string;
          chalet_slug?: string | null;
          session_id?: string;
          user_agent?: string | null;
          referrer?: string | null;
        };
      };
      social_clicks: {
        Row: {
          id: string;
          platform: string;
          session_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          session_id: string;
          created_at?: string;
        };
        Update: {
          platform?: string;
          session_id?: string;
        };
      };
      site_images: {
        Row: {
          id: string;
          slot: string;
          url: string;
          storage_path: string;
          alt: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot: string;
          url: string;
          storage_path: string;
          alt?: string;
          updated_at?: string;
        };
        Update: {
          slot?: string;
          url?: string;
          storage_path?: string;
          alt?: string;
          updated_at?: string;
        };
      };
      gallery_media: {
        Row: {
          id: string;
          url: string;
          storage_path: string;
          type: string;
          title: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          storage_path: string;
          type?: string;
          title?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          url?: string;
          storage_path?: string;
          type?: string;
          title?: string;
          display_order?: number;
        };
      };
      extras: {
        Row: {
          id: string;
          name: string;
          price: number;
          available: boolean;
          note: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price?: number;
          available?: boolean;
          note?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          price?: number;
          available?: boolean;
          note?: string | null;
          display_order?: number;
        };
      };
      amenities: {
        Row: {
          id: string;
          name: string;
          icon: string;
          image_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          image_url?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string;
          image_url?: string | null;
          display_order?: number;
        };
      };
    };
    Functions: {
      get_daily_page_views: {
        Args: { start_date: string; end_date: string };
        Returns: { day: string; count: number }[];
      };
      get_chalet_page_views: {
        Args: { start_date: string; end_date: string };
        Returns: { chalet_slug: string; count: number }[];
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Chalet = Database["public"]["Tables"]["chalets"]["Row"];
export type ChaletInsert = Database["public"]["Tables"]["chalets"]["Insert"];
export type ChaletUpdate = Database["public"]["Tables"]["chalets"]["Update"];
export type ChaletImage = Database["public"]["Tables"]["chalet_images"]["Row"];
export type ChaletImageInsert = Database["public"]["Tables"]["chalet_images"]["Insert"];
export type PageView = Database["public"]["Tables"]["page_views"]["Row"];

export type ChaletWithImages = Chalet & {
  chalet_images: ChaletImage[];
};

export type SiteImage = Database["public"]["Tables"]["site_images"]["Row"];
export type SiteImageInsert = Database["public"]["Tables"]["site_images"]["Insert"];
export type SiteImageUpdate = Database["public"]["Tables"]["site_images"]["Update"];
export type SiteImageSlot = "hero_bg" | "logo" | "amenity_pool" | "amenity_lobby" | "nearby";

export type GalleryMedia = Database["public"]["Tables"]["gallery_media"]["Row"];
export type GalleryMediaInsert = Database["public"]["Tables"]["gallery_media"]["Insert"];
export type GalleryMediaUpdate = Database["public"]["Tables"]["gallery_media"]["Update"];

export type Extra = Database["public"]["Tables"]["extras"]["Row"];
export type ExtraInsert = Database["public"]["Tables"]["extras"]["Insert"];
export type ExtraUpdate = Database["public"]["Tables"]["extras"]["Update"];

export type Amenity = Database["public"]["Tables"]["amenities"]["Row"];
export type AmenityInsert = Database["public"]["Tables"]["amenities"]["Insert"];
export type AmenityUpdate = Database["public"]["Tables"]["amenities"]["Update"];
