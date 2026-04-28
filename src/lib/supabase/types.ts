// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      affiliation_plans: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          description: string | null
          duration_months: number | null
          id: string
          name: string
          price: number | null
          status: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          duration_months?: number | null
          id?: string
          name: string
          price?: number | null
          status?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          duration_months?: number | null
          id?: string
          name?: string
          price?: number | null
          status?: string | null
        }
        Relationships: []
      }
      athlete_attribute_values: {
        Row: {
          attribute_id: string | null
          data_registro: string
          id: string
          user_id: string | null
          valor: string | null
        }
        Insert: {
          attribute_id?: string | null
          data_registro?: string
          id?: string
          user_id?: string | null
          valor?: string | null
        }
        Update: {
          attribute_id?: string | null
          data_registro?: string
          id?: string
          user_id?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'athlete_attribute_values_attribute_id_fkey'
            columns: ['attribute_id']
            isOneToOne: false
            referencedRelation: 'athlete_attributes'
            referencedColumns: ['id']
          },
        ]
      }
      athlete_attributes: {
        Row: {
          created_at: string
          id: string
          nome: string | null
          tipo_dado: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string | null
          tipo_dado?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
          tipo_dado?: string | null
        }
        Relationships: []
      }
      athlete_categories: {
        Row: {
          active_from: string | null
          active_to: string | null
          athlete_id: string | null
          category_id: string | null
          id: string
        }
        Insert: {
          active_from?: string | null
          active_to?: string | null
          athlete_id?: string | null
          category_id?: string | null
          id?: string
        }
        Update: {
          active_from?: string | null
          active_to?: string | null
          athlete_id?: string | null
          category_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'athlete_categories_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'athletes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'athlete_categories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      athletes: {
        Row: {
          address: string | null
          birth_date: string | null
          category: string | null
          category_id: string | null
          club_id: string | null
          cpf: string | null
          created_at: string
          email: string | null
          gender: string | null
          handicap: number | null
          id: string
          is_club_admin: boolean | null
          name: string
          nationality: string | null
          naturalness: string | null
          phone: string | null
          photo_url: string | null
          points: number | null
          rg: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          category?: string | null
          category_id?: string | null
          club_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          handicap?: number | null
          id?: string
          is_club_admin?: boolean | null
          name: string
          nationality?: string | null
          naturalness?: string | null
          phone?: string | null
          photo_url?: string | null
          points?: number | null
          rg?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          category?: string | null
          category_id?: string | null
          club_id?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          handicap?: number | null
          id?: string
          is_club_admin?: boolean | null
          name?: string
          nationality?: string | null
          naturalness?: string | null
          phone?: string | null
          photo_url?: string | null
          points?: number | null
          rg?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'athletes_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'athletes_club_id_fkey'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      billing_configuration: {
        Row: {
          auto_generate_enabled: boolean | null
          created_at: string | null
          days_before_generation: number | null
          due_day: number | null
          due_month: number | null
          id: string
          reminder_days_after: number | null
          reminder_days_before: number | null
          reminders_enabled: boolean | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_generate_enabled?: boolean | null
          created_at?: string | null
          days_before_generation?: number | null
          due_day?: number | null
          due_month?: number | null
          id?: string
          reminder_days_after?: number | null
          reminder_days_before?: number | null
          reminders_enabled?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_generate_enabled?: boolean | null
          created_at?: string | null
          days_before_generation?: number | null
          due_day?: number | null
          due_month?: number | null
          id?: string
          reminder_days_after?: number | null
          reminder_days_before?: number | null
          reminders_enabled?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      billing_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          execution_date: string | null
          id: string
          status: string | null
          tenant_id: string | null
          total_duplicates_avoided: number | null
          total_generated: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          execution_date?: string | null
          id?: string
          status?: string | null
          tenant_id?: string | null
          total_duplicates_avoided?: number | null
          total_generated?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          execution_date?: string | null
          id?: string
          status?: string | null
          tenant_id?: string | null
          total_duplicates_avoided?: number | null
          total_generated?: number | null
        }
        Relationships: []
      }
      billing_registration_config: {
        Row: {
          athlete_registration_amount: number | null
          club_registration_amount: number | null
          created_at: string
          id: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          athlete_registration_amount?: number | null
          club_registration_amount?: number | null
          created_at?: string
          id?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          athlete_registration_amount?: number | null
          club_registration_amount?: number | null
          created_at?: string
          id?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      billing_reminders_log: {
        Row: {
          athlete_id: string | null
          charge_id: string | null
          id: string
          reminder_type: string | null
          sent_at: string
        }
        Insert: {
          athlete_id?: string | null
          charge_id?: string | null
          id?: string
          reminder_type?: string | null
          sent_at?: string
        }
        Update: {
          athlete_id?: string | null
          charge_id?: string | null
          id?: string
          reminder_type?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'billing_reminders_log_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'athletes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'billing_reminders_log_charge_id_fkey'
            columns: ['charge_id']
            isOneToOne: false
            referencedRelation: 'financial_charges'
            referencedColumns: ['id']
          },
        ]
      }
      blog_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string | null
          status: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          status?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'blog_comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'blog_posts'
            referencedColumns: ['id']
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          conclusion: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          introduction: string | null
          is_active: boolean | null
          published_at: string | null
          status: string | null
          summary: string | null
          tags: Json | null
          title: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          conclusion?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          introduction?: string | null
          is_active?: boolean | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          tags?: Json | null
          title: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          conclusion?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          introduction?: string | null
          is_active?: boolean | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          tags?: Json | null
          title?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'cart_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          age_range: string | null
          created_at: string
          description: string | null
          gender: string | null
          icon: string | null
          id: string
          max_age: number | null
          min_age: number | null
          name: string
          status: string | null
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          icon?: string | null
          id?: string
          max_age?: number | null
          min_age?: number | null
          name: string
          status?: string | null
        }
        Update: {
          age_range?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          icon?: string | null
          id?: string
          max_age?: number | null
          min_age?: number | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      clubs: {
        Row: {
          address: string | null
          affiliation_status: string | null
          city: string | null
          cnpj: string | null
          contact: string | null
          created_at: string
          email: string | null
          financial_status: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          state: string | null
          status: string | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          affiliation_status?: string | null
          city?: string | null
          cnpj?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          financial_status?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          state?: string | null
          status?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          affiliation_status?: string | null
          city?: string | null
          cnpj?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          financial_status?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          status?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          club_id: string | null
          created_at: string
          description: string | null
          difficulty_rating: string | null
          handicap_rating: number | null
          holes: number | null
          id: string
          image_url: string | null
          instructor: string | null
          name: string
          par: number | null
          slope_rating: number | null
          spots: number | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_rating?: string | null
          handicap_rating?: number | null
          holes?: number | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          name: string
          par?: number | null
          slope_rating?: number | null
          spots?: number | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          club_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_rating?: string | null
          handicap_rating?: number | null
          holes?: number | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          name?: string
          par?: number | null
          slope_rating?: number | null
          spots?: number | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'courses_club_id_fkey'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          flow_type: string | null
          id: string
          provider: string | null
          recipient_email: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          flow_type?: string | null
          id?: string
          provider?: string | null
          recipient_email?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          flow_type?: string | null
          id?: string
          provider?: string | null
          recipient_email?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      event_photos: {
        Row: {
          event_id: string | null
          id: string
          photo_url: string
          uploaded_at: string
        }
        Insert: {
          event_id?: string | null
          id?: string
          photo_url: string
          uploaded_at?: string
        }
        Update: {
          event_id?: string | null
          id?: string
          photo_url?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'event_photos_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      event_registrations: {
        Row: {
          athlete_id: string | null
          created_at: string
          event_id: string | null
          id: string
          registration_date: string
          status: string | null
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          registration_date?: string
          status?: string | null
        }
        Update: {
          athlete_id?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          registration_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'event_registrations_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'athletes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'event_registrations_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          club_id: string | null
          created_at: string
          current_participants: number | null
          date: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          id: string
          image_url: string | null
          location: string | null
          max_participants: number | null
          name: string
          photos: Json | null
          post_link: string | null
          price_registration: number | null
          price_ticket: number | null
          regulation_url: string | null
          status: string | null
          time: string | null
        }
        Insert: {
          category?: string | null
          club_id?: string | null
          created_at?: string
          current_participants?: number | null
          date?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_participants?: number | null
          name: string
          photos?: Json | null
          post_link?: string | null
          price_registration?: number | null
          price_ticket?: number | null
          regulation_url?: string | null
          status?: string | null
          time?: string | null
        }
        Update: {
          category?: string | null
          club_id?: string | null
          created_at?: string
          current_participants?: number | null
          date?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_participants?: number | null
          name?: string
          photos?: Json | null
          post_link?: string | null
          price_registration?: number | null
          price_ticket?: number | null
          regulation_url?: string | null
          status?: string | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'events_club_id_fkey'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
        ]
      }
      financial_charges: {
        Row: {
          amount: number
          athlete_id: string | null
          category: string | null
          client_name: string
          created_at: string
          description: string | null
          document: string | null
          due_date: string
          id: string
          payment_date: string | null
          status: string
          type: string | null
        }
        Insert: {
          amount: number
          athlete_id?: string | null
          category?: string | null
          client_name: string
          created_at?: string
          description?: string | null
          document?: string | null
          due_date: string
          id?: string
          payment_date?: string | null
          status?: string
          type?: string | null
        }
        Update: {
          amount?: number
          athlete_id?: string | null
          category?: string | null
          client_name?: string
          created_at?: string
          description?: string | null
          document?: string | null
          due_date?: string
          id?: string
          payment_date?: string | null
          status?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'financial_charges_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'athletes'
            referencedColumns: ['id']
          },
        ]
      }
      financial_partners: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      google_ads_cache: {
        Row: {
          campaign_id: string
          campaign_name: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          date: string
          id: string
          impressions: number | null
          last_updated: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          campaign_name: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          date?: string
          id?: string
          impressions?: number | null
          last_updated?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          campaign_name?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          date?: string
          id?: string
          impressions?: number | null
          last_updated?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hero_carousel: {
        Row: {
          button_text: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_published: boolean | null
          link_url: string | null
          media_type: string
          media_url: string
          title: string | null
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_published?: boolean | null
          link_url?: string | null
          media_type?: string
          media_url: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_published?: boolean | null
          link_url?: string | null
          media_type?: string
          media_url?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_config: {
        Row: {
          bg_color: string
          bg_image_url: string | null
          created_at: string
          facebook_url: string | null
          font_family: string
          id: string
          instagram_url: string | null
          is_active: boolean
          message: string
          return_date: string | null
          text_color: string
          title: string
          updated_at: string
          whatsapp_url: string | null
        }
        Insert: {
          bg_color?: string
          bg_image_url?: string | null
          created_at?: string
          facebook_url?: string | null
          font_family?: string
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          message?: string
          return_date?: string | null
          text_color?: string
          title?: string
          updated_at?: string
          whatsapp_url?: string | null
        }
        Update: {
          bg_color?: string
          bg_image_url?: string | null
          created_at?: string
          facebook_url?: string | null
          font_family?: string
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          message?: string
          return_date?: string | null
          text_color?: string
          title?: string
          updated_at?: string
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      media_items: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          id: string
          tags: string[] | null
          title: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          id?: string
          tags?: string[] | null
          title?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          id?: string
          tags?: string[] | null
          title?: string | null
          type?: string
          url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          price: number | null
          product_id: string | null
          quantity: number | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          quantity?: number | null
        }
        Update: {
          id?: string
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          athlete_id: string | null
          created_at: string
          delivery_address: string | null
          discount: number | null
          id: string
          payment_method: string | null
          status: string | null
          total_price: number | null
          user_id: string | null
        }
        Insert: {
          athlete_id?: string | null
          created_at?: string
          delivery_address?: string | null
          discount?: number | null
          id?: string
          payment_method?: string | null
          status?: string | null
          total_price?: number | null
          user_id?: string | null
        }
        Update: {
          athlete_id?: string | null
          created_at?: string
          delivery_address?: string | null
          discount?: number | null
          id?: string
          payment_method?: string | null
          status?: string | null
          total_price?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'orders_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'athletes'
            referencedColumns: ['id']
          },
        ]
      }
      pages: {
        Row: {
          blocks: Json | null
          created_at: string
          display_order: number
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json | null
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json | null
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number | null
          rating: number | null
          stock: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          rating?: number | null
          stock?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          rating?: number | null
          stock?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          financial_status: string | null
          id: string
          name: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          financial_status?: string | null
          id: string
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          financial_status?: string | null
          id?: string
          name?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      rankings: {
        Row: {
          athlete_id: string | null
          club_ranking: number | null
          id: string
          national_ranking: number | null
          points: number | null
          state_ranking: number | null
          updated_at: string | null
          world_ranking: number | null
        }
        Insert: {
          athlete_id?: string | null
          club_ranking?: number | null
          id?: string
          national_ranking?: number | null
          points?: number | null
          state_ranking?: number | null
          updated_at?: string | null
          world_ranking?: number | null
        }
        Update: {
          athlete_id?: string | null
          club_ranking?: number | null
          id?: string
          national_ranking?: number | null
          points?: number | null
          state_ranking?: number | null
          updated_at?: string | null
          world_ranking?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'rankings_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: true
            referencedRelation: 'athletes'
            referencedColumns: ['id']
          },
        ]
      }
      registration_payments: {
        Row: {
          created_at: string
          data_pagamento: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metodo_pagamento: string | null
          payment_intent_id: string | null
          status: string | null
          tenant_id: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string
          data_pagamento?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metodo_pagamento?: string | null
          payment_intent_id?: string | null
          status?: string | null
          tenant_id?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string
          data_pagamento?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metodo_pagamento?: string | null
          payment_intent_id?: string | null
          status?: string | null
          tenant_id?: string | null
          valor?: number | null
        }
        Relationships: []
      }
      rule_versions: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          rule_id: string | null
          version: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          rule_id?: string | null
          version: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          rule_id?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rule_versions_rule_id_fkey'
            columns: ['rule_id']
            isOneToOne: false
            referencedRelation: 'rules'
            referencedColumns: ['id']
          },
        ]
      }
      rules: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          status: string | null
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      sections: {
        Row: {
          created_at: string
          data: Json | null
          display_order: number
          id: string
          is_published: boolean | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          display_order?: number
          id?: string
          is_published?: boolean | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          display_order?: number
          id?: string
          is_published?: boolean | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_config: {
        Row: {
          card_fee_fixed: number | null
          card_fee_percentage: number | null
          created_at: string
          id: string
          pass_fees_to_customer: boolean | null
          pix_enabled: boolean | null
          public_key: string | null
          secret_key: string | null
          tenant_id: string | null
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          card_fee_fixed?: number | null
          card_fee_percentage?: number | null
          created_at?: string
          id?: string
          pass_fees_to_customer?: boolean | null
          pix_enabled?: boolean | null
          public_key?: string | null
          secret_key?: string | null
          tenant_id?: string | null
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          card_fee_fixed?: number | null
          card_fee_percentage?: number | null
          created_at?: string
          id?: string
          pass_fees_to_customer?: boolean | null
          pix_enabled?: boolean | null
          public_key?: string | null
          secret_key?: string | null
          tenant_id?: string | null
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: []
      }
      stripe_payments: {
        Row: {
          atleta_id: string | null
          charge_id: string | null
          data_criacao: string
          data_pagamento: string | null
          id: string
          metodo_pagamento: string | null
          payment_intent_id: string | null
          status: string | null
          tenant_id: string | null
          valor: number | null
        }
        Insert: {
          atleta_id?: string | null
          charge_id?: string | null
          data_criacao?: string
          data_pagamento?: string | null
          id?: string
          metodo_pagamento?: string | null
          payment_intent_id?: string | null
          status?: string | null
          tenant_id?: string | null
          valor?: number | null
        }
        Update: {
          atleta_id?: string | null
          charge_id?: string | null
          data_criacao?: string
          data_pagamento?: string | null
          id?: string
          metodo_pagamento?: string | null
          payment_intent_id?: string | null
          status?: string | null
          tenant_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'stripe_payments_atleta_id_fkey'
            columns: ['atleta_id']
            isOneToOne: false
            referencedRelation: 'athletes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'stripe_payments_charge_id_fkey'
            columns: ['charge_id']
            isOneToOne: false
            referencedRelation: 'financial_charges'
            referencedColumns: ['id']
          },
        ]
      }
      system_data: {
        Row: {
          active_theme: string | null
          address_city: string | null
          address_complement: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          ai_context: string | null
          bg_image_url: string | null
          bg_opacity: number | null
          browser_icon_url: string | null
          business_hours: Json | null
          cnpj: string | null
          dark_mode: boolean | null
          email: string | null
          id: string
          integrations: Json | null
          language: string | null
          libras_enabled: boolean | null
          logo_url: string | null
          menu_logo_size: number | null
          mobile: string | null
          phone: string | null
          platform_name: string | null
          quote_footer_text: string | null
          razao_social: string | null
          records_per_page: number | null
          responsible_cpf: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          responsible_role: string | null
          session_lifetime: number | null
          show_cnpj: boolean | null
          show_contact_bar: boolean | null
          slogan: string | null
          terms: Json | null
          two_factor_auth: boolean | null
          two_factor_method: string | null
          updated_at: string | null
        }
        Insert: {
          active_theme?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          ai_context?: string | null
          bg_image_url?: string | null
          bg_opacity?: number | null
          browser_icon_url?: string | null
          business_hours?: Json | null
          cnpj?: string | null
          dark_mode?: boolean | null
          email?: string | null
          id?: string
          integrations?: Json | null
          language?: string | null
          libras_enabled?: boolean | null
          logo_url?: string | null
          menu_logo_size?: number | null
          mobile?: string | null
          phone?: string | null
          platform_name?: string | null
          quote_footer_text?: string | null
          razao_social?: string | null
          records_per_page?: number | null
          responsible_cpf?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          responsible_role?: string | null
          session_lifetime?: number | null
          show_cnpj?: boolean | null
          show_contact_bar?: boolean | null
          slogan?: string | null
          terms?: Json | null
          two_factor_auth?: boolean | null
          two_factor_method?: string | null
          updated_at?: string | null
        }
        Update: {
          active_theme?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          ai_context?: string | null
          bg_image_url?: string | null
          bg_opacity?: number | null
          browser_icon_url?: string | null
          business_hours?: Json | null
          cnpj?: string | null
          dark_mode?: boolean | null
          email?: string | null
          id?: string
          integrations?: Json | null
          language?: string | null
          libras_enabled?: boolean | null
          logo_url?: string | null
          menu_logo_size?: number | null
          mobile?: string | null
          phone?: string | null
          platform_name?: string | null
          quote_footer_text?: string | null
          razao_social?: string | null
          records_per_page?: number | null
          responsible_cpf?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          responsible_role?: string | null
          session_lifetime?: number | null
          show_cnpj?: boolean | null
          show_contact_bar?: boolean | null
          slogan?: string | null
          terms?: Json | null
          two_factor_auth?: boolean | null
          two_factor_method?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          account_sid: string | null
          api_provider: string | null
          auth_token: string | null
          created_at: string
          empresa_id: string | null
          id: string
          is_active: boolean | null
          is_production: boolean | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          account_sid?: string | null
          api_provider?: string | null
          auth_token?: string | null
          created_at?: string
          empresa_id?: string | null
          id?: string
          is_active?: boolean | null
          is_production?: boolean | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          account_sid?: string | null
          api_provider?: string | null
          auth_token?: string | null
          created_at?: string
          empresa_id?: string | null
          id?: string
          is_active?: boolean | null
          is_production?: boolean | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          cliente_id: string | null
          created_at: string
          empresa_id: string | null
          id: string
          resposta_api: Json | null
          status: string | null
          telefone: string | null
          tipo_mensagem: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          empresa_id?: string | null
          id?: string
          resposta_api?: Json | null
          status?: string | null
          telefone?: string | null
          tipo_mensagem?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          empresa_id?: string | null
          id?: string
          resposta_api?: Json | null
          status?: string | null
          telefone?: string | null
          tipo_mensagem?: string | null
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          conteudo: string | null
          created_at: string
          id: string
          is_active: boolean | null
          tipo_mensagem: string | null
          updated_at: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          tipo_mensagem?: string | null
          updated_at?: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          tipo_mensagem?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: affiliation_plans
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   benefits: _text (nullable)
//   price: numeric (nullable, default: 0)
//   duration_months: integer (nullable, default: 12)
//   status: text (nullable, default: 'active'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: athlete_attribute_values
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   attribute_id: uuid (nullable)
//   valor: text (nullable)
//   data_registro: timestamp with time zone (not null, default: now())
// Table: athlete_attributes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (nullable)
//   tipo_dado: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: athlete_categories
//   id: uuid (not null, default: gen_random_uuid())
//   athlete_id: uuid (nullable)
//   category_id: uuid (nullable)
//   active_from: date (nullable)
//   active_to: date (nullable)
// Table: athletes
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   club_id: uuid (nullable)
//   name: text (not null)
//   handicap: numeric (nullable)
//   category: text (nullable)
//   birth_date: date (nullable)
//   cpf: text (nullable)
//   phone: text (nullable)
//   photo_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   email: text (nullable)
//   is_club_admin: boolean (nullable, default: false)
//   points: integer (nullable, default: 0)
//   gender: text (nullable)
//   rg: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   category_id: uuid (nullable)
//   nationality: text (nullable)
//   naturalness: text (nullable)
//   address: text (nullable)
// Table: audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   table_name: text (not null)
//   record_id: uuid (not null)
//   action: text (not null)
//   old_data: jsonb (nullable)
//   new_data: jsonb (nullable)
//   changed_by: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: billing_configuration
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (nullable, default: '00000000-0000-0000-0000-000000000001'::uuid)
//   auto_generate_enabled: boolean (nullable, default: false)
//   due_day: integer (nullable)
//   due_month: integer (nullable)
//   days_before_generation: integer (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   reminders_enabled: boolean (nullable, default: false)
//   reminder_days_before: integer (nullable, default: 3)
//   reminder_days_after: integer (nullable, default: 5)
// Table: billing_logs
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (nullable, default: '00000000-0000-0000-0000-000000000001'::uuid)
//   execution_date: timestamp with time zone (nullable, default: now())
//   status: text (nullable)
//   total_generated: integer (nullable, default: 0)
//   total_duplicates_avoided: integer (nullable, default: 0)
//   error_message: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: billing_registration_config
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (nullable, default: '00000000-0000-0000-0000-000000000001'::uuid)
//   athlete_registration_amount: numeric (nullable, default: 150.0)
//   club_registration_amount: numeric (nullable, default: 500.0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: billing_reminders_log
//   id: uuid (not null, default: gen_random_uuid())
//   charge_id: uuid (nullable)
//   athlete_id: uuid (nullable)
//   reminder_type: text (nullable)
//   sent_at: timestamp with time zone (not null, default: now())
// Table: blog_comments
//   id: uuid (not null, default: gen_random_uuid())
//   post_id: uuid (nullable)
//   author_name: text (not null)
//   content: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: blog_posts
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   content: text (nullable)
//   category: text (nullable)
//   author_id: uuid (nullable)
//   published_at: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   image_url: text (nullable)
//   summary: text (nullable)
//   tags: jsonb (nullable, default: '[]'::jsonb)
//   introduction: text (nullable)
//   conclusion: text (nullable)
//   status: text (nullable, default: 'draft'::text)
//   is_active: boolean (nullable, default: true)
// Table: cart_items
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   product_id: uuid (nullable)
//   quantity: integer (nullable, default: 1)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: categories
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   age_range: text (nullable)
//   gender: text (nullable)
//   description: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   min_age: integer (nullable)
//   max_age: integer (nullable)
//   icon: text (nullable)
//   status: text (nullable, default: 'active'::text)
// Table: clubs
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   city: text (nullable)
//   state: text (nullable)
//   contact: text (nullable)
//   logo_url: text (nullable)
//   verified: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   affiliation_status: text (nullable, default: 'active'::text)
//   cnpj: text (nullable)
//   address: text (nullable)
//   phone: text (nullable)
//   email: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   financial_status: text (nullable, default: 'normal'::text)
// Table: courses
//   id: uuid (not null, default: gen_random_uuid())
//   club_id: uuid (nullable)
//   name: text (not null)
//   holes: integer (nullable)
//   par: integer (nullable)
//   difficulty_rating: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   handicap_rating: numeric (nullable)
//   slope_rating: integer (nullable)
//   status: text (nullable, default: 'active'::text)
//   description: text (nullable)
//   instructor: text (nullable)
//   start_date: date (nullable)
//   spots: integer (nullable)
//   image_url: text (nullable)
// Table: email_logs
//   id: uuid (not null, default: gen_random_uuid())
//   recipient_email: text (nullable)
//   subject: text (nullable)
//   flow_type: text (nullable)
//   status: text (nullable)
//   provider: text (nullable)
//   error_message: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: event_photos
//   id: uuid (not null, default: gen_random_uuid())
//   event_id: uuid (nullable)
//   photo_url: text (not null)
//   uploaded_at: timestamp with time zone (not null, default: now())
// Table: event_registrations
//   id: uuid (not null, default: gen_random_uuid())
//   event_id: uuid (nullable)
//   athlete_id: uuid (nullable)
//   status: text (nullable)
//   registration_date: timestamp with time zone (not null, default: now())
//   created_at: timestamp with time zone (not null, default: now())
// Table: events
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   date: date (nullable)
//   time: time without time zone (nullable)
//   location: text (nullable)
//   description: text (nullable)
//   max_participants: integer (nullable)
//   current_participants: integer (nullable, default: 0)
//   category: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   image_url: text (nullable)
//   club_id: uuid (nullable)
//   status: text (nullable, default: 'published'::text)
//   end_date: date (nullable)
//   regulation_url: text (nullable)
//   price_registration: numeric (nullable, default: 0)
//   price_ticket: numeric (nullable, default: 0)
//   photos: jsonb (nullable, default: '[]'::jsonb)
//   post_link: text (nullable)
//   event_type: text (nullable)
// Table: financial_charges
//   id: uuid (not null, default: gen_random_uuid())
//   client_name: text (not null)
//   amount: numeric (not null)
//   due_date: date (not null)
//   description: text (nullable)
//   status: text (not null, default: 'pendente'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   type: text (nullable, default: 'receivable'::text)
//   category: text (nullable, default: 'general'::text)
//   document: text (nullable)
//   payment_date: date (nullable)
//   athlete_id: uuid (nullable)
// Table: financial_partners
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   document: text (nullable)
//   type: text (nullable, default: 'client'::text)
//   email: text (nullable)
//   phone: text (nullable)
//   status: text (nullable, default: 'active'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: google_ads_cache
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   campaign_id: text (not null)
//   campaign_name: text (not null)
//   impressions: integer (nullable, default: 0)
//   clicks: integer (nullable, default: 0)
//   cost: numeric (nullable, default: 0)
//   conversions: integer (nullable, default: 0)
//   date: date (not null, default: CURRENT_DATE)
//   last_updated: timestamp with time zone (nullable, default: now())
// Table: hero_carousel
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (nullable)
//   description: text (nullable)
//   media_type: text (not null, default: 'image'::text)
//   media_url: text (not null)
//   link_url: text (nullable)
//   button_text: text (nullable)
//   display_order: integer (not null, default: 0)
//   is_published: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: maintenance_config
//   id: uuid (not null, default: gen_random_uuid())
//   is_active: boolean (not null, default: false)
//   title: text (not null, default: 'Estamos em Manutenção'::text)
//   message: text (not null, default: 'Estamos trabalhando para melhorar sua experiência. Voltaremos em breve!'::text)
//   return_date: timestamp with time zone (nullable)
//   bg_color: text (not null, default: '#ffffff'::text)
//   text_color: text (not null, default: '#333333'::text)
//   font_family: text (not null, default: 'sans-serif'::text)
//   bg_image_url: text (nullable)
//   whatsapp_url: text (nullable)
//   instagram_url: text (nullable)
//   facebook_url: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: media_items
//   id: uuid (not null, default: gen_random_uuid())
//   file_name: text (not null)
//   url: text (not null)
//   type: text (not null)
//   title: text (nullable)
//   description: text (nullable)
//   tags: _text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   message: text (not null)
//   type: text (not null, default: 'system'::text)
//   is_read: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
// Table: order_items
//   id: uuid (not null, default: gen_random_uuid())
//   order_id: uuid (nullable)
//   product_id: uuid (nullable)
//   quantity: integer (nullable)
//   price: numeric (nullable)
// Table: orders
//   id: uuid (not null, default: gen_random_uuid())
//   athlete_id: uuid (nullable)
//   total_price: numeric (nullable)
//   status: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   user_id: uuid (nullable)
//   delivery_address: text (nullable)
//   payment_method: text (nullable)
//   discount: numeric (nullable, default: 0)
// Table: pages
//   id: uuid (not null, default: gen_random_uuid())
//   slug: text (not null)
//   title: text (not null)
//   meta_title: text (nullable)
//   meta_description: text (nullable)
//   meta_keywords: text (nullable)
//   blocks: jsonb (nullable, default: '[]'::jsonb)
//   is_published: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   display_order: integer (not null, default: 0)
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   price: numeric (nullable)
//   image_url: text (nullable)
//   category: text (nullable)
//   stock: integer (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   rating: numeric (nullable, default: 5.0)
// Table: profiles
//   id: uuid (not null)
//   email: text (nullable)
//   name: text (nullable)
//   role: text (nullable, default: 'athlete'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   status: text (nullable, default: 'active'::text)
//   financial_status: text (nullable, default: 'normal'::text)
// Table: rankings
//   id: uuid (not null, default: gen_random_uuid())
//   athlete_id: uuid (nullable)
//   club_ranking: integer (nullable)
//   state_ranking: integer (nullable)
//   national_ranking: integer (nullable)
//   world_ranking: integer (nullable)
//   points: integer (nullable, default: 0)
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: registration_payments
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (nullable, default: '00000000-0000-0000-0000-000000000001'::uuid)
//   payment_intent_id: text (nullable)
//   entity_type: text (nullable)
//   entity_id: uuid (nullable)
//   valor: numeric (nullable)
//   status: text (nullable)
//   metodo_pagamento: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   data_pagamento: timestamp with time zone (nullable)
// Table: rule_versions
//   id: uuid (not null, default: gen_random_uuid())
//   rule_id: uuid (nullable)
//   version: text (not null)
//   content: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   created_by: uuid (nullable)
// Table: rules
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (nullable)
//   category: text (nullable)
//   version: text (nullable, default: '1.0'::text)
//   status: text (nullable, default: 'active'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: sections
//   id: uuid (not null, default: gen_random_uuid())
//   type: text (not null)
//   data: jsonb (nullable, default: '{}'::jsonb)
//   display_order: integer (not null, default: 0)
//   is_published: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: stripe_config
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (nullable, default: '00000000-0000-0000-0000-000000000001'::uuid)
//   public_key: text (nullable)
//   secret_key: text (nullable)
//   webhook_secret: text (nullable)
//   pix_enabled: boolean (nullable, default: false)
//   pass_fees_to_customer: boolean (nullable, default: false)
//   card_fee_percentage: numeric (nullable, default: 0)
//   card_fee_fixed: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: stripe_payments
//   id: uuid (not null, default: gen_random_uuid())
//   tenant_id: uuid (nullable, default: '00000000-0000-0000-0000-000000000001'::uuid)
//   payment_intent_id: text (nullable)
//   atleta_id: uuid (nullable)
//   charge_id: uuid (nullable)
//   valor: numeric (nullable)
//   status: text (nullable)
//   metodo_pagamento: text (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
//   data_pagamento: timestamp with time zone (nullable)
// Table: system_data
//   id: uuid (not null, default: '00000000-0000-0000-0000-000000000001'::uuid)
//   logo_url: text (nullable)
//   slogan: text (nullable)
//   cnpj: text (nullable)
//   razao_social: text (nullable)
//   address_street: text (nullable)
//   address_number: text (nullable)
//   address_complement: text (nullable)
//   address_city: text (nullable)
//   address_state: text (nullable)
//   address_zip: text (nullable)
//   phone: text (nullable)
//   email: text (nullable)
//   mobile: text (nullable)
//   responsible_name: text (nullable)
//   responsible_cpf: text (nullable)
//   responsible_role: text (nullable)
//   responsible_email: text (nullable)
//   responsible_phone: text (nullable)
//   updated_at: timestamp with time zone (nullable, default: now())
//   bg_opacity: integer (nullable, default: 100)
//   menu_logo_size: integer (nullable, default: 100)
//   browser_icon_url: text (nullable)
//   show_cnpj: boolean (nullable, default: true)
//   show_contact_bar: boolean (nullable, default: true)
//   session_lifetime: integer (nullable, default: 24)
//   ai_context: text (nullable)
//   dark_mode: boolean (nullable, default: false)
//   language: text (nullable, default: 'pt'::text)
//   libras_enabled: boolean (nullable, default: false)
//   two_factor_auth: boolean (nullable, default: false)
//   two_factor_method: text (nullable, default: 'email'::text)
//   integrations: jsonb (nullable, default: '{}'::jsonb)
//   terms: jsonb (nullable, default: '{"uso": "", "lgpd": "", "cookies": ""}'::jsonb)
//   bg_image_url: text (nullable)
//   active_theme: text (nullable, default: 'system'::text)
//   platform_name: text (nullable)
//   quote_footer_text: text (nullable)
//   records_per_page: integer (nullable, default: 50)
//   business_hours: jsonb (nullable, default: '{}'::jsonb)
// Table: whatsapp_config
//   id: uuid (not null, default: gen_random_uuid())
//   empresa_id: uuid (nullable)
//   api_provider: text (nullable)
//   account_sid: text (nullable)
//   auth_token: text (nullable)
//   phone_number: text (nullable)
//   is_active: boolean (nullable, default: false)
//   is_production: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: whatsapp_logs
//   id: uuid (not null, default: gen_random_uuid())
//   empresa_id: uuid (nullable)
//   cliente_id: uuid (nullable)
//   telefone: text (nullable)
//   tipo_mensagem: text (nullable)
//   status: text (nullable)
//   resposta_api: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: whatsapp_templates
//   id: uuid (not null, default: gen_random_uuid())
//   tipo_mensagem: text (nullable)
//   conteudo: text (nullable)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: affiliation_plans
//   PRIMARY KEY affiliation_plans_pkey: PRIMARY KEY (id)
// Table: athlete_attribute_values
//   FOREIGN KEY athlete_attribute_values_attribute_id_fkey: FOREIGN KEY (attribute_id) REFERENCES athlete_attributes(id) ON DELETE CASCADE
//   PRIMARY KEY athlete_attribute_values_pkey: PRIMARY KEY (id)
//   FOREIGN KEY athlete_attribute_values_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: athlete_attributes
//   PRIMARY KEY athlete_attributes_pkey: PRIMARY KEY (id)
// Table: athlete_categories
//   FOREIGN KEY athlete_categories_athlete_id_fkey: FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
//   FOREIGN KEY athlete_categories_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
//   PRIMARY KEY athlete_categories_pkey: PRIMARY KEY (id)
// Table: athletes
//   FOREIGN KEY athletes_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
//   FOREIGN KEY athletes_club_id_fkey: FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
//   UNIQUE athletes_cpf_key: UNIQUE (cpf)
//   PRIMARY KEY athletes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY athletes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
// Table: billing_configuration
//   CHECK billing_configuration_due_day_check: CHECK (((due_day >= 1) AND (due_day <= 31)))
//   CHECK billing_configuration_due_month_check: CHECK (((due_month >= 1) AND (due_month <= 12)))
//   PRIMARY KEY billing_configuration_pkey: PRIMARY KEY (id)
//   UNIQUE billing_configuration_tenant_id_key: UNIQUE (tenant_id)
// Table: billing_logs
//   PRIMARY KEY billing_logs_pkey: PRIMARY KEY (id)
//   CHECK billing_logs_status_check: CHECK ((status = ANY (ARRAY['success'::text, 'error'::text])))
// Table: billing_registration_config
//   PRIMARY KEY billing_registration_config_pkey: PRIMARY KEY (id)
// Table: billing_reminders_log
//   FOREIGN KEY billing_reminders_log_athlete_id_fkey: FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
//   FOREIGN KEY billing_reminders_log_charge_id_fkey: FOREIGN KEY (charge_id) REFERENCES financial_charges(id) ON DELETE CASCADE
//   PRIMARY KEY billing_reminders_log_pkey: PRIMARY KEY (id)
// Table: blog_comments
//   PRIMARY KEY blog_comments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY blog_comments_post_id_fkey: FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
// Table: blog_posts
//   FOREIGN KEY blog_posts_author_id_fkey: FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL
//   PRIMARY KEY blog_posts_pkey: PRIMARY KEY (id)
// Table: cart_items
//   PRIMARY KEY cart_items_pkey: PRIMARY KEY (id)
//   FOREIGN KEY cart_items_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
//   FOREIGN KEY cart_items_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE cart_items_user_id_product_id_key: UNIQUE (user_id, product_id)
// Table: categories
//   PRIMARY KEY categories_pkey: PRIMARY KEY (id)
// Table: clubs
//   PRIMARY KEY clubs_pkey: PRIMARY KEY (id)
// Table: courses
//   FOREIGN KEY courses_club_id_fkey: FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
//   PRIMARY KEY courses_pkey: PRIMARY KEY (id)
// Table: email_logs
//   PRIMARY KEY email_logs_pkey: PRIMARY KEY (id)
// Table: event_photos
//   FOREIGN KEY event_photos_event_id_fkey: FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
//   PRIMARY KEY event_photos_pkey: PRIMARY KEY (id)
// Table: event_registrations
//   FOREIGN KEY event_registrations_athlete_id_fkey: FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
//   FOREIGN KEY event_registrations_event_id_fkey: FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
//   PRIMARY KEY event_registrations_pkey: PRIMARY KEY (id)
// Table: events
//   FOREIGN KEY events_club_id_fkey: FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
//   PRIMARY KEY events_pkey: PRIMARY KEY (id)
// Table: financial_charges
//   FOREIGN KEY financial_charges_athlete_id_fkey: FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE SET NULL
//   PRIMARY KEY financial_charges_pkey: PRIMARY KEY (id)
// Table: financial_partners
//   PRIMARY KEY financial_partners_pkey: PRIMARY KEY (id)
// Table: google_ads_cache
//   PRIMARY KEY google_ads_cache_pkey: PRIMARY KEY (id)
//   FOREIGN KEY google_ads_cache_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: hero_carousel
//   PRIMARY KEY hero_carousel_pkey: PRIMARY KEY (id)
// Table: maintenance_config
//   PRIMARY KEY maintenance_config_pkey: PRIMARY KEY (id)
// Table: media_items
//   PRIMARY KEY media_items_pkey: PRIMARY KEY (id)
// Table: notifications
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: order_items
//   FOREIGN KEY order_items_order_id_fkey: FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
//   PRIMARY KEY order_items_pkey: PRIMARY KEY (id)
//   FOREIGN KEY order_items_product_id_fkey: FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
// Table: orders
//   FOREIGN KEY orders_athlete_id_fkey: FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
//   PRIMARY KEY orders_pkey: PRIMARY KEY (id)
//   FOREIGN KEY orders_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: pages
//   PRIMARY KEY pages_pkey: PRIMARY KEY (id)
//   UNIQUE pages_slug_key: UNIQUE (slug)
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: rankings
//   FOREIGN KEY rankings_athlete_id_fkey: FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
//   UNIQUE rankings_athlete_id_key: UNIQUE (athlete_id)
//   PRIMARY KEY rankings_pkey: PRIMARY KEY (id)
// Table: registration_payments
//   PRIMARY KEY registration_payments_pkey: PRIMARY KEY (id)
// Table: rule_versions
//   FOREIGN KEY rule_versions_created_by_fkey: FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
//   PRIMARY KEY rule_versions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY rule_versions_rule_id_fkey: FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE
// Table: rules
//   PRIMARY KEY rules_pkey: PRIMARY KEY (id)
// Table: sections
//   PRIMARY KEY sections_pkey: PRIMARY KEY (id)
// Table: stripe_config
//   PRIMARY KEY stripe_config_pkey: PRIMARY KEY (id)
// Table: stripe_payments
//   FOREIGN KEY stripe_payments_atleta_id_fkey: FOREIGN KEY (atleta_id) REFERENCES athletes(id) ON DELETE CASCADE
//   FOREIGN KEY stripe_payments_charge_id_fkey: FOREIGN KEY (charge_id) REFERENCES financial_charges(id) ON DELETE CASCADE
//   PRIMARY KEY stripe_payments_pkey: PRIMARY KEY (id)
// Table: system_data
//   PRIMARY KEY system_data_pkey: PRIMARY KEY (id)
// Table: whatsapp_config
//   PRIMARY KEY whatsapp_config_pkey: PRIMARY KEY (id)
// Table: whatsapp_logs
//   PRIMARY KEY whatsapp_logs_pkey: PRIMARY KEY (id)
// Table: whatsapp_templates
//   PRIMARY KEY whatsapp_templates_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: affiliation_plans
//   Policy "plans_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "plans_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: athlete_attribute_values
//   Policy "athlete_attribute_values_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: athlete_attributes
//   Policy "athlete_attributes_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: athlete_categories
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: athletes
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for anon users" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: billing_configuration
//   Policy "billing_config_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: billing_logs
//   Policy "billing_logs_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: billing_registration_config
//   Policy "billing_registration_config_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: billing_reminders_log
//   Policy "billing_reminders_log_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: blog_comments
//   Policy "Enable all access for authenticated users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Enable insert for all users" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: blog_posts
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: cart_items
//   Policy "Users can manage their own cart items" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: categories
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clubs
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: courses
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: email_logs
//   Policy "email_logs_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: event_photos
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: event_registrations
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable read access for own registrations" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (athlete_id IN ( SELECT athletes.id    FROM athletes   WHERE (athletes.user_id = auth.uid())))
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: events
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: financial_charges
//   Policy "financial_charges_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: financial_partners
//   Policy "financial_partners_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: google_ads_cache
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: hero_carousel
//   Policy "hero_carousel_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "hero_carousel_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "hero_carousel_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "hero_carousel_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: maintenance_config
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: media_items
//   Policy "media_items_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "media_items_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: notifications
//   Policy "Users can delete own notifications" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can update own notifications" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view own notifications" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: order_items
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: orders
//   Policy "Users can insert own orders" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can read own orders" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = user_id) OR (auth.uid() IN ( SELECT athletes.user_id    FROM athletes   WHERE (athletes.id = orders.athlete_id))))
//   Policy "Users can update own orders" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: pages
//   Policy "Enable all access for authenticated users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: (is_published = true)
// Table: products
//   Policy "Enable delete for authenticated users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Enable update for authenticated users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: profiles
//   Policy "profiles_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "profiles_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: true
// Table: rankings
//   Policy "rankings_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "rankings_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: registration_payments
//   Policy "registration_payments_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: rule_versions
//   Policy "rule_versions_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "rule_versions_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: rules
//   Policy "rules_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "rules_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: sections
//   Policy "Enable all access for authenticated users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: (is_published = true)
// Table: stripe_config
//   Policy "stripe_config_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: stripe_payments
//   Policy "stripe_payments_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: system_data
//   Policy "system_data_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "system_data_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "system_data_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: whatsapp_config
//   Policy "whatsapp_config_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: whatsapp_logs
//   Policy "whatsapp_logs_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: whatsapp_templates
//   Policy "whatsapp_templates_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- WARNING: TABLES WITH RLS ENABLED BUT NO POLICIES ---
// These tables have Row Level Security enabled but NO policies defined.
// This means ALL queries (SELECT, INSERT, UPDATE, DELETE) will return ZERO rows
// for non-superuser roles (including the anon and authenticated roles used by the app).
// You MUST create RLS policies for these tables to allow data access.
//   - audit_logs

// --- DATABASE FUNCTIONS ---
// FUNCTION audit_trigger_func()
//   CREATE OR REPLACE FUNCTION public.audit_trigger_func()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF TG_OP = 'INSERT' THEN
//       INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
//       VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
//       RETURN NEW;
//     ELSIF TG_OP = 'UPDATE' THEN
//       INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
//       VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
//       RETURN NEW;
//     ELSIF TG_OP = 'DELETE' THEN
//       INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
//       VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
//       RETURN OLD;
//     END IF;
//     RETURN NULL;
//   END;
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email)
//     VALUES (NEW.id, NEW.email)
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION notify_club_suspension()
//   CREATE OR REPLACE FUNCTION public.notify_club_suspension()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.affiliation_status = 'suspended' AND (OLD.affiliation_status IS NULL OR OLD.affiliation_status <> 'suspended') THEN
//           INSERT INTO public.notifications (user_id, title, message, type)
//           SELECT user_id, 'Clube Suspenso', 'A filiação do clube ' || NEW.name || ' foi suspensa.', 'club'
//           FROM public.athletes
//           WHERE club_id = NEW.id AND is_club_admin = true AND user_id IS NOT NULL;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION notify_event_registration()
//   CREATE OR REPLACE FUNCTION public.notify_event_registration()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_user_id uuid;
//       v_event_name text;
//   BEGIN
//       SELECT user_id INTO v_user_id FROM public.athletes WHERE id = NEW.athlete_id;
//       IF v_user_id IS NOT NULL THEN
//           SELECT name INTO v_event_name FROM public.events WHERE id = NEW.event_id;
//           INSERT INTO public.notifications (user_id, title, message, type)
//           VALUES (v_user_id, 'Inscrição Confirmada', 'Sua inscrição no evento ' || COALESCE(v_event_name, '') || ' foi realizada com sucesso.', 'event');
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION notify_new_blog_post()
//   CREATE OR REPLACE FUNCTION public.notify_new_blog_post()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       INSERT INTO public.notifications (user_id, title, message, type)
//       SELECT id, 'Novo Post no Blog', 'Confira nosso novo artigo: ' || NEW.title, 'blog'
//       FROM auth.users;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION notify_order_payment()
//   CREATE OR REPLACE FUNCTION public.notify_order_payment()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status <> 'paid') THEN
//           IF NEW.user_id IS NOT NULL THEN
//               INSERT INTO public.notifications (user_id, title, message, type)
//               VALUES (NEW.user_id, 'Pagamento Confirmado', 'O pagamento do seu pedido foi recebido.', 'payment');
//           END IF;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//
// FUNCTION update_event_participants()
//   CREATE OR REPLACE FUNCTION public.update_event_participants()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF TG_OP = 'INSERT' THEN
//           UPDATE public.events
//           SET current_participants = COALESCE(current_participants, 0) + 1
//           WHERE id = NEW.event_id;
//       ELSIF TG_OP = 'DELETE' THEN
//           UPDATE public.events
//           SET current_participants = GREATEST(COALESCE(current_participants, 0) - 1, 0)
//           WHERE id = OLD.event_id;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION update_sections_modtime()
//   CREATE OR REPLACE FUNCTION public.update_sections_modtime()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       NEW.updated_at = NOW();
//       RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: affiliation_plans
//   audit_affiliation_plans: CREATE TRIGGER audit_affiliation_plans AFTER INSERT OR DELETE OR UPDATE ON public.affiliation_plans FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()
// Table: athletes
//   audit_athletes: CREATE TRIGGER audit_athletes AFTER INSERT OR DELETE OR UPDATE ON public.athletes FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()
// Table: blog_posts
//   trigger_notify_new_blog_post: CREATE TRIGGER trigger_notify_new_blog_post AFTER INSERT ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION notify_new_blog_post()
// Table: clubs
//   audit_clubs: CREATE TRIGGER audit_clubs AFTER INSERT OR DELETE OR UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()
//   trigger_notify_club_suspension: CREATE TRIGGER trigger_notify_club_suspension AFTER UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION notify_club_suspension()
// Table: courses
//   audit_courses: CREATE TRIGGER audit_courses AFTER INSERT OR DELETE OR UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()
// Table: event_registrations
//   on_event_registration_update_count: CREATE TRIGGER on_event_registration_update_count AFTER INSERT OR DELETE ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION update_event_participants()
//   trigger_notify_event_registration: CREATE TRIGGER trigger_notify_event_registration AFTER INSERT ON public.event_registrations FOR EACH ROW EXECUTE FUNCTION notify_event_registration()
// Table: orders
//   trigger_notify_order_payment: CREATE TRIGGER trigger_notify_order_payment AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION notify_order_payment()
// Table: sections
//   sections_updated_at_trigger: CREATE TRIGGER sections_updated_at_trigger BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION update_sections_modtime()
// Table: system_data
//   audit_system_data: CREATE TRIGGER audit_system_data AFTER INSERT OR DELETE OR UPDATE ON public.system_data FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()

// --- INDEXES ---
// Table: athletes
//   CREATE UNIQUE INDEX athletes_cpf_key ON public.athletes USING btree (cpf)
// Table: billing_configuration
//   CREATE UNIQUE INDEX billing_configuration_tenant_id_key ON public.billing_configuration USING btree (tenant_id)
//   CREATE INDEX idx_billing_config_auto ON public.billing_configuration USING btree (auto_generate_enabled)
//   CREATE INDEX idx_billing_config_tenant ON public.billing_configuration USING btree (tenant_id)
// Table: billing_logs
//   CREATE INDEX idx_billing_logs_date ON public.billing_logs USING btree (execution_date)
//   CREATE INDEX idx_billing_logs_tenant ON public.billing_logs USING btree (tenant_id)
// Table: cart_items
//   CREATE UNIQUE INDEX cart_items_user_id_product_id_key ON public.cart_items USING btree (user_id, product_id)
// Table: pages
//   CREATE UNIQUE INDEX pages_slug_key ON public.pages USING btree (slug)
// Table: rankings
//   CREATE UNIQUE INDEX rankings_athlete_id_key ON public.rankings USING btree (athlete_id)
