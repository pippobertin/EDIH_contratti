import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs/promises';
import path from 'path';

/**
 * Compila un template DOCX con i dati forniti
 * I placeholder nel DOCX devono essere nel formato {nome_variabile}
 */
export async function fillDocxTemplate(
  templateFileName: string,
  data: Record<string, any>
): Promise<Buffer> {
  try {
    // Percorso del template
    const templatePath = path.join(
      process.cwd(),
      'template',
      templateFileName
    );

    // Leggi il template come buffer
    const content = await fs.readFile(templatePath);

    // Carica il file DOCX
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '', // Restituisce stringa vuota per valori null/undefined
    });

    // Prepara i dati per il template
    const templateData = prepareTemplateData(data);

    // Log dei dati per debugging
    console.log('Template data keys:', Object.keys(templateData));
    console.log('Template data sample:', JSON.stringify(templateData, null, 2).substring(0, 500));

    // Compila il template con i dati
    doc.render(templateData);

    // Genera il buffer del documento compilato
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return buffer;
  } catch (error: any) {
    console.error('Error filling DOCX template:', error);
    if (error.properties && error.properties.errors) {
      console.error('Template errors:', error.properties.errors);
    }
    throw new Error(`Failed to fill DOCX template: ${error.message}`);
  }
}

/**
 * Prepara i dati per il template DOCX
 * Converte i dati in un formato compatibile con i placeholder
 */
