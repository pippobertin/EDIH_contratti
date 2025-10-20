# Prossimi Passi - Webapp EDIH Modulistica

## ✅ STATO ATTUALE - Sessione 19/10/2025

### 🚀 SISTEMA COMPLETAMENTE RINNOVATO!

**Nuovo flusso con MyGPT:**
1. ✅ **Eliminato caricamento PDF** - Ora si usa MyGPT "EDIH - Estrattore Dati Modulistica"
2. ✅ **Form semplificato** - Solo 2 textarea (visura + bilancio) + selezione servizio
3. ✅ **Tutto in una pagina** - Import JSON → Genera → Download (10-15 secondi totali)
4. ✅ **Placeholder completi** - Aggiunti {ula}, {dimensione}, {collegamento}, {attivo_bilancio}
5. ✅ **MyGPT ottimizzato** - Istruzioni corrette per estrazione dati completa

### 📋 Funzionalità Implementate:

**MyGPT Configuration:**
- Chiede ULA all'utente prima di procedere
- Calcola dimensione azienda (MICRO/PICCOLA/MEDIA/GRANDE) con criteri UE
- Identifica titolare effettivo secondo normativa italiana
- Determina collegamento (SINGOLA/COLLEGATA/ASSOCIATA)
- Output JSON flat pronto per copy-paste

**App Features:**
- Import JSON separati per visura e bilancio
- Anteprima dati importati con validazione
- Generazione automatica contratto + tutti gli allegati
- Download immediato nella stessa pagina
- Reset e nuovo contratto senza refresh

---

## ⚠️ STORICO - Sessione 18/10/2025

### 🔧 Problemi Risolti:
1. ✅ **Token limit OpenAI** - Cambiato modello da `gpt-3.5-turbo` → `gpt-4o-mini` (supporta 128k tokens vs 16k)
2. ✅ **Supabase Storage 404** - Creato client `supabaseAdmin` con SERVICE_ROLE_KEY per operazioni backend
3. ✅ **Download contratti falliva** - Implementato signed URLs al posto di public URLs
4. ✅ **Estrazione documenti** - Ora funziona con gpt-4o-mini, documenti recenti hanno dati estratti

### ❌ PROBLEMA RISOLTO - DATI MANCANTI NEI CONTRATTI

**Sintomo:**
I contratti DOCX vengono generati ma i placeholder non vengono compilati con i dati estratti da visura e bilancio.

