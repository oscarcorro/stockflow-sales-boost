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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          csv_import_pwd_hash: string | null
          id: number
          updated_at: string
        }
        Insert: {
          csv_import_pwd_hash?: string | null
          id?: number
          updated_at?: string
        }
        Update: {
          csv_import_pwd_hash?: string | null
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      attribute_mappings: {
        Row: {
          source: string
          source_keys: string[]
          standard_field: string
          tenant_id: string
        }
        Insert: {
          source: string
          source_keys: string[]
          standard_field: string
          tenant_id: string
        }
        Update: {
          source?: string
          source_keys?: string[]
          standard_field?: string
          tenant_id?: string
        }
        Relationships: []
      }
      attribute_passthrough: {
        Row: {
          allowed_extra_keys: string[]
          source: string
          tenant_id: string
        }
        Insert: {
          allowed_extra_keys: string[]
          source: string
          tenant_id: string
        }
        Update: {
          allowed_extra_keys?: string[]
          source?: string
          tenant_id?: string
        }
        Relationships: []
      }
      ingestion_items: {
        Row: {
          created_at: string
          error_text: string | null
          id: string
          normalized: Json | null
          raw: Json
          row_hash: string | null
          run_id: string
          status: string
        }
        Insert: {
          created_at?: string
          error_text?: string | null
          id?: string
          normalized?: Json | null
          raw: Json
          row_hash?: string | null
          run_id: string
          status?: string
        }
        Update: {
          created_at?: string
          error_text?: string | null
          id?: string
          normalized?: Json | null
          raw?: Json
          row_hash?: string | null
          run_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ingestion_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_runs: {
        Row: {
          created_at: string
          error_rows: number
          file_path: string | null
          finished_at: string | null
          id: string
          notes: string | null
          processed_rows: number
          source: string
          status: string
          tenant_id: string | null
          total_rows: number
        }
        Insert: {
          created_at?: string
          error_rows?: number
          file_path?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          processed_rows?: number
          source: string
          status?: string
          tenant_id?: string | null
          total_rows?: number
        }
        Update: {
          created_at?: string
          error_rows?: number
          file_path?: string | null
          finished_at?: string | null
          id?: string
          notes?: string | null
          processed_rows?: number
          source?: string
          status?: string
          tenant_id?: string | null
          total_rows?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          attributes: Json | null
          brand: string | null
          category: string | null
          color: string
          created_at: string
          deleted_at: string | null
          gender: string | null
          id: string
          image_url: string | null
          name: string
          price: number | null
          priority: string | null
          size: string
          sku: string
          stock_almacen: number
          stock_sala: number
          store_id: string | null
          ubicacion_almacen: string | null
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          brand?: string | null
          category?: string | null
          color: string
          created_at?: string
          deleted_at?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          priority?: string | null
          size: string
          sku: string
          stock_almacen?: number
          stock_sala?: number
          store_id?: string | null
          ubicacion_almacen?: string | null
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          brand?: string | null
          category?: string | null
          color?: string
          created_at?: string
          deleted_at?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          priority?: string | null
          size?: string
          sku?: string
          stock_almacen?: number
          stock_sala?: number
          store_id?: string | null
          ubicacion_almacen?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_store_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "points_of_sale"
            referencedColumns: ["id"]
          },
        ]
      }
      points_of_sale: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      pos_events: {
        Row: {
          event_type: string
          idempotency_key: string
          inserted_at: string
          quantity: number
          raw_payload: Json | null
          sku: string
          source: string | null
        }
        Insert: {
          event_type: string
          idempotency_key: string
          inserted_at?: string
          quantity: number
          raw_payload?: Json | null
          sku: string
          source?: string | null
        }
        Update: {
          event_type?: string
          idempotency_key?: string
          inserted_at?: string
          quantity?: number
          raw_payload?: Json | null
          sku?: string
          source?: string | null
        }
        Relationships: []
      }
      product_barcodes: {
        Row: {
          code: string
          created_at: string
          id: string
          product_id: string
          type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          product_id: string
          type?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          product_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_barcodes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      product_external_refs: {
        Row: {
          created_at: string
          external_id: string
          id: string
          product_id: string
          system: string
        }
        Insert: {
          created_at?: string
          external_id: string
          id?: string
          product_id: string
          system: string
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: string
          product_id?: string
          system?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_external_refs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      replenishment_queue: {
        Row: {
          created_at: string
          id: string
          inventory_id: string
          priority: string
          quantity_needed: number
          status: Database["public"]["Enums"]["rq_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_id: string
          priority?: string
          quantity_needed?: number
          status?: Database["public"]["Enums"]["rq_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_id?: string
          priority?: string
          quantity_needed?: number
          status?: Database["public"]["Enums"]["rq_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "replenishment_queue_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: true
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_history: {
        Row: {
          color: string
          created_at: string
          id: string
          point_of_sale_id: string | null
          product_name: string
          quantity_sold: number
          remaining_stock: number | null
          replenishment_generated: boolean
          sale_date: string
          size: string
          sku: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          point_of_sale_id?: string | null
          product_name: string
          quantity_sold?: number
          remaining_stock?: number | null
          replenishment_generated?: boolean
          sale_date?: string
          size: string
          sku: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          point_of_sale_id?: string | null
          product_name?: string
          quantity_sold?: number
          remaining_stock?: number | null
          replenishment_generated?: boolean
          sale_date?: string
          size?: string
          sku?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_cancel_replenishment: {
        Args: { p_replenishment_id: string }
        Returns: undefined
      }
      fn_complete_replenishment: {
        Args: { p_qty?: number; p_replenishment_id: string }
        Returns: undefined
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_csv_password_set: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_ingestion_run: {
        Args: { p_run_id: string }
        Returns: {
          failed: number
          processed: number
          succeeded: number
        }[]
      }
      process_pos_event: {
        Args: {
          p_event_type: string
          p_idempotency_key: string
          p_point_of_sale_id?: string
          p_quantity: number
          p_sku: string
        }
        Returns: undefined
      }
      secure_search_path: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_csv_import_password: {
        Args: { p_new_password: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      upsert_inventory_item: {
        Args: { p_payload: Json }
        Returns: undefined
      }
      verify_csv_password: {
        Args: { p_password: string }
        Returns: boolean
      }
    }
    Enums: {
      rq_status: "pending" | "completed" | "cancelled"
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
  public: {
    Enums: {
      rq_status: ["pending", "completed", "cancelled"],
    },
  },
} as const
