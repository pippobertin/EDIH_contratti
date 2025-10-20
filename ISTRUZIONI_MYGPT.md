# Istruzioni: Nuovo Flusso con MyGPT

## ⚡ Cambiamenti Implementati

Invece di caricare PDF e aspettare l'estrazione, ora puoi:
1. **Usare un MyGPT** per estrarre i dati da visura e bilancio
2. **Incollare il JSON** nel form di registrazione
3. **Generare automaticamente** il contratto compilato

## 📋 Step 1: Configura il MyGPT

### 1.1 Crea il MyGPT
1. Vai su https://chat.openai.com
2. Click su "Explore GPTs" → "Create a GPT"
3. Nome: **EDIH - Estrattore Dati Modulistica**

### 1.2 Incolla le Istruzioni
Copia e incolla tutto il testo dal file che ti invio separatamente (il system prompt che ti ho preparato nella chat precedente).

### 1.3 Conversation Starters (opzionali)
- "Carica una visura camerale per estrarre i dati"
- "Carica un bilancio aziendale per estrarre i dati"
- "Aiutami a compilare la modulistica EDIH"

### 1.4 Salva il MyGPT
- Visibility: "Only me" (per ora)
- Click "Create"

## 🗄️ Step 2: Esegui la Migrazione Database

**IMPORTANTE**: Prima di testare, devi aggiornare lo schema del database!

1. Vai su https://supabase.com
2. Apri il tuo progetto
3. Vai su "SQL Editor"
4. Crea una nuova query
5. Copia e incolla il contenuto del file `migration-add-extracted-data.sql`
6. Click "Run" per eseguire la migrazione

Questo aggiunge 3 nuovi campi alla tabella `edih_companies`:
- `visura_data` (JSONB) - Dati estratti dalla visura
- `bilancio_data` (JSONB) - Dati estratti dal bilancio
- `tipo_servizio` (TEXT) - Formazione o Assessment

## 🧪 Step 3: Testa il Nuovo Flusso

### 3.1 Prepara i Dati con MyGPT

1. Apri il tuo MyGPT appena creato
2. Carica una **visura camerale** (PDF, immagine, screenshot)
3. Il MyGPT ti restituirà un JSON simile a questo:

```json
{
  "tipo_documento": "visura",
  "denominazione": "BLM Project Srl",
  "partita_iva": "IT02652950425",
  "codice_fiscale": "02652950425",
  "legale_rappresentante": "Chiara Canzi",
  "lr_nato_a": "Pesaro",
  "lr_nato_prov": "PU",
  "lr_nato_il": "15/03/1985",
  "lr_residente_a": "Pesaro",
  "lr_residente_prov": "PU",
  "lr_residente_via": "Via Roma 123",
  "lr_residente_cap": "61121",
  "lr_codice_fiscale": "CNZCHR85C55G479X",
  "titolare_effettivo": "Chiara Canzi",
  ...
}
```

4. **Copia l'intero JSON** (Ctrl+A, Ctrl+C)

5. (Opzionale) Carica anche un **bilancio aziendale** e copia il JSON:

```json
{
  "tipo_documento": "bilancio",
  "anno_riferimento": "2023",
  "fatturato": 250000,
  "utile_perdita": 15000,
  "totale_attivo": 180000,
  "patrimonio_netto": 50000,
  "numero_dipendenti": 5
}
```

### 3.2 Registra l'Azienda con i Dati

1. Apri l'app: http://localhost:3000/register
2. Nella sezione blu **"Importa Dati dal MyGPT"**:
   - Incolla il JSON della visura
   - Click "Importa Dati"
   - Vedrai ✅ "Dati importati con successo"
   - I campi sotto si compileranno automaticamente
3. Ripeti per il bilancio (incolla e importa di nuovo)
4. Seleziona il **Tipo di Servizio** (Formazione o Assessment)
5. Aggiungi email e telefono se vuoi
6. Click **"Registra Azienda e Genera Contratto"**

### 3.3 Cosa Succede

L'app farà automaticamente:
1. ✅ Salva l'azienda nel database con i dati estratti
2. ✅ Genera il contratto DOCX compilato con tutti i placeholder
3. ✅ Genera tutti gli allegati
4. ✅ Ti reindirizza alla dashboard con il contratto pronto per il download

