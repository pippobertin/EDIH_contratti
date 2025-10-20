-- Schema database per EDIH Modulistica

-- Abilita estensione UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella Companies (Aziende)
CREATE TABLE IF NOT EXISTS edih_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    denominazione TEXT NOT NULL,
    partita_iva TEXT NOT NULL UNIQUE,
    codice_fiscale TEXT,
    legale_rappresentante TEXT NOT NULL,
    titolare_effettivo TEXT NOT NULL,
    sede_legale TEXT,
    email TEXT,
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indici per edih_companies
CREATE INDEX IF NOT EXISTS idx_edih_companies_partita_iva ON edih_companies(partita_iva);
CREATE INDEX IF NOT EXISTS idx_edih_companies_created_at ON edih_companies(created_at DESC);

-- Tabella Documents (Documenti caricati)
CREATE TABLE IF NOT EXISTS edih_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES edih_companies(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('visura', 'bilancio')),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    estratto_dati JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indici per edih_documents
CREATE INDEX IF NOT EXISTS idx_edih_documents_company_id ON edih_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_edih_documents_tipo ON edih_documents(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_edih_documents_created_at ON edih_documents(created_at DESC);

-- Tabella Contracts (Contratti generati)
CREATE TABLE IF NOT EXISTS edih_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES edih_companies(id) ON DELETE CASCADE,
    tipo_contratto TEXT NOT NULL CHECK (tipo_contratto IN ('formazione', 'assessment')),
    dati_compilati JSONB NOT NULL,
    documento_generato TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indici per edih_contracts
CREATE INDEX IF NOT EXISTS idx_edih_contracts_company_id ON edih_contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_edih_contracts_tipo ON edih_contracts(tipo_contratto);
CREATE INDEX IF NOT EXISTS idx_edih_contracts_created_at ON edih_contracts(created_at DESC);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_edih_companies_updated_at
    BEFORE UPDATE ON edih_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
-- Per ora disabilitato per semplicità, da abilitare in produzione con autenticazione

-- ALTER TABLE edih_companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE edih_documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE edih_contracts ENABLE ROW LEVEL SECURITY;

-- Storage bucket per i documenti
-- Questo va creato manualmente nella UI di Supabase:
-- Nome bucket: "documents"
-- Public: false (privato)
-- File size limit: 10MB
-- Allowed mime types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/png, image/jpeg

-- Politiche storage (da applicare nel bucket "documents")
-- Policy name: "Allow authenticated uploads"
-- Allowed operations: INSERT
-- Policy definition: true (o autenticazione se implementata)

-- Policy name: "Allow authenticated reads"
-- Allowed operations: SELECT
-- Policy definition: true (o autenticazione se implementata)

-- NOTA: Per la produzione, implementare autenticazione e RLS appropriate
