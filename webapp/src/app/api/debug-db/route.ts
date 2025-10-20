import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('\n=== CHECKING DATABASE ===\n');

    // Get all documents for the company
    const { data: documents, error } = await supabaseAdmin
      .from('edih_documents')
      .select('*')
      .eq('company_id', '0a295706-b966-4e54-ae68-a65fbf1dff2d')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Found ${documents?.length || 0} documents:\n`);

    const results: any[] = [];

    documents?.forEach((doc, index) => {
      const result = {
        index: index + 1,
        id: doc.id,
        type: doc.tipo_documento,
        file_name: doc.file_name,
        created_at: doc.created_at,
        has_estratto_dati: !!doc.estratto_dati,
        estratto_dati_keys: doc.estratto_dati ? Object.keys(doc.estratto_dati) : [],
        estratto_dati_sample: doc.estratto_dati
          ? JSON.stringify(doc.estratto_dati).substring(0, 500)
          : null,
      };

      console.log(`\n--- Document ${index + 1} ---`);
      console.log(`ID: ${doc.id}`);
      console.log(`Type: ${doc.tipo_documento}`);
      console.log(`File: ${doc.file_name}`);
      console.log(`Created: ${doc.created_at}`);
      console.log(`Has estratto_dati: ${doc.estratto_dati ? 'YES' : 'NO'}`);

      if (doc.estratto_dati) {
        console.log(
          `Estratto_dati keys: ${Object.keys(doc.estratto_dati).join(', ')}`
        );
        console.log(
          `Estratto_dati sample:`,
          JSON.stringify(doc.estratto_dati).substring(0, 300) + '...'
        );
      } else {
        console.log(
          '⚠️  ESTRATTO_DATI IS NULL - This document failed extraction!'
        );
      }

      results.push(result);
    });

    console.log('\n=========================\n');

    return NextResponse.json({
      total_documents: documents?.length || 0,
      documents: results,
    });
  } catch (error: any) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { error: 'Failed to check database: ' + error.message },
      { status: 500 }
    );
  }
}
