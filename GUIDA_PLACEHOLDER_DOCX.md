# Guida ai Placeholder nei Template DOCX

Questa guida spiega come inserire i placeholder nei tuoi template DOCX per la compilazione automatica.

## Come Funziona

Il sistema utilizza **docxtemplater** per sostituire automaticamente i placeholder nei file DOCX con i dati reali delle aziende.

## Formato dei Placeholder

I placeholder devono essere scritti nel formato: **{nome_variabile}**

**Esempi:**
- `{denominazione}` → Verrà sostituito con "Acme S.r.l."
- `{partita_iva}` → Verrà sostituito con "IT12345678901"
- `{legale_rappresentante}` → Verrà sostituito con "Mario Rossi"

## Come Inserire i Placeholder nei DOCX

### Metodo 1: Direttamente in Word

1. Apri il file DOCX con Microsoft Word
2. Posiziona il cursore dove vuoi inserire il dato
3. Digita il placeholder con le parentesi graffe: `{nome_variabile}`
4. Salva il file

**Importante:** Assicurati che le parentesi graffe `{}` siano dello stesso formato. Non copiare da fonti esterne che potrebbero usare caratteri speciali.

### Metodo 2: Trova e Sostituisci

1. Apri il DOCX con Word
2. Usa "Trova e Sostituisci" (Ctrl+H / Cmd+H)
3. Sostituisci il testo fisso con il placeholder
   - Esempio: Trova "NOME AZIENDA" → Sostituisci con "{denominazione}"

## Placeholder Disponibili

### Dati Azienda Base

| Placeholder | Descrizione | Esempio Output |
|-------------|-------------|----------------|
| `{denominazione}` | Ragione sociale | Acme S.r.l. |
| `{partita_iva}` | Partita IVA | IT12345678901 |
| `{codice_fiscale}` | Codice fiscale | 12345678901 |
| `{legale_rappresentante}` | Nome del legale rappresentante | Mario Rossi |
| `{titolare_effettivo}` | Nome del titolare effettivo | Giovanni Bianchi |
| `{sede_legale}` | Indirizzo sede legale | Via Roma 1, Milano, 20100 |
| `{email}` | Email aziendale | info@acme.it |
| `{telefono}` | Numero di telefono | +39 02 1234567 |

### Dati dalla Visura Camerale

| Placeholder | Descrizione | Esempio Output |
|-------------|-------------|----------------|
| `{indirizzo}` | Via e numero civico | Via Roma 15 |
| `{cap}` | Codice di Avviamento Postale | 20100 |
| `{citta}` | Città | Milano |
| `{provincia}` | Sigla provincia | MI |
| `{forma_giuridica}` | Forma giuridica | Società a Responsabilità Limitata |
| `{capitale_sociale}` | Capitale sociale | EUR 10.000,00 |
| `{data_costituzione}` | Data costituzione | 01/01/2020 |
| `{codice_ateco}` | Codice ATECO | 62.01.00 |
| `{oggetto_sociale}` | Oggetto sociale | Sviluppo software |

### Dati Personali Legale Rappresentante (dalla Visura)

| Placeholder | Descrizione | Esempio Output |
|-------------|-------------|----------------|
| `{lr_nato_a}` | Comune di nascita | Roma |
| `{lr_nato_prov}` | Provincia di nascita | RM |
| `{lr_nato_il}` | Data di nascita | 15/03/1980 |
| `{lr_residente_a}` | Città di residenza | Milano |
| `{lr_residente_prov}` | Provincia di residenza | MI |
| `{lr_residente_via}` | Via e numero residenza | Via Verdi 10 |
| `{lr_residente_cap}` | CAP residenza | 20100 |
| `{lr_codice_fiscale}` | Codice fiscale LR | RSSMRA80C15H501X |

### Dati Personali Titolare Effettivo (dalla Visura)