function prepareTemplateData(data: Record<string, any>): Record<string, string> {
  const templateData: Record<string, string> = {};

  // Dati azienda base
  if (data.denominazione) templateData.denominazione = data.denominazione;
  if (data.partita_iva) templateData.partita_iva = data.partita_iva;
  if (data.codice_fiscale) templateData.codice_fiscale = data.codice_fiscale;
  if (data.legale_rappresentante)
    templateData.legale_rappresentante = data.legale_rappresentante;
  if (data.titolare_effettivo)
    templateData.titolare_effettivo = data.titolare_effettivo;
  if (data.sede_legale) templateData.sede_legale = data.sede_legale;
  if (data.email) templateData.email = data.email;
  if (data.telefono) templateData.telefono = data.telefono;

  // Dati dalla visura camerale (JSON piatto da GPT-4o Vision)
  if (data.visura_data) {
    const visura = data.visura_data;

    // Dati azienda base dalla visura (se non già presenti)
    if (visura.denominazione && !templateData.denominazione)
      templateData.denominazione = visura.denominazione;
    if (visura.partita_iva && !templateData.partita_iva)
      templateData.partita_iva = visura.partita_iva;
    if (visura.codice_fiscale && !templateData.codice_fiscale)
      templateData.codice_fiscale = visura.codice_fiscale;
    if (visura.sede_legale && !templateData.sede_legale)
      templateData.sede_legale = visura.sede_legale;

    // Indirizzo azienda
    if (visura.indirizzo) templateData.indirizzo = visura.indirizzo;
    if (visura.cap) templateData.cap = visura.cap;
    if (visura.citta) templateData.citta = visura.citta;
    if (visura.provincia) templateData.provincia = visura.provincia;

    // Collegamento azienda (autonoma/collegata/associata)
    if (visura.collegamento) templateData.collegamento = visura.collegamento;

    // Legale rappresentante e titolare effettivo (nomi)
    if (visura.legale_rappresentante)
      templateData.legale_rappresentante = visura.legale_rappresentante;
    if (visura.titolare_effettivo)
      templateData.titolare_effettivo = visura.titolare_effettivo;

    // Dati personali legale rappresentante
    if (visura.lr_nato_a) templateData.lr_nato_a = visura.lr_nato_a;
    if (visura.lr_nato_prov) templateData.lr_nato_prov = visura.lr_nato_prov;
    if (visura.lr_nato_il) templateData.lr_nato_il = visura.lr_nato_il;
    if (visura.lr_residente_a) templateData.lr_residente_a = visura.lr_residente_a;
    if (visura.lr_residente_prov) templateData.lr_residente_prov = visura.lr_residente_prov;
    if (visura.lr_residente_via) templateData.lr_residente_via = visura.lr_residente_via;
    if (visura.lr_residente_cap) templateData.lr_residente_cap = visura.lr_residente_cap;
    if (visura.lr_codice_fiscale) templateData.lr_codice_fiscale = visura.lr_codice_fiscale;

    // Dati personali titolare effettivo
    if (visura.te_nato_a) templateData.te_nato_a = visura.te_nato_a;
    if (visura.te_nato_prov) templateData.te_nato_prov = visura.te_nato_prov;
    if (visura.te_nato_il) templateData.te_nato_il = visura.te_nato_il;
    if (visura.te_residente_in) templateData.te_residente_in = visura.te_residente_in;
    if (visura.te_residente_prov) templateData.te_residente_prov = visura.te_residente_prov;
    if (visura.te_residente_via) templateData.te_residente_via = visura.te_residente_via;
    if (visura.te_residente_cap) templateData.te_residente_cap = visura.te_residente_cap;
    if (visura.te_codice_fiscale) templateData.te_codice_fiscale = visura.te_codice_fiscale;

    // Altri dati azienda
    if (visura.forma_giuridica)
      templateData.forma_giuridica = visura.forma_giuridica;
    if (visura.capitale_sociale)
      templateData.capitale_sociale = visura.capitale_sociale;
    if (visura.data_costituzione)
      templateData.data_costituzione = visura.data_costituzione;
    if (visura.codice_ateco) templateData.codice_ateco = visura.codice_ateco;
    if (visura.oggetto_sociale)
      templateData.oggetto_sociale = visura.oggetto_sociale;
  }

  // Dati dal bilancio
  if (data.bilancio_data) {
    const bilancio = data.bilancio_data;
    if (bilancio.anno_riferimento)
      templateData.anno_bilancio = bilancio.anno_riferimento;
    if (bilancio.fatturato !== undefined)
      templateData.fatturato = formatCurrency(bilancio.fatturato);
    if (bilancio.utile_perdita !== undefined)
      templateData.utile_perdita = formatCurrency(bilancio.utile_perdita);
    if (bilancio.totale_attivo !== undefined)
      templateData.totale_attivo = formatCurrency(bilancio.totale_attivo);
    if (bilancio.totale_passivo !== undefined)
      templateData.totale_passivo = formatCurrency(bilancio.totale_passivo);
    if (bilancio.patrimonio_netto !== undefined)
      templateData.patrimonio_netto = formatCurrency(bilancio.patrimonio_netto);
    if (bilancio.numero_dipendenti !== undefined)
      templateData.numero_dipendenti = bilancio.numero_dipendenti.toString();

    // ULA - controlla vari possibili nomi del campo
    const ulaValue = bilancio.numero_ula || bilancio.ula || bilancio.ULA;
    if (ulaValue !== undefined && ulaValue !== null) {
      templateData.numero_ula = ulaValue.toString();
      templateData.ula = ulaValue.toString(); // Alias
    }

    if (bilancio.dimensione)
      templateData.dimensione = bilancio.dimensione;

    // Alias per facilità d'uso nei template
    if (bilancio.totale_attivo !== undefined)
      templateData.attivo_bilancio = formatCurrency(bilancio.totale_attivo);
  }

  // Dati servizio
  if (data.tipo_servizio) {
    templateData.tipo_servizio = data.tipo_servizio;
    // Versione formattata per i documenti
    templateData.tipo_servizio_formattato =
      data.tipo_servizio === 'formazione' ? 'Formazione' : 'Assessment';

    // Flag per DSAN regolare esecuzione (☑ = selezionato, ☐ = non selezionato)
    templateData.flag_assessment = data.tipo_servizio === 'assessment' ? '☑' : '☐';
    templateData.flag_formazione = data.tipo_servizio === 'formazione' ? '☑' : '☐';
  } else {
    // Default: tutti vuoti
    templateData.flag_assessment = '☐';
    templateData.flag_formazione = '☐';
  }
  if (data.data_inizio_servizio)
    templateData.data_inizio_servizio = formatDate(data.data_inizio_servizio);
  if (data.data_fine_servizio)
    templateData.data_fine_servizio = formatDate(data.data_fine_servizio);
  if (data.durata_ore) templateData.durata_ore = data.durata_ore.toString();
  if (data.modalita) templateData.modalita = data.modalita;

  // Data corrente
  templateData.data_contratto = formatDate(new Date().toISOString());

  // Aggiungi tutti gli altri campi personalizzati
  Object.keys(data).forEach((key) => {
    if (!templateData[key] && data[key] !== null && data[key] !== undefined) {
      templateData[key] = String(data[key]);
    }
  });

  return templateData;
}