**Tutto in 2-3 secondi!** 🚀

## 🎯 Step 4: Verifica il Risultato

Nella dashboard dovresti vedere:
- ✅ Dati azienda compilati
- ✅ Contratto generato e scaricabile
- ✅ Allegati generati e scaricabili

## 🔍 Debug

Se qualcosa non funziona, controlla:

1. **Log del server** (terminale dove hai fatto `npm run dev`):
   ```
   Creating company with data: { denominazione: 'XXX', has_visura: true, has_bilancio: true }
   Company created successfully: abc-123-...
   Generating contract automatically...
   Company visura_data (from MyGPT): HAS DATA
   Final contract data has visura_data? true
   ```

2. **Console del browser** (F12):
   - Cerca errori rossi
   - Controlla i log delle chiamate API

3. **Database** (Supabase):
   - Vai su "Table Editor" → `edih_companies`
   - Verifica che l'azienda abbia:
     - `visura_data` popolato (clic sulla cella per vedere il JSON)
     - `bilancio_data` popolato
     - `tipo_servizio` = "formazione" o "assessment"

## 📝 Formato JSON del MyGPT

Il MyGPT è configurato per restituire:

### Per Visura (tipo_documento: "visura"):
- Dati azienda base (denominazione, P.IVA, CF, sede legale, forma giuridica, etc.)
- Dati indirizzo (indirizzo, cap, città, provincia)
- Dati legale rappresentante (lr_nato_a, lr_nato_il, lr_residente_a, lr_codice_fiscale, etc.)
- Dati titolare effettivo (te_nato_a, te_residente_in, te_codice_fiscale, etc.)

### Per Bilancio (tipo_documento: "bilancio"):
- anno_riferimento
- fatturato
- utile_perdita
- totale_attivo
- patrimonio_netto
- numero_dipendenti

## ⚡ Vantaggi del Nuovo Flusso

### Prima (vecchio metodo):
1. Registra azienda (solo dati base)
2. Upload visura PDF
3. Aspetta estrazione (10-30 sec)
4. Upload bilancio PDF
5. Aspetta estrazione (10-30 sec)
6. Clicca "Genera Contratto"
7. Aspetta generazione (5-10 sec)
8. **Totale: ~60-90 secondi + 6 click**

### Ora (nuovo metodo):
1. Carica visura + bilancio nel MyGPT (in parallelo)
2. Copia JSON (2 volte)
3. Incolla nel form + Importa (2 volte)
4. Seleziona servizio
5. Click "Registra Azienda"
6. **Totale: ~10-15 secondi + 3 click**

**6x più veloce!** 🚀

## 🎓 Preparazione per la Formazione

Durante la demo potrai mostrare:

1. **L'intelligenza del MyGPT**:
   - Carica una visura davanti al pubblico
   - Mostra come identifica correttamente tutti i campi
   - Spiega che funziona anche con scansioni di bassa qualità

2. **La semplicità del flusso**:
   - Copia-incolla del JSON
   - Compilazione automatica
   - Generazione istantanea del contratto

3. **La precisione dei contratti**:
   - Scarica il contratto generato
   - Apri in Word
   - Mostra che tutti i placeholder sono compilati correttamente

## 🛠️ Troubleshooting Comune

### Errore: "Errore nel parsing del JSON"
- **Causa**: JSON non valido o mancante
- **Soluzione**: Assicurati di copiare TUTTO il JSON dal MyGPT, dalle parentesi graffe iniziali a quelle finali

### I dati non si importano
- **Causa**: Manca il campo `tipo_documento`
- **Soluzione**: Verifica che il JSON abbia `"tipo_documento": "visura"` o `"tipo_documento": "bilancio"`

### Contratto vuoto o con placeholder
- **Causa**: La migrazione database non è stata eseguita
- **Soluzione**: Esegui `migration-add-extracted-data.sql` su Supabase

### Errore 500 durante la registrazione
- **Causa**: Database non ha i nuovi campi
- **Soluzione**: Controlla i log del server e verifica la migrazione

## 📞 Supporto

In caso di problemi:
1. Controlla i log del server
2. Controlla la console del browser
3. Verifica che la migrazione sia stata eseguita
4. Verifica che il JSON sia nel formato corretto

---

**Buon lavoro! 🚀**
