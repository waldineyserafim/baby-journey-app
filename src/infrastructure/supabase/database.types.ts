export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      appointment_files: {
        Row: {
          appointment_id: string
          created_at: string | null
          file_name: string
          file_type: string
          id: string
          storage_path: string
          tenant_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          file_name: string
          file_type: string
          id?: string
          storage_path: string
          tenant_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          file_name?: string
          file_type?: string
          id?: string
          storage_path?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_files_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_at: string
          appointment_type: string
          clinic_name: string | null
          created_at: string | null
          doctor_name: string | null
          id: string
          notes: string | null
          pregnancy_id: string
          status: string | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          appointment_at: string
          appointment_type?: string
          clinic_name?: string | null
          created_at?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          pregnancy_id: string
          status?: string | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          appointment_at?: string
          appointment_type?: string
          clinic_name?: string | null
          created_at?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          pregnancy_id?: string
          status?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      baby_development_content: {
        Row: {
          common_symptoms: string[] | null
          created_at: string | null
          curiosities: string | null
          development_summary: string
          fruit_emoji: string | null
          fruit_name: string
          id: string
          important_care: string | null
          mom_changes: string | null
          organ_development: string | null
          recommended_exercises: string | null
          recommended_food: string | null
          size_cm: number | null
          week: number
          weight_g: number | null
        }
        Insert: {
          common_symptoms?: string[] | null
          created_at?: string | null
          curiosities?: string | null
          development_summary: string
          fruit_emoji?: string | null
          fruit_name: string
          id?: string
          important_care?: string | null
          mom_changes?: string | null
          organ_development?: string | null
          recommended_exercises?: string | null
          recommended_food?: string | null
          size_cm?: number | null
          week: number
          weight_g?: number | null
        }
        Update: {
          common_symptoms?: string[] | null
          created_at?: string | null
          curiosities?: string | null
          development_summary?: string
          fruit_emoji?: string | null
          fruit_name?: string
          id?: string
          important_care?: string | null
          mom_changes?: string | null
          organ_development?: string | null
          recommended_exercises?: string | null
          recommended_food?: string | null
          size_cm?: number | null
          week?: number
          weight_g?: number | null
        }
        Relationships: []
      }
      birth_plan: {
        Row: {
          additional_notes: string | null
          analgesia_preference: string | null
          birth_position_preferences: string[] | null
          breastfeeding_intention: boolean | null
          companion_name: string | null
          cord_cutting_preference: string | null
          created_at: string | null
          doctor_name: string | null
          hospital_name: string | null
          id: string
          music_preferences: string | null
          pain_management_options: string[] | null
          pregnancy_id: string
          skin_to_skin: boolean | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          analgesia_preference?: string | null
          birth_position_preferences?: string[] | null
          breastfeeding_intention?: boolean | null
          companion_name?: string | null
          cord_cutting_preference?: string | null
          created_at?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          id?: string
          music_preferences?: string | null
          pain_management_options?: string[] | null
          pregnancy_id: string
          skin_to_skin?: boolean | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          analgesia_preference?: string | null
          birth_position_preferences?: string[] | null
          breastfeeding_intention?: boolean | null
          companion_name?: string | null
          cord_cutting_preference?: string | null
          created_at?: string | null
          doctor_name?: string | null
          hospital_name?: string | null
          id?: string
          music_preferences?: string | null
          pain_management_options?: string[] | null
          pregnancy_id?: string
          skin_to_skin?: boolean | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "birth_plan_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: true
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birth_plan_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contractions: {
        Row: {
          contraction_end: string | null
          contraction_start: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          intensity: string | null
          interval_seconds: number | null
          notes: string | null
          pregnancy_id: string
          tenant_id: string
        }
        Insert: {
          contraction_end?: string | null
          contraction_start: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          intensity?: string | null
          interval_seconds?: number | null
          notes?: string | null
          pregnancy_id: string
          tenant_id: string
        }
        Update: {
          contraction_end?: string | null
          contraction_start?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          intensity?: string | null
          interval_seconds?: number | null
          notes?: string | null
          pregnancy_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractions_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_entries: {
        Row: {
          content: string
          created_at: string | null
          energy_level: number | null
          entry_date: string
          id: string
          mood: string | null
          photo_storage_path: string | null
          pregnancy_id: string
          tenant_id: string
          updated_at: string | null
          week_number: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          energy_level?: number | null
          entry_date: string
          id?: string
          mood?: string | null
          photo_storage_path?: string | null
          pregnancy_id: string
          tenant_id: string
          updated_at?: string | null
          week_number?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          energy_level?: number | null
          entry_date?: string
          id?: string
          mood?: string | null
          photo_storage_path?: string | null
          pregnancy_id?: string
          tenant_id?: string
          updated_at?: string | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diary_entries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string | null
          document_name: string
          file_type: string
          id: string
          notes: string | null
          pregnancy_id: string | null
          storage_path: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          document_name: string
          file_type: string
          id?: string
          notes?: string | null
          pregnancy_id?: string | null
          storage_path: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          document_name?: string
          file_type?: string
          id?: string
          notes?: string | null
          pregnancy_id?: string | null
          storage_path?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_files: {
        Row: {
          created_at: string | null
          exam_id: string
          file_name: string
          file_type: string
          id: string
          storage_path: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          exam_id: string
          file_name: string
          file_type: string
          id?: string
          storage_path: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          exam_id?: string
          file_name?: string
          file_type?: string
          id?: string
          storage_path?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_files_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_files_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          clinic_name: string | null
          created_at: string | null
          doctor_name: string | null
          exam_date: string
          exam_name: string
          exam_type: string
          id: string
          notes: string | null
          pregnancy_id: string
          result: string | null
          tenant_id: string
          updated_at: string | null
          week_number: number | null
        }
        Insert: {
          clinic_name?: string | null
          created_at?: string | null
          doctor_name?: string | null
          exam_date: string
          exam_name: string
          exam_type?: string
          id?: string
          notes?: string | null
          pregnancy_id: string
          result?: string | null
          tenant_id: string
          updated_at?: string | null
          week_number?: number | null
        }
        Update: {
          clinic_name?: string | null
          created_at?: string | null
          doctor_name?: string | null
          exam_date?: string
          exam_name?: string
          exam_type?: string
          id?: string
          notes?: string | null
          pregnancy_id?: string
          result?: string | null
          tenant_id?: string
          updated_at?: string | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_bag_items: {
        Row: {
          created_at: string | null
          id: string
          item_name: string
          notes: string | null
          person: string
          pregnancy_id: string
          sort_order: number | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_name: string
          notes?: string | null
          person?: string
          pregnancy_id: string
          sort_order?: number | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          person?: string
          pregnancy_id?: string
          sort_order?: number | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_bag_items_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_bag_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kick_counts: {
        Row: {
          count_date: string
          created_at: string | null
          id: string
          kick_count: number
          notes: string | null
          pregnancy_id: string
          session_end: string | null
          session_start: string | null
          tenant_id: string
          week_number: number | null
        }
        Insert: {
          count_date: string
          created_at?: string | null
          id?: string
          kick_count?: number
          notes?: string | null
          pregnancy_id: string
          session_end?: string | null
          session_start?: string | null
          tenant_id: string
          week_number?: number | null
        }
        Update: {
          count_date?: string
          created_at?: string | null
          id?: string
          kick_count?: number
          notes?: string | null
          pregnancy_id?: string
          session_end?: string | null
          session_start?: string | null
          tenant_id?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kick_counts_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kick_counts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      layette_catalog: {
        Row: {
          base_recommendation: string | null
          category: string
          created_at: string | null
          criticality: string
          description: string | null
          id: string
          ideal_quantity: number | null
          is_active: boolean | null
          item_name: string
          price_brl_max: number | null
          price_brl_min: number | null
          price_usd_max: number | null
          price_usd_min: number | null
          sort_order: number | null
          updated_at: string | null
          usage_period: string
        }
        Insert: {
          base_recommendation?: string | null
          category: string
          created_at?: string | null
          criticality?: string
          description?: string | null
          id?: string
          ideal_quantity?: number | null
          is_active?: boolean | null
          item_name: string
          price_brl_max?: number | null
          price_brl_min?: number | null
          price_usd_max?: number | null
          price_usd_min?: number | null
          sort_order?: number | null
          updated_at?: string | null
          usage_period?: string
        }
        Update: {
          base_recommendation?: string | null
          category?: string
          created_at?: string | null
          criticality?: string
          description?: string | null
          id?: string
          ideal_quantity?: number | null
          is_active?: boolean | null
          item_name?: string
          price_brl_max?: number | null
          price_brl_min?: number | null
          price_usd_max?: number | null
          price_usd_min?: number | null
          sort_order?: number | null
          updated_at?: string | null
          usage_period?: string
        }
        Relationships: []
      }
      layette_user_items: {
        Row: {
          catalog_id: string
          created_at: string | null
          discount_obtained: number | null
          id: string
          notes: string | null
          paid_value: number | null
          planned_value: number | null
          pregnancy_id: string
          purchase_date: string | null
          quantity_ideal: number | null
          quantity_purchased: number | null
          quantity_received: number | null
          status: string | null
          store_name: string | null
          tenant_id: string
          updated_at: string | null
          user_recommendation: string | null
        }
        Insert: {
          catalog_id: string
          created_at?: string | null
          discount_obtained?: number | null
          id?: string
          notes?: string | null
          paid_value?: number | null
          planned_value?: number | null
          pregnancy_id: string
          purchase_date?: string | null
          quantity_ideal?: number | null
          quantity_purchased?: number | null
          quantity_received?: number | null
          status?: string | null
          store_name?: string | null
          tenant_id: string
          updated_at?: string | null
          user_recommendation?: string | null
        }
        Update: {
          catalog_id?: string
          created_at?: string | null
          discount_obtained?: number | null
          id?: string
          notes?: string | null
          paid_value?: number | null
          planned_value?: number | null
          pregnancy_id?: string
          purchase_date?: string | null
          quantity_ideal?: number | null
          quantity_purchased?: number | null
          quantity_received?: number | null
          status?: string | null
          store_name?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_recommendation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "layette_user_items_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "layette_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "layette_user_items_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "layette_user_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_media: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          media_type: string
          milestone_id: string
          storage_path: string
          tenant_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type: string
          milestone_id: string
          storage_path: string
          tenant_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string
          milestone_id?: string
          storage_path?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_media_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "timeline_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      move_checklist_items: {
        Row: {
          category: string
          created_at: string | null
          due_date: string | null
          id: string
          item_name: string
          notes: string | null
          sort_order: number | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          item_name: string
          notes?: string | null
          sort_order?: number | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          sort_order?: number | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "move_checklist_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      move_plan: {
        Row: {
          created_at: string | null
          destination_city: string
          destination_country: string | null
          destination_state: string
          id: string
          notes: string | null
          planned_move_date: string
          pregnancy_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination_city: string
          destination_country?: string | null
          destination_state: string
          id?: string
          notes?: string | null
          planned_move_date: string
          pregnancy_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination_city?: string
          destination_country?: string | null
          destination_state?: string
          id?: string
          notes?: string | null
          planned_move_date?: string
          pregnancy_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "move_plan_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_plan_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          is_sent: boolean | null
          message: string
          reference_id: string | null
          reference_type: string | null
          scheduled_for: string
          tenant_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message: string
          reference_id?: string | null
          reference_type?: string | null
          scheduled_for: string
          tenant_id: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_sent?: boolean | null
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          scheduled_for?: string
          tenant_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          category: string
          created_at: string | null
          id: string
          is_public: boolean | null
          photo_date: string
          pregnancy_id: string
          storage_path: string
          tenant_id: string
          week_number: number | null
        }
        Insert: {
          caption?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          photo_date: string
          pregnancy_id: string
          storage_path: string
          tenant_id: string
          week_number?: number | null
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          photo_date?: string
          pregnancy_id?: string
          storage_path?: string
          tenant_id?: string
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancies: {
        Row: {
          actual_birth_date: string | null
          baby_name: string | null
          baby_sex: string | null
          created_at: string | null
          due_date: string
          id: string
          lmp_date: string
          notes: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          actual_birth_date?: string | null
          baby_name?: string | null
          baby_sex?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          lmp_date: string
          notes?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          actual_birth_date?: string | null
          baby_name?: string | null
          baby_sex?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          lmp_date?: string
          notes?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pregnancies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          nickname: string | null
          phone: string | null
          role: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          nickname?: string | null
          phone?: string | null
          role?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          nickname?: string | null
          phone?: string | null
          role?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      symptoms_log: {
        Row: {
          blood_glucose: number | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string | null
          heartburn_level: number | null
          id: string
          log_date: string
          nausea_level: number | null
          notes: string | null
          pain_description: string | null
          pregnancy_id: string
          swelling_level: number | null
          tenant_id: string
          vomiting: boolean | null
          week_number: number | null
          weight_kg: number | null
        }
        Insert: {
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string | null
          heartburn_level?: number | null
          id?: string
          log_date: string
          nausea_level?: number | null
          notes?: string | null
          pain_description?: string | null
          pregnancy_id: string
          swelling_level?: number | null
          tenant_id: string
          vomiting?: boolean | null
          week_number?: number | null
          weight_kg?: number | null
        }
        Update: {
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string | null
          heartburn_level?: number | null
          id?: string
          log_date?: string
          nausea_level?: number | null
          notes?: string | null
          pain_description?: string | null
          pregnancy_id?: string
          swelling_level?: number | null
          tenant_id?: string
          vomiting?: boolean | null
          week_number?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_log_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symptoms_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      timeline_milestones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          milestone_date: string
          milestone_type: string
          pregnancy_id: string
          tenant_id: string
          title: string
          updated_at: string | null
          week_number: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          milestone_date: string
          milestone_type: string
          pregnancy_id: string
          tenant_id: string
          title: string
          updated_at?: string | null
          week_number?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          milestone_date?: string
          milestone_type?: string
          pregnancy_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_milestones_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_milestones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccines: {
        Row: {
          applied_date: string | null
          created_at: string | null
          id: string
          notes: string | null
          pregnancy_id: string
          scheduled_date: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          vaccine_name: string
        }
        Insert: {
          applied_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          pregnancy_id: string
          scheduled_date?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          vaccine_name: string
        }
        Update: {
          applied_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          pregnancy_id?: string
          scheduled_date?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccines_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_role: { Args: never; Returns: string }
      auth_tenant_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