| Placeholder | Descrizione | Esempio Output |
|-------------|-------------|----------------|
| `{te_nato_a}` | Comune di nascita | Firenze |
| `{te_nato_il}` | Data di nascita | 20/06/1975 |
| `{te_residente_in}` | Città di residenza | Torino |
| `{te_residente_via}` | Via e numero residenza | Via Garibaldi 5 |
| `{te_codice_fiscale}` | Codice fiscale TE | BNCLRA75H20D612S |

### Dati dal Bilancio

| Placeholder | Descrizione | Esempio Output |
|-------------|-------------|----------------|
| `{anno_bilancio}` | Anno di riferimento | 2023 |
| `{fatturato}` | Fatturato annuale | EUR 500.000,00 |
| `{utile_perdita}` | Utile o perdita | EUR 50.000,00 |
| `{totale_attivo}` | Totale attivo | EUR 250.000,00 |
| `{totale_passivo}` | Totale passivo | EUR 100.000,00 |
| `{patrimonio_netto}` | Patrimonio netto | EUR 150.000,00 |
| `{numero_dipendenti}` | Numero dipendenti | 5 |

### Dati del Servizio

| Placeholder | Descrizione | Esempio Output |
|-------------|-------------|----------------|
| `{tipo_servizio}` | Tipo di servizio | formazione |
| `{data_inizio_servizio}` | Data inizio | 01/03/2024 |
| `{data_fine_servizio}` | Data fine | 30/06/2024 |
| `{durata_ore}` | Durata in ore | 20 |
| `{modalita}` | Modalità erogazione | Online / In presenza |

### Dati Automatici

| Placeholder | Descrizione | Esempio Output |
|-------------|-------------|----------------|
| `{data_contratto}` | Data odierna | 18/10/2024 |

## Formattazione

### Valute
I valori numerici delle valute vengono formattati automaticamente:
- Input: 50000
- Output: EUR 50.000,00

### Date
Le date vengono formattate automaticamente in formato italiano:
- Input: "2024-03-15"
- Output: 15/03/2024

## Esempi Pratici

### Esempio 1: Intestazione Contratto

```
CONTRATTO DI FORMAZIONE

Tra {denominazione}, con sede in {sede_legale},
P.IVA {partita_iva}, C.F. {codice_fiscale},
rappresentata dal Legale Rappresentante {legale_rappresentante}

(di seguito "Cliente")

E

EDIH - European Digital Innovation Hub
...
```

### Esempio 1bis: Intestazione con Indirizzo Dettagliato

```
CONTRATTO DI FORMAZIONE

Tra {denominazione}
Indirizzo: {indirizzo}
CAP: {cap}
Città: {citta}
Provincia: {provincia}
P.IVA {partita_iva}, C.F. {codice_fiscale}
rappresentata dal Legale Rappresentante {legale_rappresentante}

(di seguito "Cliente")
```

### Esempio 2: Clausola con Dati Finanziari

```
L'azienda Cliente, come risultante dall'ultimo bilancio approvato
(anno {anno_bilancio}), presenta le seguenti caratteristiche:

- Fatturato: {fatturato}
- Numero dipendenti: {numero_dipendenti}
- Forma giuridica: {forma_giuridica}
- Codice ATECO: {codice_ateco}
```

### Esempio 3: Tabella Dati

| Campo | Valore |
|-------|--------|
| Denominazione | {denominazione} |
| Partita IVA | {partita_iva} |
| Legale Rappresentante | {legale_rappresentante} |
| Sede Legale | {sede_legale} |

### Esempio 4: DSAN / Allegati con Dati Legale Rappresentante

```
Il/La sottoscritto/a {legale_rappresentante}
nato/a {lr_nato_a} Prov. {lr_nato_prov} il {lr_nato_il}
e residente a {lr_residente_a} Prov. {lr_residente_prov}
in Via {lr_residente_via} CAP {lr_residente_cap}
CF {lr_codice_fiscale}

in qualità di LEGALE RAPPRESENTANTE dell'impresa/PA
{denominazione}
```

