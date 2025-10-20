# EDIH - Sistema di Gestione Modulistica Automatizzata

Sistema web per la compilazione automatica di contratti e modulistica utilizzando l'intelligenza artificiale, sviluppato per i servizi EDIH (European Digital Innovation Hub) finanziati dall'Unione Europea.

## Descrizione

Questa webapp permette di:
- Registrare le aziende partecipanti ai servizi EDIH
- Caricare visure camerali e bilanci aziendali
- Estrarre automaticamente i dati rilevanti tramite AI (OpenAI GPT-4)
- Generare contratti e allegati compilati automaticamente
- Esportare la documentazione in formato testo/PDF

## Servizi Supportati

1. **Formazione AI**: Contratti per corsi di formazione sull'intelligenza artificiale per imprenditori
2. **Assessment Maturità Digitale**: Contratti per servizi di valutazione della maturità digitale aziendale

## Struttura del Progetto

```
MODULISTICA EDIH/
├── template/                          # Template dei contratti
│   ├── contratto_formazione_ESEMPIO.txt
│   └── contratto_assessment_ESEMPIO.txt
│
└── webapp/                            # Applicazione Next.js
    ├── src/
    │   ├── app/                       # Pages e routing (Next.js 14)
    │   │   ├── api/                   # API routes
    │   │   │   ├── companies/         # CRUD aziende
    │   │   │   ├── upload/            # Upload documenti
    │   │   │   ├── extract/           # Estrazione dati con AI
    │   │   │   └── generate/          # Generazione contratti
    │   │   ├── dashboard/             # Dashboard principale
    │   │   ├── register/              # Registrazione aziende
    │   │   ├── layout.tsx             # Layout globale
    │   │   ├── page.tsx               # Homepage
    │   │   └── globals.css            # Stili globali
    │   │
    │   ├── components/                # Componenti React
    │   │   ├── CompanyRegistrationForm.tsx
    │   │   └── DocumentUpload.tsx
    │   │
    │   ├── lib/                       # Utilities e client
    │   │   ├── supabase.ts           # Client Supabase
    │   │   └── openai.ts             # Client OpenAI
    │   │
    │   └── types/                     # TypeScript types
    │       └── index.ts
    │
    ├── public/                        # File statici
    ├── package.json                   # Dipendenze
    ├── tsconfig.json                  # Config TypeScript
    ├── tailwind.config.ts             # Config Tailwind CSS
    ├── next.config.js                 # Config Next.js
    ├── supabase-schema.sql            # Schema database
    ├── SETUP.md                       # Guida setup dettagliata
    └── .env.example                   # Esempio variabili ambiente
```

## Tecnologie Utilizzate

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4 API
- **UI Components**: Lucide Icons, React Dropzone

## Flusso di Lavoro

1. **Registrazione Azienda**
   - L'utente inserisce i dati base dell'azienda (denominazione, P.IVA, legale rappresentante)
   - Inserimento manuale del titolare effettivo (ottenuto tramite MyGPT esterno)
   - Dati salvati su Supabase

2. **Upload Documenti**
   - Caricamento visura camerale (PDF/DOCX/immagine)
   - Caricamento bilancio aziendale (PDF/DOCX/immagine)
   - File salvati su Supabase Storage

3. **Estrazione Dati**
   - OpenAI GPT-4 analizza i documenti
   - Estrazione automatica di:
     - Dati visura: denominazione, P.IVA, CF, sede, forma giuridica, capitale sociale, ecc.
     - Dati bilancio: fatturato, utile/perdita, attivo, passivo, dipendenti, ecc.
   - Dati estratti salvati in formato JSON

4. **Generazione Contratti**
   - Selezione tipo di servizio (formazione o assessment)
   - AI compila i template con i dati estratti
   - Generazione documento finale
   - Download in formato testo (espandibile a PDF/DOCX)

## Setup Rapido

1. **Clona il progetto**
   ```bash
   cd "MODULISTICA EDIH/webapp"
   ```

2. **Installa dipendenze**
   ```bash
   npm install
   ```