/**
 * Formatta un numero come valuta EUR
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/**
 * Formatta una data in formato italiano
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Mappa dei nomi file template per tipo di servizio
 */
export const TEMPLATE_FILES = {
  formazione: 'Modulistica EDIH4Marche -  formazione.docx',
  assessment: 'Modulistica EDIH4Marche - Servizio Assessment.docx',
  allegati: {
    dsan_impresa: 'Allegato n. 09a_DSAN Impresa.docx',
    dsan_conflitto_interesse:
      'Allegato n. 09b_DSAN Assenza di conflitto interesse_Titolare effettivo.docx',
    titolarita_effettiva: 'Allegato n. 10a_Comunicazione dei dati sulla Titolarità effettiva.docx',
    dsan_regolare_esecuzione: 'Dsan regolare esecuzione.docx',
  },
};

/**
 * Genera tutti i documenti per un contratto (contratto principale + allegati)
 */
export async function generateContractDocuments(
  tipoContratto: 'formazione' | 'assessment',
  data: Record<string, any>
): Promise<{
  contratto: Buffer;
  allegati: { nome: string; buffer: Buffer }[];
}> {
  // Genera il contratto principale
  const templateFile = TEMPLATE_FILES[tipoContratto];
  const contratto = await fillDocxTemplate(templateFile, data);

  // Genera gli allegati
  const allegati: { nome: string; buffer: Buffer }[] = [];

  console.log('🔍 INIZIO GENERAZIONE ALLEGATI - Totale:', Object.keys(TEMPLATE_FILES.allegati).length);
  console.log('  Allegati da generare:', Object.keys(TEMPLATE_FILES.allegati));
  console.log('  Data disponibili - te_codice_fiscale:', data.visura_data?.te_codice_fiscale || data.te_codice_fiscale || 'MANCANTE');

  for (const [key, fileName] of Object.entries(TEMPLATE_FILES.allegati)) {
    console.log(`\n📄 Processando allegato: ${key} (${fileName})`);

    try {
      // Allegato 10a: genera solo se ci sono dati titolare effettivo
      if (key === 'titolarita_effettiva') {
        console.log('🔍 DEBUG Allegato 10a - Controllo dati:');
        console.log('  data.visura_data:', data.visura_data ? 'presente' : 'assente');
        console.log('  data.visura_data?.te_codice_fiscale:', data.visura_data?.te_codice_fiscale);
        console.log('  data.te_codice_fiscale:', data.te_codice_fiscale);
        console.log('  data.titolare_effettivo:', data.titolare_effettivo);

        // Controlla se il titolare effettivo ha dati (CF è campo obbligatorio)
        const hasTitolareEffettivo =
          data.visura_data?.te_codice_fiscale ||
          data.te_codice_fiscale;

        console.log('  hasTitolareEffettivo:', hasTitolareEffettivo);

        if (!hasTitolareEffettivo) {
          console.log('⚠️ Allegato 10a saltato: dati titolare effettivo mancanti (compilazione manuale richiesta)');
          continue; // Salta questo allegato
        }
        console.log('✅ Allegato 10a: dati titolare effettivo presenti, genera documento');
      }

      console.log(`  Chiamando fillDocxTemplate per ${fileName}...`);
      const allegatoBuffer = await fillDocxTemplate(fileName, data);
      console.log(`  ✓ fillDocxTemplate completato, buffer size: ${allegatoBuffer.length} bytes`);

      allegati.push({
        nome: fileName.replace('.docx', ''),
        buffer: allegatoBuffer,
      });
      console.log(`  ✓ Allegato aggiunto all'array (totale allegati: ${allegati.length})`);
    } catch (error) {
      console.error(`❌ ERRORE generando allegato ${fileName}:`, error);
      if (error instanceof Error) {
        console.error(`   Messaggio: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
      }
      // Continua con gli altri allegati anche se uno fallisce
    }
  }

  console.log(`\n✅ GENERAZIONE ALLEGATI COMPLETATA`);
  console.log(`   Totale allegati generati: ${allegati.length}`);
  console.log(`   Nomi allegati:`, allegati.map(a => a.nome));

  return { contratto, allegati };
}
