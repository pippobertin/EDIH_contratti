// Tipi per l'azienda
export interface Company {
  id?: string;
  denominazione: string;
  partita_iva: string;
  codice_fiscale?: string;
  legale_rappresentante: string;
  titolare_effettivo: string;
  sede_legale?: string;
  email?: string;
  telefono?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipi per i documenti caricati
export interface Document {
  id?: string;
  company_id: string;
  tipo_documento: 'visura' | 'bilancio';
  file_name: string;
  file_path: string;
  file_url?: string;
  estratto_dati?: any;
  created_at?: string;
}

// Tipo per il contratto
export type TipoContratto = 'formazione' | 'assessment';

export interface Contract {
  id?: string;
  company_id: string;
  tipo_contratto: TipoContratto;
  dati_compilati: any;
  documento_generato?: string;
  created_at?: string;
}

// Dati estratti dalla visura camerale
export interface VisuraData {
  denominazione?: string;
  partita_iva?: string;
  codice_fiscale?: string;
  sede_legale?: string;
  indirizzo?: string;
  cap?: string;
  citta?: string;
  provincia?: string;
  legale_rappresentante?: string;
  // Dati personali legale rappresentante
  lr_nato_a?: string;
  lr_nato_prov?: string;
  lr_nato_il?: string;
  lr_residente_a?: string;
  lr_residente_prov?: string;
  lr_residente_via?: string;
  lr_residente_cap?: string;
  lr_codice_fiscale?: string;
  // Dati personali titolare effettivo
  te_nato_a?: string;
  te_nato_il?: string;
  te_residente_in?: string;
  te_residente_via?: string;
  te_codice_fiscale?: string;
  // Altri dati azienda
  forma_giuridica?: string;
  capitale_sociale?: string;
  data_costituzione?: string;
  codice_ateco?: string;
  oggetto_sociale?: string;
}

// Dati estratti dal bilancio
export interface BilancioData {
  anno_riferimento?: string;
  fatturato?: number;
  utile_perdita?: number;
  totale_attivo?: number;
  totale_passivo?: number;
  patrimonio_netto?: number;
  numero_dipendenti?: number;
}

// Dati completi per la compilazione del contratto
export interface ContractData extends Company {
  visura_data?: VisuraData;
  bilancio_data?: BilancioData;
  tipo_servizio: TipoContratto;
  data_inizio_servizio?: string;
  data_fine_servizio?: string;
  durata_ore?: number;
  modalita?: string;
}
