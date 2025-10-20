import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractDataFromDocument } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { document_id } = await request.json();

    if (!document_id) {
      return NextResponse.json(
        { error: 'Missing document_id' },
        { status: 400 }
      );
    }

    // Ottieni il documento dal database
    const { data: document, error: docError } = await supabaseAdmin
      .from('edih_documents')
      .select('*')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Scarica il file da Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(document.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      );
    }

    // Estrai il testo dal PDF usando l'estrazione base
    // GPT-4o ha un context window molto grande (128k tokens) quindi può gestire testi lunghi
    const textContent = await fileData.text();
    console.log(`Extracted text: ${textContent.length} characters from ${document.tipo_documento}`);

    // Usa OpenAI GPT-4o per estrarre i dati dal testo
    const extractedData = await extractDataFromDocument(
      textContent,
      document.tipo_documento
    );

    // Aggiorna il documento con i dati estratti
    const { data: updatedDoc, error: updateError } = await supabaseAdmin
      .from('edih_documents')
      .update({ estratto_dati: extractedData })
      .eq('id', document_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Data extracted successfully',
      data: extractedData,
      document: updatedDoc,
    });
  } catch (error: any) {
    console.error('Error extracting data:', error);
    return NextResponse.json(
      { error: 'Failed to extract data: ' + error.message },
      { status: 500 }
    );
  }
}
