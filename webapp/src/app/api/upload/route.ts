import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const companyId = formData.get('company_id') as string;
    const tipoDocumento = formData.get('tipo_documento') as 'visura' | 'bilancio';

    if (!file || !companyId || !tipoDocumento) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Crea un nome file univoco
    const fileExt = file.name.split('.').pop();
    const fileName = `${companyId}/${tipoDocumento}_${Date.now()}.${fileExt}`;

    // Converti il file in ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload su Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Ottieni URL pubblico
    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Salva i metadati nel database
    const { data: docData, error: docError } = await supabaseAdmin
      .from('edih_documents')
      .insert({
        company_id: companyId,
        tipo_documento: tipoDocumento,
        file_name: file.name,
        file_path: fileName,
        file_url: urlData.publicUrl,
      })
      .select()
      .single();

    if (docError) {
      console.error('Database error:', docError);
      return NextResponse.json(
        { error: 'Failed to save document metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json(docData, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
