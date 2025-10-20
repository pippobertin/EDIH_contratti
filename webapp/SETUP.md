# Setup Webapp EDIH Modulistica

Questa guida ti aiuterà a configurare e avviare la webapp per la gestione automatica della modulistica EDIH.

## Prerequisiti

- Node.js 18+ installato
- Account Supabase (gratuito su https://supabase.com)
- API Key OpenAI (https://platform.openai.com)

## 1. Configurazione Supabase

### 1.1 Crea un nuovo progetto Supabase

1. Vai su https://supabase.com e crea un account
2. Crea un nuovo progetto
3. Annota:
   - Project URL (es. `https://xxxxx.supabase.co`)
   - API Key (anon/public)
   - Service Role Key (per operazioni server-side)

### 1.2 Crea il database schema

1. Nella dashboard Supabase, vai su "SQL Editor"
2. Copia e incolla il contenuto del file `supabase-schema.sql`
3. Clicca "Run" per eseguire lo script

### 1.3 Crea lo Storage bucket

1. Vai su "Storage" nella dashboard Supabase
2. Clicca "New bucket"
3. Nome: `documents`
4. Visibilità: **Private**
5. File size limit: `10485760` (10MB)
6. Allowed MIME types:
   - `application/pdf`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `image/png`
   - `image/jpeg`

### 1.4 Configura le Storage Policies

1. Vai sul bucket "documents"
2. Clicca su "Policies"
3. Aggiungi due nuove policy:

**Policy 1 - Upload:**
- Name: `Allow authenticated uploads`
- Allowed operations: `INSERT`
- Policy definition: `true` (per ora, modificare in produzione)

**Policy 2 - Download:**
- Name: `Allow authenticated reads`
- Allowed operations: `SELECT`
- Policy definition: `true` (per ora, modificare in produzione)

## 2. Configurazione Progetto

### 2.1 Installa le dipendenze

```bash
cd webapp
npm install
```

### 2.2 Configura le variabili d'ambiente

1. Copia il file `.env.example` in `.env`:

```bash
cp .env.example .env
```

2. Modifica `.env` con le tue credenziali:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 3. Template dei Contratti

Nella cartella `template/` (livello superiore), inserisci i template dei contratti in formato testo:

- `contratto_formazione.txt` - Template per contratti di formazione
- `contratto_assessment.txt` - Template per contratti di assessment

I template possono contenere placeholder che verranno sostituiti automaticamente dall'AI con i dati estratti dai documenti.

Esempio di placeholder:
- `[DENOMINAZIONE]`
- `[PARTITA_IVA]`
- `[LEGALE_RAPPRESENTANTE]`
- `[TITOLARE_EFFETTIVO]`
- `[SEDE_LEGALE]`
- ecc.

## 4. Avvio dell'applicazione

### Modalità sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su http://localhost:3000

### Build per produzione

```bash
npm run build
npm start
```

## 5. Deploy in produzione

### 5.1 Vercel (consigliato)

1. Installa Vercel CLI: `npm i -g vercel`
2. Nella cartella `webapp`, esegui: `vercel`
3. Segui le istruzioni e configura le variabili d'ambiente nella dashboard Vercel

### 5.2 Altri provider

L'applicazione è compatibile con qualsiasi provider che supporti Next.js (Netlify, AWS, ecc.)

## 6. Configurazione DNS personalizzato

Dopo il deploy:

1. Vai nelle impostazioni del tuo provider di hosting
2. Aggiungi il tuo dominio personalizzato
3. Configura i record DNS come richiesto dal provider
4. Attendi la propagazione DNS (può richiedere fino a 48 ore)

## 7. Note sulla sicurezza

⚠️ **IMPORTANTE PER LA PRODUZIONE:**

1. **Autenticazione**: Implementa un sistema di autenticazione (Supabase Auth o altro)
2. **Row Level Security**: Abilita RLS su Supabase per proteggere i dati
3. **API Keys**: NON esporre mai le API keys nel codice client
4. **HTTPS**: Usa sempre HTTPS in produzione
5. **Backup**: Configura backup automatici su Supabase

## 8. Troubleshooting

### Errore: "Missing Supabase environment variables"
- Verifica che il file `.env` sia presente e configurato correttamente
- Riavvia il server di sviluppo dopo aver modificato `.env`

### Errore: "Failed to upload file"
- Verifica che il bucket "documents" sia stato creato
- Controlla le policies dello storage

### Errore: "Failed to extract data"
- Verifica che l'API key OpenAI sia valida e abbia credito disponibile
- Controlla i log per vedere il messaggio di errore dettagliato

### I documenti caricati non vengono elaborati
- Assicurati che i file siano in formato PDF o DOCX
- Verifica che il contenuto sia leggibile (non scansioni di bassa qualità)

## 9. Supporto

Per problemi o domande:
- Controlla la documentazione di Next.js: https://nextjs.org/docs
- Documentazione Supabase: https://supabase.com/docs
- Documentazione OpenAI: https://platform.openai.com/docs

## 10. Funzionalità future (opzionali)

- [ ] Generazione PDF con layout preservato
- [ ] Generazione Word (DOCX) con formattazione
- [ ] Autenticazione utenti
- [ ] Multi-tenancy
- [ ] Dashboard amministratore
- [ ] Storico revisioni contratti
- [ ] Firma digitale
- [ ] Notifiche email
