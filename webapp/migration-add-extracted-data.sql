-- Migrazione: Aggiunta campi per dati estratti da MyGPT
-- Data: 2025-10-19
-- Descrizione: Aggiunge campi JSONB per salvare dati estratti da visura e bilancio direttamente nell'azienda

-- Aggiungi campi per dati estratti
ALTER TABLE edih_companies
ADD COLUMN IF NOT EXISTS visura_data JSONB,
ADD COLUMN IF NOT EXISTS bilancio_data JSONB,
ADD COLUMN IF NOT EXISTS tipo_servizio TEXT CHECK (tipo_servizio IN ('formazione', 'assessment'));

-- Indice per tipo_servizio
CREATE INDEX IF NOT EXISTS idx_edih_companies_tipo_servizio ON edih_companies(tipo_servizio);

-- Commenti per documentazione
COMMENT ON COLUMN edih_companies.visura_data IS 'Dati estratti dalla visura camerale (JSON flat dal MyGPT)';
COMMENT ON COLUMN edih_companies.bilancio_data IS 'Dati estratti dal bilancio aziendale (JSON flat dal MyGPT)';
COMMENT ON COLUMN edih_companies.tipo_servizio IS 'Tipo di servizio EDIH: formazione o assessment';
