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
      appointments: {
        Row: {
          client_name: string
          created_at: string
          date: string
          end_time: string
          executed_minutes: number | null
          id: string
          last_started_at: string | null
          link_pagamento: string | null
          notes: string | null
          service_name: string
          start_time: string
          status: string
          updated_at: string
          whatsapp_enviado: boolean | null
        }
        Insert: {
          client_name: string
          created_at?: string
          date: string
          end_time: string
          executed_minutes?: number | null
          id?: string
          last_started_at?: string | null
          link_pagamento?: string | null
          notes?: string | null
          service_name: string
          start_time: string
          status?: string
          updated_at?: string
          whatsapp_enviado?: boolean | null
        }
        Update: {
          client_name?: string
          created_at?: string
          date?: string
          end_time?: string
          executed_minutes?: number | null
          id?: string
          last_started_at?: string | null
          link_pagamento?: string | null
          notes?: string | null
          service_name?: string
          start_time?: string
          status?: string
          updated_at?: string
          whatsapp_enviado?: boolean | null
        }
        Relationships: []
      }
      athlete_attribute_values: {
        Row: {
          athlete_id: string | null
          attribute_id: string | null
          avaliador_id: string | null
          data_registro: string
          id: string
          observacoes: string | null
          user_id: string | null
          valor: string | null
        }
        Insert: {
          athlete_id?: string | null
          attribute_id?: string | null
          avaliador_id?: string | null
          data_registro?: string
          id?: string
          observacoes?: string | null
          user_id?: string | null
          valor?: string | null
        }
        Update: {
          athlete_id?: string | null
          attribute_id?: string | null
          avaliador_id?: string | null
          data_registro?: string
          id?: string
          observacoes?: string | null
          user_id?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'athlete_attribute_values_athlete_id_fkey'
            columns: ['athlete_id']
            isOneToOne: false
            referencedRelation: 'athletes'
            referencedColumns: ['id']
          },
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
          ativo: boolean | null
          created_at: string
          id: string
          nome: string | null
          tipo_dado: string | null
          unidade_medida: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome?: string | null
          tipo_dado?: string | null
          unidade_medida?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome?: string | null
          tipo_dado?: string | null
          unidade_medida?: string | null
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
          conclusion_en: string | null
          conclusion_es: string | null
          content: string | null
          content_en: string | null
          content_es: string | null
          created_at: string
          id: string
          image_url: string | null
          introduction: string | null
          introduction_en: string | null
          introduction_es: string | null
          is_active: boolean | null
          published_at: string | null
          status: string | null
          summary: string | null
          summary_en: string | null
          summary_es: string | null
          tags: Json | null
          title: string
          title_en: string | null
          title_es: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          conclusion?: string | null
          conclusion_en?: string | null
          conclusion_es?: string | null
          content?: string | null
          content_en?: string | null
          content_es?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          introduction?: string | null
          introduction_en?: string | null
          introduction_es?: string | null
          is_active?: boolean | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          summary_en?: string | null
          summary_es?: string | null
          tags?: Json | null
          title: string
          title_en?: string | null
          title_es?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          conclusion?: string | null
          conclusion_en?: string | null
          conclusion_es?: string | null
          content?: string | null
          content_en?: string | null
          content_es?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          introduction?: string | null
          introduction_en?: string | null
          introduction_es?: string | null
          is_active?: boolean | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          summary_en?: string | null
          summary_es?: string | null
          tags?: Json | null
          title?: string
          title_en?: string | null
          title_es?: string | null
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
      clientes: {
        Row: {
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      contract_templates: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          cliente_id: string | null
          conta_id: string | null
          created_at: string | null
          data_cancelamento: string | null
          data_fim: string | null
          data_inicio: string | null
          data_proxima_cobranca: string | null
          duracao_ciclo: string | null
          id: string
          motivo_cancelamento: string | null
          numero_contrato: string | null
          observacoes: string | null
          renovacao_automatica: boolean | null
          responsavel_id: string | null
          sla_id: string | null
          status: string | null
          tipo_contrato: string | null
          updated_at: string | null
          user_id: string | null
          valor_ciclo: number | null
        }
        Insert: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_cancelamento?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_proxima_cobranca?: string | null
          duracao_ciclo?: string | null
          id?: string
          motivo_cancelamento?: string | null
          numero_contrato?: string | null
          observacoes?: string | null
          renovacao_automatica?: boolean | null
          responsavel_id?: string | null
          sla_id?: string | null
          status?: string | null
          tipo_contrato?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_ciclo?: number | null
        }
        Update: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_cancelamento?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          data_proxima_cobranca?: string | null
          duracao_ciclo?: string | null
          id?: string
          motivo_cancelamento?: string | null
          numero_contrato?: string | null
          observacoes?: string | null
          renovacao_automatica?: boolean | null
          responsavel_id?: string | null
          sla_id?: string | null
          status?: string | null
          tipo_contrato?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_ciclo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'contratos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contratos_conta_id_fkey'
            columns: ['conta_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contratos_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contratos_sla_id_fkey'
            columns: ['sla_id']
            isOneToOne: false
            referencedRelation: 'sla_types'
            referencedColumns: ['id']
          },
        ]
      }
      courses: {
        Row: {
          club_id: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_es: string | null
          difficulty_rating: string | null
          handicap_rating: number | null
          holes: number | null
          id: string
          image_url: string | null
          instructor: string | null
          name: string
          name_en: string | null
          name_es: string | null
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
          description_en?: string | null
          description_es?: string | null
          difficulty_rating?: string | null
          handicap_rating?: number | null
          holes?: number | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          name: string
          name_en?: string | null
          name_es?: string | null
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
          description_en?: string | null
          description_es?: string | null
          difficulty_rating?: string | null
          handicap_rating?: number | null
          holes?: number | null
          id?: string
          image_url?: string | null
          instructor?: string | null
          name?: string
          name_en?: string | null
          name_es?: string | null
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
          description_en: string | null
          description_es: string | null
          end_date: string | null
          event_type: string | null
          id: string
          image_url: string | null
          location: string | null
          max_participants: number | null
          name: string
          name_en: string | null
          name_es: string | null
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
          description_en?: string | null
          description_es?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_participants?: number | null
          name: string
          name_en?: string | null
          name_es?: string | null
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
          description_en?: string | null
          description_es?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          max_participants?: number | null
          name?: string
          name_en?: string | null
          name_es?: string | null
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
      google_reviews: {
        Row: {
          author_name: string
          author_url: string | null
          created_at: string
          id: string
          profile_photo_url: string | null
          rating: number
          relative_time_description: string | null
          status: string | null
          text: string | null
          time: number | null
        }
        Insert: {
          author_name: string
          author_url?: string | null
          created_at?: string
          id?: string
          profile_photo_url?: string | null
          rating: number
          relative_time_description?: string | null
          status?: string | null
          text?: string | null
          time?: number | null
        }
        Update: {
          author_name?: string
          author_url?: string | null
          created_at?: string
          id?: string
          profile_photo_url?: string | null
          rating?: number
          relative_time_description?: string | null
          status?: string | null
          text?: string | null
          time?: number | null
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
      lancamentos_financeiros: {
        Row: {
          categoria: string | null
          conta_id: string | null
          created_at: string | null
          data_lancamento: string | null
          descricao: string | null
          id: string
          referencia_id: string | null
          referencia_tipo: string | null
          tipo: string | null
          updated_at: string | null
          user_id: string | null
          valor: number | null
        }
        Insert: {
          categoria?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_lancamento?: string | null
          descricao?: string | null
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor?: number | null
        }
        Update: {
          categoria?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_lancamento?: string | null
          descricao?: string | null
          id?: string
          referencia_id?: string | null
          referencia_tipo?: string | null
          tipo?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'lancamentos_financeiros_conta_id_fkey'
            columns: ['conta_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
        ]
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
          name: string | null
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
          name?: string | null
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
          name?: string | null
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
      orcamento_itens: {
        Row: {
          descricao: string | null
          id: string
          orcamento_id: string | null
          produto_id: string | null
          quantidade: number
          servico_id: string | null
          tempo_estimado: number | null
          tipo_item: string | null
          user_id: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          descricao?: string | null
          id?: string
          orcamento_id?: string | null
          produto_id?: string | null
          quantidade?: number
          servico_id?: string | null
          tempo_estimado?: number | null
          tipo_item?: string | null
          user_id?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          descricao?: string | null
          id?: string
          orcamento_id?: string | null
          produto_id?: string | null
          quantidade?: number
          servico_id?: string | null
          tempo_estimado?: number | null
          tipo_item?: string | null
          user_id?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: 'orcamento_itens_orcamento_id_fkey'
            columns: ['orcamento_id']
            isOneToOne: false
            referencedRelation: 'orcamentos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orcamento_itens_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orcamento_itens_servico_id_fkey'
            columns: ['servico_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          conta_id: string | null
          created_at: string
          data_conversao: string | null
          data_emissao: string
          data_validade: string | null
          desconto_percentual: number | null
          desconto_valor: number | null
          id: string
          motivo_rejeicao: string | null
          numero_orcamento: string | null
          observacoes: string | null
          pedido_id: string | null
          responsavel_id: string | null
          status: string
          subtotal: number | null
          total: number | null
          updated_at: string
          user_id: string | null
          valor_impostos: number | null
          veiculo_km: string | null
          veiculo_modelo: string | null
          veiculo_placa: string | null
        }
        Insert: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string
          data_conversao?: string | null
          data_emissao: string
          data_validade?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          id?: string
          motivo_rejeicao?: string | null
          numero_orcamento?: string | null
          observacoes?: string | null
          pedido_id?: string | null
          responsavel_id?: string | null
          status?: string
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string | null
          valor_impostos?: number | null
          veiculo_km?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Update: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string
          data_conversao?: string | null
          data_emissao?: string
          data_validade?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          id?: string
          motivo_rejeicao?: string | null
          numero_orcamento?: string | null
          observacoes?: string | null
          pedido_id?: string | null
          responsavel_id?: string | null
          status?: string
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string | null
          valor_impostos?: number | null
          veiculo_km?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'orcamentos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orcamentos_conta_id_fkey'
            columns: ['conta_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orcamentos_pedido_id_fkey'
            columns: ['pedido_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orcamentos_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
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
          meta_description_en: string | null
          meta_description_es: string | null
          meta_keywords: string | null
          meta_title: string | null
          meta_title_en: string | null
          meta_title_es: string | null
          slug: string
          submenus: Json | null
          title: string
          title_en: string | null
          title_es: string | null
          updated_at: string
        }
        Insert: {
          blocks?: Json | null
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          slug: string
          submenus?: Json | null
          title: string
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
        }
        Update: {
          blocks?: Json | null
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          meta_title_en?: string | null
          meta_title_es?: string | null
          slug?: string
          submenus?: Json | null
          title?: string
          title_en?: string | null
          title_es?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pedido_itens: {
        Row: {
          descricao: string | null
          id: string
          pedido_id: string | null
          produto_id: string | null
          quantidade: number | null
          servico_id: string | null
          tempo_estimado: number | null
          tipo_item: string | null
          user_id: string | null
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          descricao?: string | null
          id?: string
          pedido_id?: string | null
          produto_id?: string | null
          quantidade?: number | null
          servico_id?: string | null
          tempo_estimado?: number | null
          tipo_item?: string | null
          user_id?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          descricao?: string | null
          id?: string
          pedido_id?: string | null
          produto_id?: string | null
          quantidade?: number | null
          servico_id?: string | null
          tempo_estimado?: number | null
          tipo_item?: string | null
          user_id?: string | null
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'pedido_itens_pedido_id_fkey'
            columns: ['pedido_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pedido_itens_produto_id_fkey'
            columns: ['produto_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pedido_itens_servico_id_fkey'
            columns: ['servico_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          conta_id: string | null
          created_at: string | null
          data_entrega_prevista: string | null
          data_entrega_real: string | null
          data_pagamento: string | null
          data_pedido: string | null
          forma_pagamento: string | null
          id: string
          motivo_cancelamento: string | null
          numero_pedido: string | null
          observacoes: string | null
          orcamento_id: string | null
          rastreamento: string | null
          responsavel_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          valor_pago: number | null
          valor_total: number | null
          veiculo_km: string | null
          veiculo_modelo: string | null
          veiculo_placa: string | null
        }
        Insert: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_pagamento?: string | null
          data_pedido?: string | null
          forma_pagamento?: string | null
          id?: string
          motivo_cancelamento?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          orcamento_id?: string | null
          rastreamento?: string | null
          responsavel_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_pago?: number | null
          valor_total?: number | null
          veiculo_km?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Update: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string | null
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_pagamento?: string | null
          data_pedido?: string | null
          forma_pagamento?: string | null
          id?: string
          motivo_cancelamento?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          orcamento_id?: string | null
          rastreamento?: string | null
          responsavel_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_pago?: number | null
          valor_total?: number | null
          veiculo_km?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pedidos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'clientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pedidos_conta_id_fkey'
            columns: ['conta_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pedidos_orcamento_id_fkey'
            columns: ['orcamento_id']
            isOneToOne: false
            referencedRelation: 'orcamentos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pedidos_responsavel_id_fkey'
            columns: ['responsavel_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      plan_categories: {
        Row: {
          created_at: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      plan_services: {
        Row: {
          annual_discount: number | null
          annual_value: number
          category_id: string | null
          contract_template_id: string | null
          created_at: string
          description: string
          id: string
          monthly_discount: number | null
          monthly_value: number
          observation: string | null
          semiannual_discount: number | null
          semiannual_value: number
          title: string
          updated_at: string
        }
        Insert: {
          annual_discount?: number | null
          annual_value?: number
          category_id?: string | null
          contract_template_id?: string | null
          created_at?: string
          description: string
          id?: string
          monthly_discount?: number | null
          monthly_value?: number
          observation?: string | null
          semiannual_discount?: number | null
          semiannual_value?: number
          title: string
          updated_at?: string
        }
        Update: {
          annual_discount?: number | null
          annual_value?: number
          category_id?: string | null
          contract_template_id?: string | null
          created_at?: string
          description?: string
          id?: string
          monthly_discount?: number | null
          monthly_value?: number
          observation?: string | null
          semiannual_discount?: number | null
          semiannual_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plan_services_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'plan_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'plan_services_contract_template_id_fkey'
            columns: ['contract_template_id']
            isOneToOne: false
            referencedRelation: 'contract_templates'
            referencedColumns: ['id']
          },
        ]
      }
      plano_contas: {
        Row: {
          codigo_estrutural: string
          conta_pai_id: string | null
          created_at: string
          id: string
          is_active: boolean
          natureza: string
          nome: string
          updated_at: string
        }
        Insert: {
          codigo_estrutural: string
          conta_pai_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          natureza: string
          nome: string
          updated_at?: string
        }
        Update: {
          codigo_estrutural?: string
          conta_pai_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          natureza?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'plano_contas_conta_pai_id_fkey'
            columns: ['conta_pai_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_es: string | null
          dimensions: string | null
          id: string
          image_url: string | null
          name: string
          name_en: string | null
          name_es: string | null
          price: number | null
          rating: number | null
          sku: string | null
          stock: number | null
          subcategory: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_en?: string | null
          name_es?: string | null
          price?: number | null
          rating?: number | null
          sku?: string | null
          stock?: number | null
          subcategory?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_es?: string | null
          dimensions?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_en?: string | null
          name_es?: string | null
          price?: number | null
          rating?: number | null
          sku?: string | null
          stock?: number | null
          subcategory?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          autoriza_whatsapp: boolean | null
          birth_date: string | null
          club_id: string | null
          cpf_cnpj: string | null
          created_at: string | null
          document: string | null
          documento_identidade: string | null
          email: string | null
          financial_status: string | null
          gender: string | null
          id: string
          is_athlete: boolean | null
          is_author: boolean | null
          is_club: boolean | null
          name: string | null
          nationality: string | null
          naturalness: string | null
          numero_registro_federativo: string | null
          observacoes: string | null
          phone: string | null
          photo_url: string | null
          rg: string | null
          role: string | null
          status: string | null
          telefone_whatsapp: string | null
          tipo_usuario: string | null
        }
        Insert: {
          address?: string | null
          autoriza_whatsapp?: boolean | null
          birth_date?: string | null
          club_id?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          document?: string | null
          documento_identidade?: string | null
          email?: string | null
          financial_status?: string | null
          gender?: string | null
          id: string
          is_athlete?: boolean | null
          is_author?: boolean | null
          is_club?: boolean | null
          name?: string | null
          nationality?: string | null
          naturalness?: string | null
          numero_registro_federativo?: string | null
          observacoes?: string | null
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          role?: string | null
          status?: string | null
          telefone_whatsapp?: string | null
          tipo_usuario?: string | null
        }
        Update: {
          address?: string | null
          autoriza_whatsapp?: boolean | null
          birth_date?: string | null
          club_id?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          document?: string | null
          documento_identidade?: string | null
          email?: string | null
          financial_status?: string | null
          gender?: string | null
          id?: string
          is_athlete?: boolean | null
          is_author?: boolean | null
          is_club?: boolean | null
          name?: string | null
          nationality?: string | null
          naturalness?: string | null
          numero_registro_federativo?: string | null
          observacoes?: string | null
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          role?: string | null
          status?: string | null
          telefone_whatsapp?: string | null
          tipo_usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_club_id_fkey'
            columns: ['club_id']
            isOneToOne: false
            referencedRelation: 'clubs'
            referencedColumns: ['id']
          },
        ]
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
      services: {
        Row: {
          add_time: string | null
          cost_value: number | null
          created_at: string | null
          description: string | null
          exec_time: string | null
          id: string
          margin_time: number | null
          sale_value: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          add_time?: string | null
          cost_value?: number | null
          created_at?: string | null
          description?: string | null
          exec_time?: string | null
          id?: string
          margin_time?: number | null
          sale_value?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          add_time?: string | null
          cost_value?: number | null
          created_at?: string | null
          description?: string | null
          exec_time?: string | null
          id?: string
          margin_time?: number | null
          sale_value?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sla_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          resolution_time: string | null
          response_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          resolution_time?: string | null
          response_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          resolution_time?: string | null
          response_time?: string | null
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
          footer_icon_size: number | null
          footer_links: Json | null
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
          short_description: string | null
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
          footer_icon_size?: number | null
          footer_links?: Json | null
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
          short_description?: string | null
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
          footer_icon_size?: number | null
          footer_links?: Json | null
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
          short_description?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          role: string | null
          senha: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          role?: string | null
          senha?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          role?: string | null
          senha?: string | null
          updated_at?: string | null
          user_id?: string | null
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
// Table: appointments
//   id: uuid (not null, default: gen_random_uuid())
//   date: date (not null)
//   start_time: time without time zone (not null)
//   end_time: time without time zone (not null)
//   service_name: text (not null)
//   client_name: text (not null)
//   status: text (not null, default: 'Pendente'::text)
//   notes: text (nullable)
//   executed_minutes: integer (nullable, default: 0)
//   last_started_at: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   link_pagamento: text (nullable)
//   whatsapp_enviado: boolean (nullable, default: false)
// Table: athlete_attribute_values
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   attribute_id: uuid (nullable)
//   valor: text (nullable)
//   data_registro: timestamp with time zone (not null, default: now())
//   athlete_id: uuid (nullable)
//   observacoes: text (nullable)
//   avaliador_id: uuid (nullable)
// Table: athlete_attributes
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (nullable)
//   tipo_dado: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   ativo: boolean (nullable, default: true)
//   unidade_medida: text (nullable)
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
//   title_en: text (nullable)
//   title_es: text (nullable)
//   summary_en: text (nullable)
//   summary_es: text (nullable)
//   introduction_en: text (nullable)
//   introduction_es: text (nullable)
//   content_en: text (nullable)
//   content_es: text (nullable)
//   conclusion_en: text (nullable)
//   conclusion_es: text (nullable)
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
// Table: clientes
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable, default: auth.uid())
//   nome: text (not null)
//   email: text (nullable)
//   telefone: text (nullable)
//   cpf_cnpj: text (nullable)
//   endereco: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
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
// Table: contract_templates
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   content: text (nullable)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: contratos
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable, default: auth.uid())
//   numero_contrato: text (nullable)
//   cliente_id: uuid (nullable)
//   responsavel_id: uuid (nullable)
//   tipo_contrato: text (nullable)
//   data_inicio: date (nullable)
//   data_fim: date (nullable)
//   duracao_ciclo: text (nullable)
//   valor_ciclo: numeric (nullable)
//   status: text (nullable)
//   renovacao_automatica: boolean (nullable, default: false)
//   data_proxima_cobranca: date (nullable)
//   data_cancelamento: date (nullable)
//   motivo_cancelamento: text (nullable)
//   observacoes: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   conta_id: uuid (nullable)
//   sla_id: uuid (nullable)
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
//   name_en: text (nullable)
//   name_es: text (nullable)
//   description_en: text (nullable)
//   description_es: text (nullable)
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
//   name_en: text (nullable)
//   name_es: text (nullable)
//   description_en: text (nullable)
//   description_es: text (nullable)
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
// Table: google_reviews
//   id: uuid (not null, default: gen_random_uuid())
//   author_name: text (not null)
//   author_url: text (nullable)
//   profile_photo_url: text (nullable)
//   rating: integer (not null)
//   text: text (nullable)
//   time: integer (nullable)
//   relative_time_description: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   status: text (nullable, default: 'approved'::text)
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
// Table: lancamentos_financeiros
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable, default: auth.uid())
//   tipo: text (nullable)
//   descricao: text (nullable)
//   valor: numeric (nullable)
//   data_lancamento: date (nullable)
//   categoria: text (nullable)
//   referencia_id: uuid (nullable)
//   referencia_tipo: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   conta_id: uuid (nullable)
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
//   name: text (nullable)
// Table: notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   message: text (not null)
//   type: text (not null, default: 'system'::text)
//   is_read: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
// Table: orcamento_itens
//   id: uuid (not null, default: gen_random_uuid())
//   orcamento_id: uuid (nullable)
//   produto_id: uuid (nullable)
//   quantidade: integer (not null, default: 1)
//   valor_unitario: numeric (not null, default: 0)
//   valor_total: numeric (not null, default: 0)
//   descricao: text (nullable)
//   user_id: uuid (nullable, default: auth.uid())
//   servico_id: uuid (nullable)
//   tipo_item: text (nullable, default: 'produto'::text)
//   tempo_estimado: numeric (nullable, default: 0)
// Table: orcamentos
//   id: uuid (not null, default: gen_random_uuid())
//   numero_orcamento: text (nullable)
//   cliente_id: uuid (nullable)
//   responsavel_id: uuid (nullable)
//   data_emissao: date (not null)
//   data_validade: date (nullable)
//   status: text (not null, default: 'rascunho'::text)
//   subtotal: numeric (nullable, default: 0)
//   desconto_percentual: numeric (nullable, default: 0)
//   desconto_valor: numeric (nullable, default: 0)
//   valor_impostos: numeric (nullable, default: 0)
//   total: numeric (nullable, default: 0)
//   observacoes: text (nullable)
//   motivo_rejeicao: text (nullable)
//   data_conversao: date (nullable)
//   pedido_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   user_id: uuid (nullable, default: auth.uid())
//   veiculo_placa: text (nullable)
//   veiculo_modelo: text (nullable)
//   veiculo_km: text (nullable)
//   conta_id: uuid (nullable)
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
//   submenus: jsonb (nullable, default: '[]'::jsonb)
//   title_en: text (nullable)
//   title_es: text (nullable)
//   meta_title_en: text (nullable)
//   meta_title_es: text (nullable)
//   meta_description_en: text (nullable)
//   meta_description_es: text (nullable)
// Table: pedido_itens
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable, default: auth.uid())
//   pedido_id: uuid (nullable)
//   produto_id: uuid (nullable)
//   quantidade: integer (nullable)
//   valor_unitario: numeric (nullable)
//   valor_total: numeric (nullable)
//   descricao: text (nullable)
//   servico_id: uuid (nullable)
//   tipo_item: text (nullable, default: 'produto'::text)
//   tempo_estimado: numeric (nullable, default: 0)
// Table: pedidos
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable, default: auth.uid())
//   numero_pedido: text (nullable)
//   cliente_id: uuid (nullable)
//   orcamento_id: uuid (nullable)
//   responsavel_id: uuid (nullable)
//   data_pedido: date (nullable)
//   data_entrega_prevista: date (nullable)
//   data_entrega_real: date (nullable)
//   status: text (nullable)
//   valor_total: numeric (nullable)
//   forma_pagamento: text (nullable)
//   data_pagamento: date (nullable)
//   valor_pago: numeric (nullable)
//   rastreamento: text (nullable)
//   observacoes: text (nullable)
//   motivo_cancelamento: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   veiculo_placa: text (nullable)
//   veiculo_modelo: text (nullable)
//   veiculo_km: text (nullable)
//   conta_id: uuid (nullable)
// Table: plan_categories
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: plan_services
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (not null)
//   monthly_value: numeric (not null, default: 0)
//   semiannual_value: numeric (not null, default: 0)
//   annual_value: numeric (not null, default: 0)
//   monthly_discount: numeric (nullable, default: 0)
//   semiannual_discount: numeric (nullable, default: 0)
//   annual_discount: numeric (nullable, default: 0)
//   observation: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   category_id: uuid (nullable)
//   contract_template_id: uuid (nullable)
// Table: plano_contas
//   id: uuid (not null, default: gen_random_uuid())
//   codigo_estrutural: text (not null)
//   nome: text (not null)
//   natureza: text (not null)
//   conta_pai_id: uuid (nullable)
//   is_active: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
//   subcategory: text (nullable)
//   sku: text (nullable)
//   dimensions: text (nullable)
//   name_en: text (nullable)
//   name_es: text (nullable)
//   description_en: text (nullable)
//   description_es: text (nullable)
// Table: profiles
//   id: uuid (not null)
//   email: text (nullable)
//   name: text (nullable)
//   role: text (nullable, default: 'athlete'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   status: text (nullable, default: 'active'::text)
//   financial_status: text (nullable, default: 'normal'::text)
//   document: text (nullable)
//   phone: text (nullable)
//   cpf_cnpj: text (nullable)
//   autoriza_whatsapp: boolean (nullable, default: false)
//   telefone_whatsapp: text (nullable)
//   birth_date: date (nullable)
//   gender: text (nullable)
//   address: text (nullable)
//   nationality: text (nullable)
//   naturalness: text (nullable)
//   rg: text (nullable)
//   documento_identidade: text (nullable)
//   observacoes: text (nullable)
//   tipo_usuario: text (nullable)
//   is_athlete: boolean (nullable, default: false)
//   is_club: boolean (nullable, default: false)
//   photo_url: text (nullable)
//   numero_registro_federativo: text (nullable)
//   club_id: uuid (nullable)
//   is_author: boolean (nullable, default: false)
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
// Table: services
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   description: text (nullable)
//   cost_value: numeric (nullable, default: 0)
//   sale_value: numeric (nullable, default: 0)
//   exec_time: text (nullable)
//   margin_time: numeric (nullable, default: 0)
//   add_time: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: sla_types
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   response_time: text (nullable)
//   resolution_time: text (nullable)
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
//   footer_links: jsonb (nullable, default: '{"links": [], "columns": 3}'::jsonb)
//   footer_icon_size: integer (nullable, default: 100)
//   short_description: text (nullable)
// Table: user_roles
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   role: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: usuarios
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable, default: auth.uid())
//   email: text (nullable)
//   senha: text (nullable)
//   nome: text (nullable)
//   role: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
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
// Table: appointments
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
// Table: athlete_attribute_values
//   FOREIGN KEY athlete_attribute_values_athlete_id_fkey: FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
//   FOREIGN KEY athlete_attribute_values_attribute_id_fkey: FOREIGN KEY (attribute_id) REFERENCES athlete_attributes(id) ON DELETE CASCADE
//   FOREIGN KEY athlete_attribute_values_avaliador_id_fkey: FOREIGN KEY (avaliador_id) REFERENCES auth.users(id) ON DELETE SET NULL
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
// Table: clientes
//   PRIMARY KEY clientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clientes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: clubs
//   PRIMARY KEY clubs_pkey: PRIMARY KEY (id)
// Table: contract_templates
//   PRIMARY KEY contract_templates_pkey: PRIMARY KEY (id)
// Table: contratos
//   FOREIGN KEY contratos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   FOREIGN KEY contratos_conta_id_fkey: FOREIGN KEY (conta_id) REFERENCES plano_contas(id) ON DELETE SET NULL
//   UNIQUE contratos_numero_contrato_key: UNIQUE (numero_contrato)
//   PRIMARY KEY contratos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contratos_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
//   FOREIGN KEY contratos_sla_id_fkey: FOREIGN KEY (sla_id) REFERENCES sla_types(id) ON DELETE SET NULL
//   FOREIGN KEY contratos_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
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
// Table: google_reviews
//   UNIQUE google_reviews_author_time_key: UNIQUE (author_name, "time")
//   PRIMARY KEY google_reviews_pkey: PRIMARY KEY (id)
// Table: hero_carousel
//   PRIMARY KEY hero_carousel_pkey: PRIMARY KEY (id)
// Table: lancamentos_financeiros
//   FOREIGN KEY lancamentos_financeiros_conta_id_fkey: FOREIGN KEY (conta_id) REFERENCES plano_contas(id) ON DELETE SET NULL
//   PRIMARY KEY lancamentos_financeiros_pkey: PRIMARY KEY (id)
//   CHECK lancamentos_financeiros_referencia_tipo_check: CHECK ((referencia_tipo = ANY (ARRAY['orcamento'::text, 'pedido'::text, 'contrato'::text])))
//   CHECK lancamentos_financeiros_tipo_check: CHECK ((tipo = ANY (ARRAY['entrada'::text, 'saida'::text])))
//   FOREIGN KEY lancamentos_financeiros_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: maintenance_config
//   PRIMARY KEY maintenance_config_pkey: PRIMARY KEY (id)
// Table: media_items
//   PRIMARY KEY media_items_pkey: PRIMARY KEY (id)
// Table: notifications
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: orcamento_itens
//   FOREIGN KEY orcamento_itens_orcamento_id_fkey: FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE
//   PRIMARY KEY orcamento_itens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY orcamento_itens_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES products(id) ON DELETE SET NULL
//   FOREIGN KEY orcamento_itens_servico_id_fkey: FOREIGN KEY (servico_id) REFERENCES services(id) ON DELETE SET NULL
//   FOREIGN KEY orcamento_itens_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id)
// Table: orcamentos
//   FOREIGN KEY orcamentos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   FOREIGN KEY orcamentos_conta_id_fkey: FOREIGN KEY (conta_id) REFERENCES plano_contas(id) ON DELETE SET NULL
//   FOREIGN KEY orcamentos_pedido_id_fkey: FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
//   PRIMARY KEY orcamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY orcamentos_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
//   FOREIGN KEY orcamentos_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id)
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
// Table: pedido_itens
//   FOREIGN KEY pedido_itens_pedido_id_fkey: FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
//   PRIMARY KEY pedido_itens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pedido_itens_produto_id_fkey: FOREIGN KEY (produto_id) REFERENCES products(id)
//   FOREIGN KEY pedido_itens_servico_id_fkey: FOREIGN KEY (servico_id) REFERENCES services(id) ON DELETE SET NULL
//   FOREIGN KEY pedido_itens_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: pedidos
//   FOREIGN KEY pedidos_cliente_id_fkey: FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
//   FOREIGN KEY pedidos_conta_id_fkey: FOREIGN KEY (conta_id) REFERENCES plano_contas(id) ON DELETE SET NULL
//   UNIQUE pedidos_numero_pedido_key: UNIQUE (numero_pedido)
//   FOREIGN KEY pedidos_orcamento_id_fkey: FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id)
//   PRIMARY KEY pedidos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pedidos_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
//   FOREIGN KEY pedidos_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: plan_categories
//   PRIMARY KEY plan_categories_pkey: PRIMARY KEY (id)
// Table: plan_services
//   FOREIGN KEY plan_services_category_id_fkey: FOREIGN KEY (category_id) REFERENCES plan_categories(id) ON DELETE SET NULL
//   FOREIGN KEY plan_services_contract_template_id_fkey: FOREIGN KEY (contract_template_id) REFERENCES contract_templates(id) ON DELETE SET NULL
//   PRIMARY KEY plan_services_pkey: PRIMARY KEY (id)
// Table: plano_contas
//   FOREIGN KEY plano_contas_conta_pai_id_fkey: FOREIGN KEY (conta_pai_id) REFERENCES plano_contas(id) ON DELETE CASCADE
//   CHECK plano_contas_natureza_check: CHECK ((natureza = ANY (ARRAY['receita'::text, 'despesa'::text])))
//   PRIMARY KEY plano_contas_pkey: PRIMARY KEY (id)
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_club_id_fkey: FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
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
// Table: services
//   PRIMARY KEY services_pkey: PRIMARY KEY (id)
// Table: sla_types
//   PRIMARY KEY sla_types_pkey: PRIMARY KEY (id)
// Table: stripe_config
//   PRIMARY KEY stripe_config_pkey: PRIMARY KEY (id)
// Table: stripe_payments
//   FOREIGN KEY stripe_payments_atleta_id_fkey: FOREIGN KEY (atleta_id) REFERENCES athletes(id) ON DELETE CASCADE
//   FOREIGN KEY stripe_payments_charge_id_fkey: FOREIGN KEY (charge_id) REFERENCES financial_charges(id) ON DELETE CASCADE
//   PRIMARY KEY stripe_payments_pkey: PRIMARY KEY (id)
// Table: system_data
//   PRIMARY KEY system_data_pkey: PRIMARY KEY (id)
// Table: user_roles
//   PRIMARY KEY user_roles_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_roles_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE user_roles_user_id_role_key: UNIQUE (user_id, role)
// Table: usuarios
//   UNIQUE usuarios_email_key: UNIQUE (email)
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY usuarios_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
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
// Table: appointments
//   Policy "appointments_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "appointments_select_public" (SELECT, PERMISSIVE) roles={public}
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
// Table: audit_logs
//   Policy "audit_logs_all" (ALL, PERMISSIVE) roles={authenticated}
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
// Table: clientes
//   Policy "clientes_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "clientes_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "clientes_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "clientes_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
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
// Table: contract_templates
//   Policy "Enable all access for authenticated users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: (is_active = true)
// Table: contratos
//   Policy "contratos_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "contratos_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "contratos_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "contratos_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
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
// Table: google_reviews
//   Policy "google_reviews_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "google_reviews_update" (UPDATE, PERMISSIVE) roles={authenticated}
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
// Table: lancamentos_financeiros
//   Policy "lancamentos_financeiros_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "lancamentos_financeiros_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "lancamentos_financeiros_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "lancamentos_financeiros_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
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
// Table: orcamento_itens
//   Policy "orcamento_itens_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "orcamento_itens_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "orcamento_itens_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "orcamento_itens_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "orcamento_itens_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
// Table: orcamentos
//   Policy "orcamentos_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "orcamentos_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "orcamentos_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "orcamentos_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "orcamentos_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
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
// Table: pedido_itens
//   Policy "pedido_itens_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "pedido_itens_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "pedido_itens_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "pedido_itens_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
// Table: pedidos
//   Policy "pedidos_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "pedidos_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "pedidos_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "pedidos_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
// Table: plan_categories
//   Policy "plan_categories_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "plan_categories_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: plan_services
//   Policy "plan_services_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "plan_services_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: plano_contas
//   Policy "plano_contas_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
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
// Table: services
//   Policy "services_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "services_select_public" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: sla_types
//   Policy "sla_types_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
//   Policy "sla_types_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
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
// Table: user_roles
//   Policy "user_roles_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "user_roles_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "user_roles_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "user_roles_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: usuarios
//   Policy "usuarios_delete" (DELETE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "usuarios_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (user_id = auth.uid())
//   Policy "usuarios_select" (SELECT, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
//   Policy "usuarios_update" (UPDATE, PERMISSIVE) roles={public}
//     USING: (user_id = auth.uid())
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
// FUNCTION generate_numero_orcamento()
//   CREATE OR REPLACE FUNCTION public.generate_numero_orcamento()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       IF NEW.numero_orcamento IS NULL OR NEW.numero_orcamento = '' THEN
//           NEW.numero_orcamento := 'ORC-' || nextval('orcamento_numero_seq')::TEXT;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION generate_numero_registro_federativo()
//   CREATE OR REPLACE FUNCTION public.generate_numero_registro_federativo()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   DECLARE
//       year_month TEXT;
//       seq_val INTEGER;
//   BEGIN
//       IF NEW.numero_registro_federativo IS NULL OR NEW.numero_registro_federativo = '' THEN
//           year_month := to_char(COALESCE(NEW.created_at, CURRENT_TIMESTAMP), 'YYYYMM');
//           seq_val := nextval('public.profile_registro_seq');
//           NEW.numero_registro_federativo := year_month || lpad(seq_val::TEXT, 4, '0');
//       END IF;
//       RETURN NEW;
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
// FUNCTION handle_orcamento_financeiro()
//   CREATE OR REPLACE FUNCTION public.handle_orcamento_financeiro()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado') THEN
//       INSERT INTO public.lancamentos_financeiros (
//         tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
//       ) VALUES (
//         'entrada', 'Orçamento Aprovado ' || COALESCE(NEW.numero_orcamento, ''), NEW.total, NEW.data_emissao, 'Orçamento Aprovado', NEW.id, 'orcamento', NEW.responsavel_id, NEW.conta_id
//       );
//     ELSIF NEW.status = 'rejeitado' AND (OLD.status IS NULL OR OLD.status <> 'rejeitado') THEN
//       INSERT INTO public.lancamentos_financeiros (
//         tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
//       ) VALUES (
//         'saida', 'Orçamento Rejeitado ' || COALESCE(NEW.numero_orcamento, ''), 0, NEW.data_emissao, 'Orçamento Rejeitado', NEW.id, 'orcamento', NEW.responsavel_id, NEW.conta_id
//       );
//     ELSIF NEW.status = 'convertido' AND (OLD.status IS NULL OR OLD.status <> 'convertido') THEN
//       UPDATE public.lancamentos_financeiros
//       SET referencia_tipo = 'pedido', referencia_id = NEW.pedido_id
//       WHERE referencia_id = NEW.id AND referencia_tipo = 'orcamento';
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_pedido_financeiro_estoque()
//   CREATE OR REPLACE FUNCTION public.handle_pedido_financeiro_estoque()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     item RECORD;
//   BEGIN
//     IF NEW.status = 'confirmado' AND (OLD.status IS NULL OR OLD.status <> 'confirmado') THEN
//       INSERT INTO public.lancamentos_financeiros (
//         tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
//       ) VALUES (
//         'entrada', 'Pedido Confirmado ' || COALESCE(NEW.numero_pedido, ''), NEW.valor_total, COALESCE(NEW.data_pedido, NOW()::date), 'Pedido Confirmado', NEW.id, 'pedido', NEW.responsavel_id, NEW.conta_id
//       );
//       FOR item IN SELECT produto_id, quantidade FROM public.pedido_itens WHERE pedido_id = NEW.id AND tipo_item = 'produto' AND produto_id IS NOT NULL LOOP
//         UPDATE public.products SET stock = GREATEST(COALESCE(stock, 0) - item.quantidade, 0) WHERE id = item.produto_id;
//       END LOOP;
//     ELSIF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status <> 'entregue') THEN
//       UPDATE public.lancamentos_financeiros SET categoria = 'Pedido Entregue' WHERE referencia_id = NEW.id AND referencia_tipo = 'pedido';
//     ELSIF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status <> 'cancelado') THEN
//       INSERT INTO public.lancamentos_financeiros (
//         tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
//       ) VALUES (
//         'saida', 'Pedido Cancelado ' || COALESCE(NEW.numero_pedido, ''), NEW.valor_total, NOW()::date, 'Pedido Cancelado', NEW.id, 'pedido', NEW.responsavel_id, NEW.conta_id
//       );
//       IF OLD.status IN ('confirmado', 'producao', 'enviado', 'entregue') THEN
//         FOR item IN SELECT produto_id, quantidade FROM public.pedido_itens WHERE pedido_id = NEW.id AND tipo_item = 'produto' AND produto_id IS NOT NULL LOOP
//           UPDATE public.products SET stock = COALESCE(stock, 0) + item.quantidade WHERE id = item.produto_id;
//         END LOOP;
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_plan_payment_contract()
//   CREATE OR REPLACE FUNCTION public.handle_plan_payment_contract()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_cliente_id UUID;
//   BEGIN
//     IF NEW.status = 'pago' AND (OLD.status IS DISTINCT FROM 'pago') AND NEW.category = 'plano' THEN
//       IF NEW.athlete_id IS NOT NULL THEN
//          SELECT id INTO v_cliente_id FROM public.clientes WHERE user_id = NEW.athlete_id LIMIT 1;
//
//          IF v_cliente_id IS NULL THEN
//             INSERT INTO public.clientes (user_id, nome)
//             SELECT id, name FROM public.profiles WHERE id = NEW.athlete_id
//             RETURNING id INTO v_cliente_id;
//          END IF;
//       END IF;
//
//       INSERT INTO public.contratos (
//         cliente_id,
//         tipo_contrato,
//         data_inicio,
//         duracao_ciclo,
//         valor_ciclo,
//         status,
//         numero_contrato,
//         observacoes
//       ) VALUES (
//         v_cliente_id,
//         'Plano de Serviços',
//         CURRENT_DATE,
//         'mensal',
//         NEW.amount,
//         'ativo',
//         'CTR-' || floor(random() * 1000000)::text,
//         'Contrato gerado automaticamente após pagamento do ' || COALESCE(NEW.description, 'Plano')
//       );
//     END IF;
//
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
// FUNCTION sync_profile_to_usuarios()
//   CREATE OR REPLACE FUNCTION public.sync_profile_to_usuarios()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     -- Prevent infinite recursion
//     IF pg_trigger_depth() > 1 THEN
//       RETURN NEW;
//     END IF;
//
//     IF TG_OP = 'INSERT' THEN
//       IF NEW.email IS NOT NULL THEN
//         INSERT INTO public.usuarios (user_id, email, nome, role)
//         VALUES (NEW.id, NEW.email, NEW.name, NEW.role)
//         ON CONFLICT (email) DO UPDATE
//         SET user_id = EXCLUDED.user_id, nome = EXCLUDED.nome, role = EXCLUDED.role;
//       END IF;
//     ELSIF TG_OP = 'UPDATE' THEN
//       IF NEW.email IS NOT NULL THEN
//         UPDATE public.usuarios
//         SET email = NEW.email, nome = NEW.name, role = NEW.role
//         WHERE user_id = NEW.id OR email = OLD.email;
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION sync_usuarios_to_profiles()
//   CREATE OR REPLACE FUNCTION public.sync_usuarios_to_profiles()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     -- Prevent infinite recursion
//     IF pg_trigger_depth() > 1 THEN
//       RETURN NEW;
//     END IF;
//
//     IF TG_OP = 'INSERT' THEN
//       IF NEW.user_id IS NOT NULL THEN
//         INSERT INTO public.profiles (id, email, name, role)
//         VALUES (NEW.user_id, NEW.email, NEW.nome, NEW.role)
//         ON CONFLICT (id) DO UPDATE
//         SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role;
//       END IF;
//     ELSIF TG_OP = 'UPDATE' THEN
//       IF NEW.user_id IS NOT NULL THEN
//         UPDATE public.profiles
//         SET email = NEW.email, name = NEW.nome, role = NEW.role
//         WHERE id = NEW.user_id;
//       END IF;
//     END IF;
//     RETURN NEW;
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
// Table: financial_charges
//   on_plan_payment_paid: CREATE TRIGGER on_plan_payment_paid AFTER UPDATE ON public.financial_charges FOR EACH ROW EXECUTE FUNCTION handle_plan_payment_contract()
// Table: orcamentos
//   trg_generate_numero_orcamento: CREATE TRIGGER trg_generate_numero_orcamento BEFORE INSERT ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION generate_numero_orcamento()
//   trg_orcamento_financeiro: CREATE TRIGGER trg_orcamento_financeiro AFTER UPDATE ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION handle_orcamento_financeiro()
// Table: orders
//   trigger_notify_order_payment: CREATE TRIGGER trigger_notify_order_payment AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION notify_order_payment()
// Table: pedidos
//   trg_pedido_financeiro_estoque: CREATE TRIGGER trg_pedido_financeiro_estoque AFTER UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION handle_pedido_financeiro_estoque()
// Table: profiles
//   on_profile_insert_generate_registro: CREATE TRIGGER on_profile_insert_generate_registro BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION generate_numero_registro_federativo()
//   on_profile_sync_usuarios: CREATE TRIGGER on_profile_sync_usuarios AFTER INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION sync_profile_to_usuarios()
// Table: sections
//   sections_updated_at_trigger: CREATE TRIGGER sections_updated_at_trigger BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION update_sections_modtime()
// Table: system_data
//   audit_system_data: CREATE TRIGGER audit_system_data AFTER INSERT OR DELETE OR UPDATE ON public.system_data FOR EACH ROW EXECUTE FUNCTION audit_trigger_func()
// Table: usuarios
//   on_usuarios_sync_profiles: CREATE TRIGGER on_usuarios_sync_profiles AFTER INSERT OR UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION sync_usuarios_to_profiles()

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
// Table: contratos
//   CREATE UNIQUE INDEX contratos_numero_contrato_key ON public.contratos USING btree (numero_contrato)
// Table: google_reviews
//   CREATE UNIQUE INDEX google_reviews_author_time_key ON public.google_reviews USING btree (author_name, "time")
// Table: orcamentos
//   CREATE UNIQUE INDEX orcamentos_numero_orcamento_key ON public.orcamentos USING btree (numero_orcamento)
// Table: pages
//   CREATE UNIQUE INDEX pages_slug_key ON public.pages USING btree (slug)
// Table: pedidos
//   CREATE UNIQUE INDEX pedidos_numero_pedido_key ON public.pedidos USING btree (numero_pedido)
// Table: rankings
//   CREATE UNIQUE INDEX rankings_athlete_id_key ON public.rankings USING btree (athlete_id)
// Table: user_roles
//   CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role)
// Table: usuarios
//   CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email)