3. **Configura ambiente**
   - Copia `.env.example` in `.env`
   - Inserisci le credenziali Supabase e OpenAI

4. **Configura Supabase**
   - Esegui lo script `supabase-schema.sql` nella dashboard Supabase
   - Crea il bucket "documents" nello Storage

5. **Avvia in sviluppo**
   ```bash
   npm run dev
   ```

6. **Inserisci i template**
   - Copia i tuoi contratti nella cartella `template/`
   - Usa i file di esempio come riferimento

Per istruzioni dettagliate, consulta [SETUP.md](webapp/SETUP.md)

## Configurazione Template

I template dei contratti devono essere file di testo (`.txt`) posizionati nella cartella `template/`:

- `contratto_formazione.txt` - Per servizi di formazione
- `contratto_assessment.txt` - Per servizi di assessment

### Placeholder Disponibili

I seguenti placeholder verranno sostituiti automaticamente:

**Dati Azienda:**
- `[DENOMINAZIONE]`
- `[PARTITA_IVA]`
- `[CODICE_FISCALE]`
- `[LEGALE_RAPPRESENTANTE]`
- `[TITOLARE_EFFETTIVO]`
- `[SEDE_LEGALE]`
- `[EMAIL]`
- `[TELEFONO]`

**Dati Visura:**
- `[FORMA_GIURIDICA]`
- `[CAPITALE_SOCIALE]`
- `[DATA_COSTITUZIONE]`
- `[CODICE_ATECO]`
- `[OGGETTO_SOCIALE]`

**Dati Bilancio:**
- `[ANNO_BILANCIO]`
- `[FATTURATO]`
- `[UTILE_PERDITA]`
- `[TOTALE_ATTIVO]`
- `[TOTALE_PASSIVO]`
- `[PATRIMONIO_NETTO]`
- `[NUMERO_DIPENDENTI]`

**Dati Servizio:**
- `[DURATA_ORE]`
- `[MODALITA_EROGAZIONE]`
- `[DATA_INIZIO]`
- `[DATA_FINE]`

## Credenziali Necessarie

Per utilizzare l'applicazione servono:

1. **Supabase**
   - URL progetto
   - Anon Key
   - Service Role Key
   - Account gratuito: https://supabase.com

2. **OpenAI**
   - API Key
   - Modello consigliato: GPT-4 Turbo
   - Account: https://platform.openai.com

## Deploy in Produzione

L'applicazione può essere deployata su:
- **Vercel** (consigliato per Next.js)
- **Netlify**
- **AWS Amplify**
- Qualsiasi provider che supporti Next.js

### Deploy su Vercel

```bash
npm i -g vercel
cd webapp
vercel
```

Configura le variabili d'ambiente nella dashboard Vercel.

## Sicurezza

⚠️ **Importante per la produzione:**

- [ ] Implementare autenticazione utenti
- [ ] Abilitare Row Level Security su Supabase
- [ ] Configurare CORS appropriati
- [ ] Usare HTTPS
- [ ] Validare input utente
- [ ] Limitare dimensione upload
- [ ] Implementare rate limiting
- [ ] Configurare backup database

## Funzionalità Future

- [ ] Generazione PDF con layout preservato
- [ ] Generazione DOCX formattati
- [ ] Firma digitale documenti
- [ ] Invio email automatico
- [ ] Dashboard amministratore
- [ ] Storico revisioni
- [ ] Multi-lingua
- [ ] Batch processing

## Supporto e Documentazione

- **Setup dettagliato**: [webapp/SETUP.md](webapp/SETUP.md)
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **OpenAI**: https://platform.openai.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## Licenza

Sviluppato per il progetto EDIH finanziato dall'Unione Europea.

## Note

- I file nella cartella `template/` con suffisso `_ESEMPIO.txt` sono template di riferimento
- Sostituiscili con i tuoi contratti reali prima del deployment
- I dati sensibili non vengono mai esposti al client
- L'estrazione AI può richiedere 10-30 secondi per documento
- Costi API OpenAI: circa $0.01-0.05 per documento analizzato

---

**Pronto per l'uso!** Segui il file SETUP.md per la configurazione completa.
