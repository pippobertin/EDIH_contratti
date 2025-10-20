// Quick script to check database contents
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/.env` });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  console.log('\n=== CHECKING DATABASE ===\n');

  // Get all documents
  const { data: documents, error } = await supabase
    .from('edih_documents')
    .select('*')
    .eq('company_id', '0a295706-b966-4e54-ae68-a65fbf1dff2d')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return;
  }

  console.log(`Found ${documents?.length || 0} documents:\n`);

  documents?.forEach((doc, index) => {
    console.log(`\n--- Document ${index + 1} ---`);
    console.log(`ID: ${doc.id}`);
    console.log(`Type: ${doc.tipo_documento}`);
    console.log(`File: ${doc.file_name}`);
    console.log(`Created: ${doc.created_at}`);
    console.log(`Has estratto_dati: ${doc.estratto_dati ? 'YES' : 'NO'}`);

    if (doc.estratto_dati) {
      console.log(`Estratto_dati keys: ${Object.keys(doc.estratto_dati).join(', ')}`);
      console.log(`Estratto_dati sample:`, JSON.stringify(doc.estratto_dati).substring(0, 200) + '...');
    } else {
      console.log('⚠️  ESTRATTO_DATI IS NULL - This document failed extraction!');
    }
  });

  console.log('\n=========================\n');
}

checkDatabase().catch(console.error);
