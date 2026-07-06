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
          cliente_id: string | null
          created_at: string
          dados_coleta: Json | null
          date: string
          duracao_minutos: number | null
          end_time: string
          executed_minutes: number | null
          id: string
          last_started_at: string | null
          link_pagamento: string | null
          notes: string | null
          orcamento_id: string | null
          problema_descricao: string | null
          professional_id: string | null
          service_name: string
          start_time: string
          status: string
          updated_at: string
          vehicle_brand: string | null
          vehicle_id: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_year: string | null
          whatsapp_enviado: boolean | null
        }
        Insert: {
          client_name: string
          cliente_id?: string | null
          created_at?: string
          dados_coleta?: Json | null
          date: string
          duracao_minutos?: number | null
          end_time: string
          executed_minutes?: number | null
          id?: string
          last_started_at?: string | null
          link_pagamento?: string | null
          notes?: string | null
          orcamento_id?: string | null
          problema_descricao?: string | null
          professional_id?: string | null
          service_name: string
          start_time: string
          status?: string
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_id?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: string | null
          whatsapp_enviado?: boolean | null
        }
        Update: {
          client_name?: string
          cliente_id?: string | null
          created_at?: string
          dados_coleta?: Json | null
          date?: string
          duracao_minutos?: number | null
          end_time?: string
          executed_minutes?: number | null
          id?: string
          last_started_at?: string | null
          link_pagamento?: string | null
          notes?: string | null
          orcamento_id?: string | null
          problema_descricao?: string | null
          professional_id?: string | null
          service_name?: string
          start_time?: string
          status?: string
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_id?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: string | null
          whatsapp_enviado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_orcamento_id_fkey'
            columns: ['orcamento_id']
            isOneToOne: false
            referencedRelation: 'orcamentos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_professional_id_fkey'
            columns: ['professional_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          },
        ]
      }
      asaas_config: {
        Row: {
          created_at: string | null
          id: string
          payment_environment: string | null
          production_key: string | null
          sandbox_key: string | null
          tenant_id: string | null
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_environment?: string | null
          production_key?: string | null
          sandbox_key?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_environment?: string | null
          production_key?: string | null
          sandbox_key?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
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
          email: string | null
          id: string
          post_id: string | null
          status: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          email?: string | null
          id?: string
          post_id?: string | null
          status?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          email?: string | null
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
          author_source: string | null
          category: string | null
          conclusion: string | null
          conclusion_en: string | null
          conclusion_es: string | null
          content: string | null
          content_en: string | null
          content_es: string | null
          cover_alt_text: string | null
          created_at: string
          cta_final: string | null
          id: string
          image_url: string | null
          introduction: string | null
          introduction_en: string | null
          introduction_es: string | null
          is_active: boolean | null
          published_at: string | null
          seo_description: string | null
          status: string | null
          step_images: Json | null
          summary: string | null
          summary_en: string | null
          summary_es: string | null
          tags: Json | null
          takeaways: string | null
          title: string
          title_en: string | null
          title_es: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_source?: string | null
          category?: string | null
          conclusion?: string | null
          conclusion_en?: string | null
          conclusion_es?: string | null
          content?: string | null
          content_en?: string | null
          content_es?: string | null
          cover_alt_text?: string | null
          created_at?: string
          cta_final?: string | null
          id?: string
          image_url?: string | null
          introduction?: string | null
          introduction_en?: string | null
          introduction_es?: string | null
          is_active?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          status?: string | null
          step_images?: Json | null
          summary?: string | null
          summary_en?: string | null
          summary_es?: string | null
          tags?: Json | null
          takeaways?: string | null
          title: string
          title_en?: string | null
          title_es?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_source?: string | null
          category?: string | null
          conclusion?: string | null
          conclusion_en?: string | null
          conclusion_es?: string | null
          content?: string | null
          content_en?: string | null
          content_es?: string | null
          cover_alt_text?: string | null
          created_at?: string
          cta_final?: string | null
          id?: string
          image_url?: string | null
          introduction?: string | null
          introduction_en?: string | null
          introduction_es?: string | null
          is_active?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          status?: string | null
          step_images?: Json | null
          summary?: string | null
          summary_en?: string | null
          summary_es?: string | null
          tags?: Json | null
          takeaways?: string | null
          title?: string
          title_en?: string | null
          title_es?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      blog_ratings: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          score: number
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          score: number
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: 'blog_ratings_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'blog_posts'
            referencedColumns: ['id']
          },
        ]
      }
      blog_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'blog_reactions_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'blog_posts'
            referencedColumns: ['id']
          },
        ]
      }
      campos_agendamento: {
        Row: {
          id: string
          label: string
          nome_campo: string
          obrigatorio: boolean | null
          opcoes: Json | null
          ordem: number | null
          placeholder: string | null
          servico_id: string | null
          tenant_id: string | null
          tipo_campo: string
        }
        Insert: {
          id?: string
          label: string
          nome_campo: string
          obrigatorio?: boolean | null
          opcoes?: Json | null
          ordem?: number | null
          placeholder?: string | null
          servico_id?: string | null
          tenant_id?: string | null
          tipo_campo: string
        }
        Update: {
          id?: string
          label?: string
          nome_campo?: string
          obrigatorio?: boolean | null
          opcoes?: Json | null
          ordem?: number | null
          placeholder?: string | null
          servico_id?: string | null
          tenant_id?: string | null
          tipo_campo?: string
        }
        Relationships: [
          {
            foreignKeyName: 'campos_agendamento_servico_id_fkey'
            columns: ['servico_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
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
      contas_bancarias: {
        Row: {
          agencia: string | null
          created_at: string
          id: string
          is_active: boolean
          nome: string
          numero_conta: string | null
          plano_contas_id: string | null
          saldo_inicial: number
          titular: string | null
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          nome: string
          numero_conta?: string | null
          plano_contas_id?: string | null
          saldo_inicial?: number
          titular?: string | null
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          nome?: string
          numero_conta?: string | null
          plano_contas_id?: string | null
          saldo_inicial?: number
          titular?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contas_bancarias_plano_contas_id_fkey'
            columns: ['plano_contas_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
        ]
      }
      contract_additives: {
        Row: {
          content: string
          contract_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          content: string
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          content?: string
          contract_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contract_additives_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contratos'
            referencedColumns: ['id']
          },
        ]
      }
      contract_clause_versions: {
        Row: {
          clause_id: string | null
          content: string
          created_at: string | null
          id: string
          version_label: string
        }
        Insert: {
          clause_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          version_label: string
        }
        Update: {
          clause_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contract_clause_versions_clause_id_fkey'
            columns: ['clause_id']
            isOneToOne: false
            referencedRelation: 'contract_clauses'
            referencedColumns: ['id']
          },
        ]
      }
      contract_clauses: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          status: string | null
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      contract_services: {
        Row: {
          contract_id: string | null
          created_at: string
          id: string
          service_id: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          id?: string
          service_id?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          id?: string
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contract_services_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contratos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contract_services_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      contract_signers: {
        Row: {
          contract_id: string | null
          created_at: string | null
          id: string
          order_index: number | null
          profile_id: string | null
          role: string
          signed_at: string | null
          status: string | null
          viewed_at: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          profile_id?: string | null
          role: string
          signed_at?: string | null
          status?: string | null
          viewed_at?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          profile_id?: string | null
          role?: string
          signed_at?: string | null
          status?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contract_signers_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contratos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contract_signers_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      contract_templates: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contratos: {
        Row: {
          cliente_id: string | null
          conta_id: string | null
          content: string | null
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
          parent_contract_id: string | null
          renovacao_automatica: boolean | null
          responsavel_id: string | null
          signature_order_type: string | null
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
          content?: string | null
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
          parent_contract_id?: string | null
          renovacao_automatica?: boolean | null
          responsavel_id?: string | null
          signature_order_type?: string | null
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
          content?: string | null
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
          parent_contract_id?: string | null
          renovacao_automatica?: boolean | null
          responsavel_id?: string | null
          signature_order_type?: string | null
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
            referencedRelation: 'profiles'
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
            foreignKeyName: 'contratos_parent_contract_id_fkey'
            columns: ['parent_contract_id']
            isOneToOne: false
            referencedRelation: 'contratos'
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
      customer_feedback: {
        Row: {
          client_id: string | null
          comments: string | null
          created_at: string
          id: string
          score: number
          type: string
        }
        Insert: {
          client_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          score: number
          type: string
        }
        Update: {
          client_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          score?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customer_feedback_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      disponibilidade_servicos: {
        Row: {
          ativo: boolean | null
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
          intervalo_minutos: number | null
          servico_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
          intervalo_minutos?: number | null
          servico_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          intervalo_minutos?: number | null
          servico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'disponibilidade_servicos_servico_id_fkey'
            columns: ['servico_id']
            isOneToOne: false
            referencedRelation: 'services'
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
      evaluation_questions: {
        Row: {
          created_at: string
          field_type: string
          id: string
          is_required: boolean
          label: string
          options: Json
          order_index: number
          placeholder: string | null
          service_id: string
        }
        Insert: {
          created_at?: string
          field_type?: string
          id?: string
          is_required?: boolean
          label: string
          options?: Json
          order_index?: number
          placeholder?: string | null
          service_id: string
        }
        Update: {
          created_at?: string
          field_type?: string
          id?: string
          is_required?: boolean
          label?: string
          options?: Json
          order_index?: number
          placeholder?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'evaluation_questions_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
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
      financial_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      financial_charges: {
        Row: {
          amount: number
          asaas_id: string | null
          athlete_id: string | null
          category: string | null
          client_name: string
          conta_destino_id: string | null
          conta_id: string | null
          conta_origem_id: string | null
          created_at: string
          description: string | null
          document: string | null
          due_date: string
          id: string
          master_record_id: string | null
          orcamento_id: string | null
          parcela_numero: number | null
          parcela_total: number | null
          payment_date: string | null
          profile_id: string | null
          realized_amount: number | null
          status: string
          type: string | null
        }
        Insert: {
          amount: number
          asaas_id?: string | null
          athlete_id?: string | null
          category?: string | null
          client_name: string
          conta_destino_id?: string | null
          conta_id?: string | null
          conta_origem_id?: string | null
          created_at?: string
          description?: string | null
          document?: string | null
          due_date: string
          id?: string
          master_record_id?: string | null
          orcamento_id?: string | null
          parcela_numero?: number | null
          parcela_total?: number | null
          payment_date?: string | null
          profile_id?: string | null
          realized_amount?: number | null
          status?: string
          type?: string | null
        }
        Update: {
          amount?: number
          asaas_id?: string | null
          athlete_id?: string | null
          category?: string | null
          client_name?: string
          conta_destino_id?: string | null
          conta_id?: string | null
          conta_origem_id?: string | null
          created_at?: string
          description?: string | null
          document?: string | null
          due_date?: string
          id?: string
          master_record_id?: string | null
          orcamento_id?: string | null
          parcela_numero?: number | null
          parcela_total?: number | null
          payment_date?: string | null
          profile_id?: string | null
          realized_amount?: number | null
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
          {
            foreignKeyName: 'financial_charges_conta_destino_id_fkey'
            columns: ['conta_destino_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_charges_conta_id_fkey'
            columns: ['conta_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_charges_conta_origem_id_fkey'
            columns: ['conta_origem_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_charges_master_record_id_fkey'
            columns: ['master_record_id']
            isOneToOne: false
            referencedRelation: 'financial_master_records'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_charges_orcamento_id_fkey'
            columns: ['orcamento_id']
            isOneToOne: false
            referencedRelation: 'orcamentos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_charges_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      financial_master_records: {
        Row: {
          category: string | null
          client_id: string | null
          client_name: string
          conta_destino_id: string | null
          conta_origem_id: string | null
          created_at: string
          description: string
          id: string
          paid_amount: number | null
          reference_id: string | null
          reference_type: string | null
          status: string
          total_amount: number
          type: string | null
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          client_name: string
          conta_destino_id?: string | null
          conta_origem_id?: string | null
          created_at?: string
          description: string
          id?: string
          paid_amount?: number | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          total_amount?: number
          type?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string | null
          client_name?: string
          conta_destino_id?: string | null
          conta_origem_id?: string | null
          created_at?: string
          description?: string
          id?: string
          paid_amount?: number | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          total_amount?: number
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'financial_master_records_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_master_records_conta_destino_id_fkey'
            columns: ['conta_destino_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financial_master_records_conta_origem_id_fkey'
            columns: ['conta_origem_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
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
          conta_destino_id: string | null
          conta_id: string | null
          conta_origem_id: string | null
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
          conta_destino_id?: string | null
          conta_id?: string | null
          conta_origem_id?: string | null
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
          conta_destino_id?: string | null
          conta_id?: string | null
          conta_origem_id?: string | null
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
            foreignKeyName: 'lancamentos_financeiros_conta_destino_id_fkey'
            columns: ['conta_destino_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lancamentos_financeiros_conta_id_fkey'
            columns: ['conta_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lancamentos_financeiros_conta_origem_id_fkey'
            columns: ['conta_origem_id']
            isOneToOne: false
            referencedRelation: 'plano_contas'
            referencedColumns: ['id']
          },
        ]
      }
      lead_activities: {
        Row: {
          completed: boolean
          content: string | null
          created_at: string
          created_by: string | null
          follow_up_date: string | null
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          completed?: boolean
          content?: string | null
          created_at?: string
          created_by?: string | null
          follow_up_date?: string | null
          id?: string
          lead_id: string
          type?: string
        }
        Update: {
          completed?: boolean
          content?: string | null
          created_at?: string
          created_by?: string | null
          follow_up_date?: string | null
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lead_activities_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'lead_activities_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          diagnostic_data: Json
          email: string | null
          id: string
          last_activity_at: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          score: number
          service_id: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          diagnostic_data?: Json
          email?: string | null
          id?: string
          last_activity_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          score?: number
          service_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          diagnostic_data?: Json
          email?: string | null
          id?: string
          last_activity_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          score?: number
          service_id?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'leads_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'leads_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      maintenance_config: {
        Row: {
          bg_color: string
          bg_image_url: string | null
          bg_opacity: number | null
          bg_video_url: string | null
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
          bg_opacity?: number | null
          bg_video_url?: string | null
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
          bg_opacity?: number | null
          bg_video_url?: string | null
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
          aprovado: boolean | null
          cliente_questionou: boolean | null
          descricao: string | null
          id: string
          orcamento_id: string | null
          produto_id: string | null
          quantidade: number
          servico_id: string | null
          tempo_estimado: number | null
          tempo_executado: number | null
          tipo_item: string | null
          user_id: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          aprovado?: boolean | null
          cliente_questionou?: boolean | null
          descricao?: string | null
          id?: string
          orcamento_id?: string | null
          produto_id?: string | null
          quantidade?: number
          servico_id?: string | null
          tempo_estimado?: number | null
          tempo_executado?: number | null
          tipo_item?: string | null
          user_id?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          aprovado?: boolean | null
          cliente_questionou?: boolean | null
          descricao?: string | null
          id?: string
          orcamento_id?: string | null
          produto_id?: string | null
          quantidade?: number
          servico_id?: string | null
          tempo_estimado?: number | null
          tempo_executado?: number | null
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
          asaas_id: string | null
          cliente_id: string | null
          conta_id: string | null
          created_at: string
          data_conversao: string | null
          data_emissao: string
          data_validade: string | null
          desconto_percentual: number | null
          desconto_valor: number | null
          id: string
          link_enviado: boolean | null
          link_pagamento: string | null
          motivo_rejeicao: string | null
          numero_orcamento: string | null
          observacoes: string | null
          pedido_id: string | null
          responsavel_id: string | null
          status: string
          status_pagamento: string | null
          subtotal: number | null
          total: number | null
          updated_at: string
          user_id: string | null
          valor_impostos: number | null
          veiculo_brand_id: string | null
          veiculo_km: string
          veiculo_model_id: string | null
          veiculo_modelo: string | null
          veiculo_placa: string
        }
        Insert: {
          asaas_id?: string | null
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string
          data_conversao?: string | null
          data_emissao: string
          data_validade?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          id?: string
          link_enviado?: boolean | null
          link_pagamento?: string | null
          motivo_rejeicao?: string | null
          numero_orcamento?: string | null
          observacoes?: string | null
          pedido_id?: string | null
          responsavel_id?: string | null
          status?: string
          status_pagamento?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string | null
          valor_impostos?: number | null
          veiculo_brand_id?: string | null
          veiculo_km?: string
          veiculo_model_id?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string
        }
        Update: {
          asaas_id?: string | null
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string
          data_conversao?: string | null
          data_emissao?: string
          data_validade?: string | null
          desconto_percentual?: number | null
          desconto_valor?: number | null
          id?: string
          link_enviado?: boolean | null
          link_pagamento?: string | null
          motivo_rejeicao?: string | null
          numero_orcamento?: string | null
          observacoes?: string | null
          pedido_id?: string | null
          responsavel_id?: string | null
          status?: string
          status_pagamento?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          user_id?: string | null
          valor_impostos?: number | null
          veiculo_brand_id?: string | null
          veiculo_km?: string
          veiculo_model_id?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orcamentos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'profiles'
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
          {
            foreignKeyName: 'orcamentos_veiculo_brand_id_fkey'
            columns: ['veiculo_brand_id']
            isOneToOne: false
            referencedRelation: 'vehicle_brands'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orcamentos_veiculo_model_id_fkey'
            columns: ['veiculo_model_id']
            isOneToOne: false
            referencedRelation: 'vehicle_models'
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
          veiculo_brand_id: string | null
          veiculo_km: string
          veiculo_model_id: string | null
          veiculo_modelo: string | null
          veiculo_placa: string
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
          veiculo_brand_id?: string | null
          veiculo_km?: string
          veiculo_model_id?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string
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
          veiculo_brand_id?: string | null
          veiculo_km?: string
          veiculo_model_id?: string | null
          veiculo_modelo?: string | null
          veiculo_placa?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pedidos_cliente_id_fkey'
            columns: ['cliente_id']
            isOneToOne: false
            referencedRelation: 'profiles'
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
          {
            foreignKeyName: 'pedidos_veiculo_brand_id_fkey'
            columns: ['veiculo_brand_id']
            isOneToOne: false
            referencedRelation: 'vehicle_brands'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pedidos_veiculo_model_id_fkey'
            columns: ['veiculo_model_id']
            isOneToOne: false
            referencedRelation: 'vehicle_models'
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
          is_client: boolean | null
          is_club: boolean | null
          is_supplier: boolean | null
          mfa_code: string | null
          mfa_code_expires_at: string | null
          mfa_enabled: boolean | null
          mfa_type: string | null
          mfa_verified: boolean | null
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
          id?: string
          is_athlete?: boolean | null
          is_author?: boolean | null
          is_client?: boolean | null
          is_club?: boolean | null
          is_supplier?: boolean | null
          mfa_code?: string | null
          mfa_code_expires_at?: string | null
          mfa_enabled?: boolean | null
          mfa_type?: string | null
          mfa_verified?: boolean | null
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
          is_client?: boolean | null
          is_club?: boolean | null
          is_supplier?: boolean | null
          mfa_code?: string | null
          mfa_code_expires_at?: string | null
          mfa_enabled?: boolean | null
          mfa_type?: string | null
          mfa_verified?: boolean | null
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
          annual_discount: number | null
          annual_promo_discount: number | null
          annual_promo_expires_at: string | null
          annual_value: number
          avulso_discount: number | null
          avulso_promo_discount: number | null
          avulso_promo_expires_at: string | null
          avulso_value: number
          category_id: string | null
          contract_template_id: string | null
          cost_value: number | null
          created_at: string | null
          description: string | null
          evaluation_slug: string | null
          exec_time: string | null
          id: string
          margin_time: number | null
          monthly_discount: number | null
          monthly_promo_discount: number | null
          monthly_promo_expires_at: string | null
          monthly_value: number
          observation: string | null
          sale_value: number | null
          semiannual_discount: number | null
          semiannual_promo_discount: number | null
          semiannual_promo_expires_at: string | null
          semiannual_value: number
          title: string
          updated_at: string | null
        }
        Insert: {
          add_time?: string | null
          annual_discount?: number | null
          annual_promo_discount?: number | null
          annual_promo_expires_at?: string | null
          annual_value?: number
          avulso_discount?: number | null
          avulso_promo_discount?: number | null
          avulso_promo_expires_at?: string | null
          avulso_value?: number
          category_id?: string | null
          contract_template_id?: string | null
          cost_value?: number | null
          created_at?: string | null
          description?: string | null
          evaluation_slug?: string | null
          exec_time?: string | null
          id?: string
          margin_time?: number | null
          monthly_discount?: number | null
          monthly_promo_discount?: number | null
          monthly_promo_expires_at?: string | null
          monthly_value?: number
          observation?: string | null
          sale_value?: number | null
          semiannual_discount?: number | null
          semiannual_promo_discount?: number | null
          semiannual_promo_expires_at?: string | null
          semiannual_value?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          add_time?: string | null
          annual_discount?: number | null
          annual_promo_discount?: number | null
          annual_promo_expires_at?: string | null
          annual_value?: number
          avulso_discount?: number | null
          avulso_promo_discount?: number | null
          avulso_promo_expires_at?: string | null
          avulso_value?: number
          category_id?: string | null
          contract_template_id?: string | null
          cost_value?: number | null
          created_at?: string | null
          description?: string | null
          evaluation_slug?: string | null
          exec_time?: string | null
          id?: string
          margin_time?: number | null
          monthly_discount?: number | null
          monthly_promo_discount?: number | null
          monthly_promo_expires_at?: string | null
          monthly_value?: number
          observation?: string | null
          sale_value?: number | null
          semiannual_discount?: number | null
          semiannual_promo_discount?: number | null
          semiannual_promo_expires_at?: string | null
          semiannual_value?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'services_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'plan_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'services_contract_template_id_fkey'
            columns: ['contract_template_id']
            isOneToOne: false
            referencedRelation: 'contract_templates'
            referencedColumns: ['id']
          },
        ]
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
      support_tickets: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          module: string | null
          parent_ticket_id: string | null
          priority: string | null
          sla_paused_at: string | null
          sla_started_at: string | null
          status: string | null
          technician_id: string | null
          ticket_number: number
          title: string
          total_paused_time_ms: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string | null
          parent_ticket_id?: string | null
          priority?: string | null
          sla_paused_at?: string | null
          sla_started_at?: string | null
          status?: string | null
          technician_id?: string | null
          ticket_number?: number
          title: string
          total_paused_time_ms?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string | null
          parent_ticket_id?: string | null
          priority?: string | null
          sla_paused_at?: string | null
          sla_started_at?: string | null
          status?: string | null
          technician_id?: string | null
          ticket_number?: number
          title?: string
          total_paused_time_ms?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'support_tickets_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'support_tickets_parent_ticket_id_fkey'
            columns: ['parent_ticket_id']
            isOneToOne: false
            referencedRelation: 'support_tickets'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'support_tickets_technician_id_fkey'
            columns: ['technician_id']
            isOneToOne: false
            referencedRelation: 'profiles'
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
          admin_menu_config: Json | null
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
          login_bg_image_url: string | null
          login_impact_text: string | null
          login_subtitle: string | null
          login_title: string | null
          logo_url: string | null
          menu_logo_size: number | null
          mobile: string | null
          phone: string | null
          platform_name: string | null
          quote_footer_text: string | null
          quote_validity_days: number | null
          razao_social: string | null
          records_per_page: number | null
          responsible_cpf: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          responsible_role: string | null
          scheduling_interval_minutes: number | null
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
          admin_menu_config?: Json | null
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
          login_bg_image_url?: string | null
          login_impact_text?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          logo_url?: string | null
          menu_logo_size?: number | null
          mobile?: string | null
          phone?: string | null
          platform_name?: string | null
          quote_footer_text?: string | null
          quote_validity_days?: number | null
          razao_social?: string | null
          records_per_page?: number | null
          responsible_cpf?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          responsible_role?: string | null
          scheduling_interval_minutes?: number | null
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
          admin_menu_config?: Json | null
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
          login_bg_image_url?: string | null
          login_impact_text?: string | null
          login_subtitle?: string | null
          login_title?: string | null
          logo_url?: string | null
          menu_logo_size?: number | null
          mobile?: string | null
          phone?: string | null
          platform_name?: string | null
          quote_footer_text?: string | null
          quote_validity_days?: number | null
          razao_social?: string | null
          records_per_page?: number | null
          responsible_cpf?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          responsible_role?: string | null
          scheduling_interval_minutes?: number | null
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
      ticket_history: {
        Row: {
          action: string
          created_at: string | null
          created_by: string | null
          id: string
          new_status: string | null
          new_technician_id: string | null
          note: string | null
          old_status: string | null
          old_technician_id: string | null
          ticket_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_status?: string | null
          new_technician_id?: string | null
          note?: string | null
          old_status?: string | null
          old_technician_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_status?: string | null
          new_technician_id?: string | null
          note?: string | null
          old_status?: string | null
          old_technician_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'ticket_history_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_history_new_technician_id_fkey'
            columns: ['new_technician_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_history_old_technician_id_fkey'
            columns: ['old_technician_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ticket_history_ticket_id_fkey'
            columns: ['ticket_id']
            isOneToOne: false
            referencedRelation: 'support_tickets'
            referencedColumns: ['id']
          },
        ]
      }
      ticket_sla_configs: {
        Row: {
          created_at: string | null
          escalation_time_minutes: number | null
          id: string
          priority: string
          resolution_time_minutes: number | null
          response_time_minutes: number | null
          start_time_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          escalation_time_minutes?: number | null
          id?: string
          priority: string
          resolution_time_minutes?: number | null
          response_time_minutes?: number | null
          start_time_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          escalation_time_minutes?: number | null
          id?: string
          priority?: string
          resolution_time_minutes?: number | null
          response_time_minutes?: number | null
          start_time_minutes?: number | null
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
      vehicle_brands: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vehicle_models_brand_id_fkey'
            columns: ['brand_id']
            isOneToOne: false
            referencedRelation: 'vehicle_brands'
            referencedColumns: ['id']
          },
        ]
      }
      vehicles: {
        Row: {
          brand_id: string | null
          chassis: string | null
          created_at: string | null
          id: string
          manufacturing_year: number | null
          model_id: string | null
          model_year: number | null
          plate: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          brand_id?: string | null
          chassis?: string | null
          created_at?: string | null
          id?: string
          manufacturing_year?: number | null
          model_id?: string | null
          model_year?: number | null
          plate: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          brand_id?: string | null
          chassis?: string | null
          created_at?: string | null
          id?: string
          manufacturing_year?: number | null
          model_id?: string | null
          model_year?: number | null
          plate?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'vehicles_brand_id_fkey'
            columns: ['brand_id']
            isOneToOne: false
            referencedRelation: 'vehicle_brands'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vehicles_model_id_fkey'
            columns: ['model_id']
            isOneToOne: false
            referencedRelation: 'vehicle_models'
            referencedColumns: ['id']
          },
        ]
      }
      whatsapp_config: {
        Row: {
          account_sid: string | null
          api_provider: string | null
          auth_token: string | null
          created_at: string
          empresa_id: string | null
          id: string
          instance_name: string | null
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
          instance_name?: string | null
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
          instance_name?: string | null
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
      calculate_lead_score: { Args: { diagnostic: Json }; Returns: number }
      check_active_evaluation: {
        Args: { p_email: string; p_service_slug: string }
        Returns: {
          created_at: string
          diagnostic_data: Json
          id: string
          score: number
          status: string
        }[]
      }
      increment_blog_view: { Args: { post_id: string }; Returns: undefined }
      is_master_user: { Args: never; Returns: boolean }
      lookup_profile_by_cnpj: {
        Args: { p_cnpj: string }
        Returns: {
          cpf_cnpj: string
          email: string
          id: string
          name: string
          phone: string
          status: string
          tipo_usuario: string
        }[]
      }
      save_quote_transaction: {
        Args: { p_charges: Json; p_items: Json; p_quote: Json }
        Returns: Json
      }
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
