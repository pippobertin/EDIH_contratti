/**
 * Script per caricare i template DOCX su Supabase Storage
 * Esegui: node upload-templates.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const templateFiles = [
  'Allegato_09a_DSAN_Impresa.docx',
  'Allegato_09b_DSAN_Assenza_conflitto_interesse.docx',
  'Allegato_10a_Comunicazione_titolarita_effettiva.docx',
  'DSAN_regolare_esecuzione.docx',
  'Modulistica_EDIH4Marche_Assessment.docx',
  'Modulistica_EDIH4Marche_formazione.docx',
];

async function uploadTemplates() {
  console.log('🚀 Inizio upload template su Supabase Storage...\n');

  for (const fileName of templateFiles) {
    const filePath = path.join(__dirname, 'template', fileName);
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`📤 Uploading: ${fileName}`);

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`templates/${fileName}`, fileBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: true, // Sovrascrive se esiste già
      });

    if (error) {
      console.error(`  ❌ Errore: ${error.message}`);
    } else {
      console.log(`  ✅ Caricato: ${data.path}`);
    }
  }

  console.log('\n✅ Upload completato!');
}

uploadTemplates().catch(console.error);
