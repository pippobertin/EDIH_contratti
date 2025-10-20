import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper per estrarre dati strutturati da documenti usando GPT-4o
export async function extractDataFromDocument(
  documentText: string,
  documentType: 'visura' | 'bilancio'
): Promise<any> {
  const systemPrompts = {
    visura: `Analizza questa visura camerale italiana e estrai TUTTI i dati in formato JSON PIATTO (non nidificato).

Estrai i seguenti campi (usa null se un campo non è presente):

DATI AZIENDA:
- denominazione (ragione sociale)
- partita_iva
- codice_fiscale
- sede_legale (indirizzo completo)
- indirizzo (solo via e numero civico, es: "Via Roma 15")
- cap (codice postale, es: "00100")
- citta (città, es: "Milano")
- provincia (sigla provincia, es: "MI")
- forma_giuridica (es: "S.R.L.", "S.P.A.")
- capitale_sociale (importo in euro)
- data_costituzione (formato GG/MM/AAAA)
- codice_ateco
- oggetto_sociale

LEGALE RAPPRESENTANTE:
- legale_rappresentante (nome e cognome completo)
- lr_nato_a (comune di nascita)
- lr_nato_prov (sigla provincia di nascita, es: "MI")
- lr_nato_il (data nascita GG/MM/AAAA)
- lr_residente_a (città di residenza)
- lr_residente_prov (sigla provincia residenza)
- lr_residente_via (indirizzo residenza, es: "Via Verdi 10")
- lr_residente_cap (CAP residenza)
- lr_codice_fiscale (codice fiscale)

TITOLARE EFFETTIVO (se presente e diverso dal legale rappresentante):
- titolare_effettivo (nome e cognome completo)
- te_nato_a (comune di nascita)
- te_nato_prov (sigla provincia di nascita)
- te_nato_il (data nascita GG/MM/AAAA)
- te_residente_in (città di residenza)
- te_residente_prov (sigla provincia residenza)
- te_residente_via (indirizzo residenza)
- te_residente_cap (CAP residenza)
- te_codice_fiscale (codice fiscale)

IMPORTANTE:
- Restituisci un oggetto JSON PIATTO con tutti i campi al primo livello
- NON creare sotto-oggetti o strutture nidificate
- Usa null per i campi mancanti
- Separa indirizzo, cap, città e provincia dalla sede_legale
- Le date DEVONO essere in formato GG/MM/AAAA

Rispondi SOLO con l'oggetto JSON, senza testo aggiuntivo.`,
    bilancio: `Analizza questo bilancio aziendale italiano e estrai i dati economici in formato JSON PIATTO.

Estrai i seguenti campi (usa null se non presente):
- anno_riferimento (anno del bilancio, es: 2023)
- fatturato (numero in euro, senza separatori)
- utile_perdita (numero in euro, positivo per utile, negativo per perdita)
- totale_attivo (numero in euro)
- totale_passivo (numero in euro)
- patrimonio_netto (numero in euro)
- numero_dipendenti (numero intero)

IMPORTANTE:
- Restituisci un oggetto JSON PIATTO con tutti i campi al primo livello
- I valori numerici DEVONO essere numeri puri senza € o separatori
- Converti migliaia/milioni nel valore numerico completo (es: "1.5M" → 1500000)
- Usa null per campi mancanti

Rispondi SOLO con l'oggetto JSON, senza testo aggiuntivo.`,
  };

  try {
    console.log(`Extracting data from ${documentType} using GPT-4o (text: ${documentText.length} chars)...`);

    // Usa GPT-4o per analizzare il testo estratto dal PDF
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompts[documentType] },
        { role: 'user', content: documentText },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    });

    const extractedData = response.choices[0].message.content;
    const parsedData = extractedData ? JSON.parse(extractedData) : {};
    console.log('Extraction successful, data keys:', Object.keys(parsedData));
    return parsedData;
  } catch (error) {
    console.error('Error extracting data:', error);
    throw error;
  }
}

// Helper per compilare documenti usando i template
export async function fillDocumentTemplate(
  templateContent: string,
  data: any,
  documentType: string
): Promise<string> {
  const systemPrompt = `Sei un assistente esperto nella compilazione di documenti amministrativi.
Ricevi un template di documento e i dati da inserire.
Compila il template sostituendo i placeholder con i dati forniti.
Mantieni la formattazione e la struttura del documento originale.
Rispondi SOLO con il documento compilato, senza testo aggiuntivo.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Template del documento (${documentType}):\n\n${templateContent}\n\nDati da inserire:\n${JSON.stringify(data, null, 2)}`,
        },
      ],
      temperature: 0.1,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error filling document:', error);
    throw error;
  }
}