**Risultato compilato:**
```
Il/La sottoscritto/a Mario Rossi
nato/a Roma Prov. RM il 15/03/1980
e residente a Milano Prov. MI
in Via Verdi 10 CAP 20100
CF RSSMRA80C15H501X

in qualità di LEGALE RAPPRESENTANTE dell'impresa/PA
Acme S.r.l.
```

### Esempio 5: DSAN / Allegati con Dati Titolare Effettivo

```
Io sottoscritto/a {titolare_effettivo}
nato/a a {te_nato_a} il {te_nato_il}
residente in {te_residente_in}
via {te_residente_via}
CF {te_codice_fiscale}
```

**Risultato compilato:**
```
Io sottoscritto/a Giovanni Bianchi
nato/a a Firenze il 20/06/1975
residente in Torino
via Via Garibaldi 5
CF BNCLRA75H20D612S
```

## Cosa Succede se un Dato Non è Disponibile?

Se un dato non è disponibile, il placeholder viene sostituito con una **stringa vuota**.

Esempio:
- Se l'email non è stata inserita, `{email}` diventerà ""
- Se il bilancio non è stato caricato, `{fatturato}` diventerà ""

## Best Practices

### ✅ DA FARE

1. **Usare sempre le parentesi graffe**: `{denominazione}` ✓
2. **Usare nomi in minuscolo con underscore**: `{legale_rappresentante}` ✓
3. **Testare il template** prima di usarlo in produzione
4. **Mantenere la formattazione Word**: grassetto, corsivo, colori funzionano normalmente
5. **Usare tabelle Word**: i placeholder funzionano anche nelle tabelle

### ❌ DA EVITARE

1. **NON usare spazi**: `{ denominazione }` ✗
2. **NON usare parentesi diverse**: `[denominazione]` o `{{denominazione}}` ✗
3. **NON usare caratteri speciali nei nomi**: `{denominazione!}` ✗
4. **NON dividere il placeholder su più righe**
5. **NON usare formattazione diversa** all'interno del placeholder (es: {deno**minazione**})

## Testare i Template

Per verificare che i placeholder siano corretti:

1. Apri il DOCX con Word
2. Usa "Trova" (Ctrl+F) e cerca `{`
3. Verifica che ogni `{` abbia una `}` corrispondente
4. Controlla che i nomi corrispondano a quelli della tabella sopra

## Placeholder Personalizzati

Se hai bisogno di placeholder non presenti in questa lista, contatta lo sviluppatore per aggiungerli.

## Supporto Avanzato

### Loop (Ripetizioni)

Docxtemplater supporta i loop per ripetere sezioni:

```
{#dipendenti}
- {nome}: {ruolo}
{/dipendenti}
```

Questa funzionalità è disponibile ma richiede configurazione personalizzata.

### Condizioni

È possibile usare condizioni:

```
{#utile_perdita > 0}
L'azienda è in utile
{/}
{#utile_perdita <= 0}
L'azienda è in perdita
{/}
```

Anche questa funzionalità richiede configurazione aggiuntiva.

## Risoluzione Problemi

### Problema: Il placeholder non viene sostituito

**Possibili cause:**
1. Nome placeholder errato → Verifica la tabella sopra
2. Parentesi graffe non corrette → Usa `{` e `}` standard
3. Formattazione Word interrompe il placeholder → Ridigita il placeholder

**Soluzione:** Cancella e ridigita il placeholder manualmente in Word

### Problema: Il file DOCX non si apre dopo la compilazione

**Possibili cause:**
1. Template DOCX corrotto
2. Placeholder malformato che causa errore di parsing

**Soluzione:** Controlla i log del server per identificare l'errore specifico

---

**Ultima modifica:** 18/10/2024
**Versione sistema:** 1.0