**Template data mostra solo 9 campi invece dei ~40 attesi:**
```json
{
  "denominazione": "BLMProject Srl",
  "partita_iva": "IT02652950425",
  "legale_rappresentante": "Chiara Canzi",
  "titolare_effettivo": "Chiara Canzi",
  "tipo_servizio": "formazione",
  "data_contratto": "18/10/2025",
  "id": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

**Mancano completamente:**
- Dati indirizzo (indirizzo, cap, città, provincia, sede_legale)
- Dati legale rappresentante (lr_nato_a, lr_nato_prov, lr_nato_il, lr_residente_a, lr_codice_fiscale, etc.)
- Dati titolare effettivo (te_nato_a, te_nato_il, te_residente_in, te_codice_fiscale, etc.)
- Dati bilancio (fatturato, patrimonio_netto, utile_perdita, numero_dipendenti, etc.)
- Altri dati azienda (forma_giuridica, capitale_sociale, data_costituzione, codice_ateco, oggetto_sociale)

**Cosa abbiamo scoperto:**

1. **Database CHECK** (`/api/debug-db`):
   - ✅ Documenti recenti (ID 1-12) HANNO `estratto_dati` popolato
   - ❌ Documenti vecchi (ID 13-18) hanno `estratto_dati = null` (fallimenti token limit)

2. **Struttura dati OpenAI** (dalla visura):
   ```json
   {
     "DATI AZIENDA": {
       "indirizzo": "Via Roma 15",
       "cap": "00100",
       "citta": "Roma",
       "provincia": "RM",
       ...
     },
     "DATI PERSONALI LEGALE RAPPRESENTANTE": {
       "lr_nato_a": "Roma",
       "lr_nato_prov": "RM",
       ...
     },
     "DATI PERSONALI TITOLARE EFFETTIVO": {
       "te_nato_a": "Milano",
       ...
     }
   }
   ```

3. **Fix applicato** (in `/lib/docx.ts`):
   - Modificato `prepareTemplateData()` per accedere ai dati nidificati:
   ```typescript
   const datiAzienda = visura['DATI AZIENDA'] || visura;
   const datiLR = visura['DATI PERSONALI LEGALE RAPPRESENTANTE'] || visura;
   const datiTE = visura['DATI PERSONALI TITOLARE EFFETTIVO'] || visura;
   ```
   - Usato questi oggetti per popolare i campi template
   - ❌ **NON HA RISOLTO** - I dati mancano ancora

4. **Log di debug aggiunti** (in `/api/generate/route.ts` righe 52-67):
   - Log per vedere se documenti vengono trovati
   - Log per vedere se `estratto_dati` è presente
   - Log per vedere se `visura_data` e `bilancio_data` vengono passati a `contractData`
   - ⚠️ **Questi log NON appaiono nel terminale** - possibile problema caching Next.js

## ✅ COMPLETATO - Sessione 20/10/2025

### 1. ✅ Allegato 10a - Titolarità Effettiva - ESCLUSO
**Decisione**: Escluso dalla generazione automatica

**Motivazione**:
L'allegato richiede compilazione manuale per le sue caratteristiche complesse:
- 4 opzioni mutualmente esclusive da selezionare manualmente
- Possibilità di multiple persone fisiche come titolari effettivi
- Sezione "coincide/non coincide" che richiede confronto dati storici vs attuali
- Allegazione documentazione probatoria
- Validazione legale caso per caso

**Implementazione**:
- Rimosso `titolarita_effettiva` dalla lista `TEMPLATE_FILES.allegati` in `/lib/docx.ts` (righe 215-217)
- Aggiunto commento esplicativo nel codice
- Template disponibile in `template/` per compilazione manuale se necessario

### 2. ✅ DSAN Regolare Esecuzione - Flag Tipo Servizio
**Implementazione completata**:

**Codice modificato** (`/lib/docx.ts` righe 158-163):
```typescript
if (data.tipo_servizio) {
  templateData.tipo_servizio = data.tipo_servizio;
  // Versione formattata per i documenti
  templateData.tipo_servizio_formattato =
    data.tipo_servizio === 'formazione' ? 'Formazione' : 'Assessment';
}
```

**Template modificato**:
- Sostituita lista completa servizi con placeholder `{tipo_servizio_formattato}`
- Il documento ora mostra automaticamente "Formazione" o "Assessment" in base alla selezione utente
- Template: `template/Dsan regolare esecuzione.docx`

**Nota**: Aprire il template Word e rimuovere manualmente eventuali residui di formattazione "();" o "dell'investimento" se presenti.

---

## 📋 SISTEMA COMPLETO - Stato Finale

### Placeholder Disponibili (tutti funzionanti):
- `{ula}` / `{numero_ula}` - Unità Lavorative Annue
- `{dimensione}` - MICRO/PICCOLA/MEDIA/GRANDE IMPRESA
- `{collegamento}` - IMPRESA SINGOLA/COLLEGATA/ASSOCIATA (da JSON visura)
- `{fatturato}` - Fatturato formattato (€)
- `{attivo_bilancio}` / `{totale_attivo}` - Totale attivo (€)
- `{tipo_servizio}` - formazione/assessment (lowercase)
- `{tipo_servizio_formattato}` - Formazione/Assessment (capitalized)
- Tutti i campi visura (denominazione, P.IVA, legale rappresentante, titolare effettivo, etc.)
- Tutti i campi bilancio (patrimonio_netto, utile_perdita, etc.)

### Documenti Generati Automaticamente:
1. **Contratto principale** (Formazione o Assessment)
2. **Allegato 09a** - DSAN Impresa
3. **Allegato 09b** - DSAN Assenza conflitto interesse
4. **DSAN Regolare Esecuzione** - con tipo servizio

### Documento da Compilare Manualmente:
- **Allegato 10a** - Comunicazione Titolarità Effettiva (template disponibile in `template/`)

---

### 🎯 Prossime Ottimizzazioni (Opzionali):

**Suggerimenti per miglioramenti futuri:**
- [ ] Aggiungere validazione lato client per i JSON importati (schema validation)
- [ ] Implementare preview del contratto generato prima del download
- [ ] Aggiungere funzionalità di "salva bozza" per contratti parzialmente compilati
- [ ] Creare dashboard per visualizzare storico contratti generati
- [ ] Implementare ricerca/filtro aziende per P.IVA o denominazione
- [ ] Aggiungere export Excel con lista aziende e contratti generati
- [ ] Implementare notifiche email al completamento generazione (opzionale)

### 📁 File Modificati in Sessione 20/10/2025:

- `/webapp/src/lib/docx.ts` - Aggiunto `tipo_servizio_formattato` + escluso Allegato 10a
- `/template/Dsan regolare esecuzione.docx` - Sostituita lista servizi con placeholder

### 📝 Note Tecniche:

**IMPORTANTE - Prima di testare:**
```bash
# Su Supabase SQL Editor, eseguire se non già fatto:
webapp/migration-add-extracted-data.sql
```

**Revisione Template DSAN:**
Aprire `template/Dsan regolare esecuzione.docx` e verificare/rimuovere eventuali residui di formattazione dopo il placeholder `{tipo_servizio_formattato}`.

---

## Setup Iniziale

La struttura base della webapp è stata completata! Ecco cosa devi fare per renderla operativa.

## 1. Inserisci i Template Reali

Nella cartella `template/` ci sono due file di esempio:
- `contratto_formazione_ESEMPIO.txt`
- `contratto_assessment_ESEMPIO.txt`

**Azione richiesta:**
1. Sostituisci questi file con i tuoi contratti reali
2. Rinomina i file togliendo `_ESEMPIO`:
   - `contratto_formazione.txt`
   - `contratto_assessment.txt`
3. Inserisci eventuali allegati aggiuntivi

I placeholder disponibili sono documentati nel README.md

## 2. Configura Supabase

**Azione richiesta:**
1. Vai su https://supabase.com e crea un account gratuito
2. Crea un nuovo progetto
3. Nella sezione "SQL Editor", esegui lo script `webapp/supabase-schema.sql`
4. Nella sezione "Storage", crea un bucket chiamato "documents" (privato)
5. Configura le policies per il bucket come descritto in `webapp/SETUP.md`
6. Annota le credenziali:
   - Project URL
   - Anon Key
   - Service Role Key

## 3. Ottieni API Key OpenAI

**Azione richiesta:**
1. Vai su https://platform.openai.com
2. Crea un account o fai login
3. Vai su "API Keys"
4. Crea una nuova API key
5. Aggiungi credito (consigliato: almeno $10 per iniziare)
6. Annota la API key (la vedrai solo una volta!)

## 4. Configura le Variabili d'Ambiente

**Azione richiesta:**
```bash
cd webapp
cp .env.example .env
```

Poi modifica il file `.env` inserendo:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-proj-...
```

