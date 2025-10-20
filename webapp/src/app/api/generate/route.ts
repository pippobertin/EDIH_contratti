import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateContractDocuments } from '@/lib/docx';
import { ContractData, TipoContratto } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, tipo_contratto } = body as {
      company_id: string;
      tipo_contratto: TipoContratto;
    };

    if (!company_id || !tipo_contratto) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ottieni i dati dell'azienda
    const { data: company, error: companyError } = await supabaseAdmin
      .from('edih_companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Ottieni i documenti (visura e bilancio)
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('edih_documents')
      .select('*')
      .eq('company_id', company_id);

    if (docsError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    const visuraDoc = documents?.find((d) => d.tipo_documento === 'visura');
    const bilancioDoc = documents?.find((d) => d.tipo_documento === 'bilancio');

    // Log per debugging
    console.log('Documents found:', documents?.length);
    console.log('Visura doc:', visuraDoc ? 'FOUND' : 'NOT FOUND');
    console.log('Bilancio doc:', bilancioDoc ? 'FOUND' : 'NOT FOUND');
    console.log('Company visura_data (from MyGPT):', company.visura_data ? 'HAS DATA' : 'NO DATA');
    console.log('Company bilancio_data (from MyGPT):', company.bilancio_data ? 'HAS DATA' : 'NO DATA');
    console.log('Visura estratto_dati (from upload):', visuraDoc?.estratto_dati ? 'HAS DATA' : 'NO DATA');
    console.log('Bilancio estratto_dati (from upload):', bilancioDoc?.estratto_dati ? 'HAS DATA' : 'NO DATA');

    // Prepara i dati per la compilazione
    // Priorità: dati dal MyGPT (salvati in company) > dati da documenti caricati
    const contractData: ContractData = {
      ...company,
      visura_data: company.visura_data || visuraDoc?.estratto_dati,
      bilancio_data: company.bilancio_data || bilancioDoc?.estratto_dati,
      tipo_servizio: company.tipo_servizio || tipo_contratto,
    };

    console.log('Final contract data has visura_data?', !!contractData.visura_data);
    console.log('Final contract data has bilancio_data?', !!contractData.bilancio_data);
    console.log('Tipo servizio:', contractData.tipo_servizio);

    // Genera il contratto DOCX e gli allegati
    console.log('Generating contract documents...');
    const { contratto, allegati } = await generateContractDocuments(
      tipo_contratto,
      contractData
    );

    // Upload del contratto principale su Supabase Storage
    const contractFileName = `${company_id}/contratto_${tipo_contratto}_${Date.now()}.docx`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(contractFileName, contratto, {
        contentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload contract' },
        { status: 500 }
      );
    }

    // Crea URL firmato (valido per 1 anno)
    const { data: contractUrlData, error: urlError } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(contractFileName, 31536000); // 1 anno in secondi

    if (urlError) {
      console.error('URL generation error:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    // Upload degli allegati
    const allegatiUrls: { nome: string; url: string }[] = [];
    console.log(`\n📤 INIZIO UPLOAD ALLEGATI - Totale da uploadare: ${allegati.length}`);
    for (const allegato of allegati) {
      console.log(`\n📄 Uploading allegato: ${allegato.nome}`);
      // Sanitizza il nome del file: sostituisci spazi con underscore e rimuovi caratteri speciali
      const sanitizedName = allegato.nome
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
        .replace(/\s+/g, '_'); // Replace spaces with underscores
      const allegatoFileName = `${company_id}/allegati/${sanitizedName}_${Date.now()}.docx`;
      console.log(`  Path sanitizzato: ${allegatoFileName}`);
      console.log(`  Size: ${allegato.buffer.length} bytes`);

      const { error: allegatoUploadError } = await supabaseAdmin.storage
        .from('documents')
        .upload(allegatoFileName, allegato.buffer, {
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          upsert: false,
        });

      if (allegatoUploadError) {
        console.error(`  ❌ Upload error per ${allegato.nome}:`, allegatoUploadError);
        continue;
      }

      console.log(`  ✓ Upload completato`);

      const { data: allegatoUrlData, error: urlError } = await supabaseAdmin.storage
        .from('documents')
        .createSignedUrl(allegatoFileName, 31536000); // 1 anno

      if (urlError) {
        console.error(`  ❌ URL generation error per ${allegato.nome}:`, urlError);
        continue;
      }

      if (allegatoUrlData) {
        console.log(`  ✓ URL generato`);
        allegatiUrls.push({
          nome: allegato.nome,
          url: allegatoUrlData.signedUrl,
        });
      } else {
        console.error(`  ❌ allegatoUrlData è null per ${allegato.nome}`);
      }
    }

    console.log(`\n✅ UPLOAD ALLEGATI COMPLETATO`);
    console.log(`   Allegati uploadati: ${allegatiUrls.length}/${allegati.length}`);
    console.log(`   Nomi uploadati:`, allegatiUrls.map(a => a.nome));

    // Salva il contratto nel database
    const { data: contract, error: contractError } = await supabaseAdmin
      .from('edih_contracts')
      .insert({
        company_id: company_id,
        tipo_contratto: tipo_contratto,
        dati_compilati: {
          ...contractData,
          allegati: allegatiUrls,
        },
        documento_generato: contractUrlData.signedUrl,
      })
      .select()
      .single();

    if (contractError) {
      console.error('Contract save error:', contractError);
      return NextResponse.json(
        { error: 'Failed to save contract' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Contract generated successfully',
      contract: contract,
      contract_url: contractUrlData.signedUrl,
      allegati: allegatiUrls,
    });
  } catch (error: any) {
    console.error('Error generating contract:', error);
    return NextResponse.json(
      { error: 'Failed to generate contract: ' + error.message },
      { status: 500 }
    );
  }
}
