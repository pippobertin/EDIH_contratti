import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client per uso pubblico (frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin per API routes (con service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database schema types
export type Database = {
  public: {
    Tables: {
      edih_companies: {
        Row: {
          id: string;
          denominazione: string;
          partita_iva: string;
          codice_fiscale: string | null;
          legale_rappresentante: string;
          titolare_effettivo: string;
          sede_legale: string | null;
          email: string | null;
          telefono: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['edih_companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['edih_companies']['Insert']>;
      };
      edih_documents: {
        Row: {
          id: string;
          company_id: string;
          tipo_documento: 'visura' | 'bilancio';
          file_name: string;
          file_path: string;
          file_url: string | null;
          estratto_dati: any | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['edih_documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['edih_documents']['Insert']>;
      };
      edih_contracts: {
        Row: {
          id: string;
          company_id: string;
          tipo_contratto: 'formazione' | 'assessment';
          dati_compilati: any;
          documento_generato: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['edih_contracts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['edih_contracts']['Insert']>;
      };
    };
  };
};