## 5. Installa le Dipendenze

**Azione richiesta:**
```bash
cd webapp
npm install
```

Questo installerà tutte le dipendenze necessarie (Next.js, React, Supabase, OpenAI, ecc.)

## 6. Avvia l'Applicazione in Sviluppo

**Azione richiesta:**
```bash
npm run dev
```

Apri http://localhost:3000 nel browser

## 7. Testa il Flusso Completo

**Azione richiesta:**
1. Registra un'azienda di test
2. Carica una visura camerale (anche scansione o foto va bene)
3. Carica un bilancio aziendale
4. Attendi l'estrazione dei dati (10-30 secondi)
5. Seleziona il tipo di servizio
6. Genera il contratto
7. Scarica il documento generato

## 8. Prepara per il Deploy (Prima della Formazione)

**Opzione A - Deploy su Vercel (Consigliato):**
```bash
npm i -g vercel
cd webapp
vercel
```

Segui le istruzioni e configura le variabili d'ambiente nella dashboard.

**Opzione B - Altri provider:**
Consulta `webapp/SETUP.md` per istruzioni specifiche.

## 9. Configura il Tuo Dominio

**Azione richiesta:**
1. Nel provider di hosting scelto, aggiungi il tuo dominio personalizzato
2. Configura i record DNS come richiesto
3. Attendi la propagazione (fino a 48 ore)

## 10. Preparazione per la Formazione

**Checklist finale:**
- [ ] Template contratti caricati e testati
- [ ] Database Supabase configurato e funzionante
- [ ] API Keys configurate correttamente
- [ ] Applicazione testata localmente
- [ ] Deploy in produzione completato
- [ ] Dominio personalizzato configurato
- [ ] Test end-to-end con dati reali
- [ ] Backup del database configurato

## Troubleshooting Rapido

**Problema: npm install fallisce**
- Soluzione: Verifica di avere Node.js 18+ installato (`node --version`)

**Problema: Errore "Missing environment variables"**
- Soluzione: Verifica che il file `.env` sia nella cartella `webapp/` e sia configurato correttamente

**Problema: "Failed to upload file"**
- Soluzione: Verifica che il bucket "documents" sia stato creato in Supabase Storage

**Problema: "Failed to extract data"**
- Soluzione: Verifica che la API key OpenAI sia valida e abbia credito disponibile

**Problema: Template not found**
- Soluzione: Verifica che i file dei template siano nella cartella `template/` con i nomi corretti (senza `_ESEMPIO`)

## Supporto

Per problemi tecnici:
1. Consulta `webapp/SETUP.md` per istruzioni dettagliate
2. Controlla la console del browser per errori JavaScript
3. Controlla i log del server (terminale dove hai eseguito `npm run dev`)
4. Verifica la configurazione in Supabase Dashboard

## Costi Stimati

- **Supabase**: Gratuito (piano free fino a 500MB database + 1GB storage)
- **OpenAI API**:
  - ~$0.01-0.05 per documento analizzato
  - Per 100 aziende: ~$5-10
- **Hosting Vercel**: Gratuito per progetti personali
- **Dominio**: Varia (~$10-20/anno)

## Demo della Formazione

Durante la formazione potrai mostrare:
1. La registrazione di un'azienda in tempo reale
2. L'upload e l'analisi automatica dei documenti
3. La generazione istantanea dei contratti compilati
4. L'efficacia dell'AI nell'estrazione dati

**Suggerimento**: Prepara 2-3 aziende di esempio già registrate con documenti caricati, così puoi mostrare diverse situazioni durante la demo.

---

**Buona fortuna con la formazione! 🚀**

Se hai bisogno di assistenza, tutti i dettagli tecnici sono documentati nei file README.md e SETUP.md.
