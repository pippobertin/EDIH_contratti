import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Company } from '@/types';

// POST: Crea nuova azienda
export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();

    console.log('Creating company with data:', {
      denominazione: body.denominazione,
      has_visura: !!body.visura_data,
      has_bilancio: !!body.bilancio_data,
      tipo_servizio: body.tipo_servizio,
    });

    const { data, error } = await supabaseAdmin
      .from('edih_companies')
      .insert({
        denominazione: body.denominazione,
        partita_iva: body.partita_iva,
        codice_fiscale: body.codice_fiscale || null,
        legale_rappresentante: body.legale_rappresentante,
        titolare_effettivo: body.titolare_effettivo,
        sede_legale: body.sede_legale || null,
        email: body.email || null,
        telefono: body.telefono || null,
        tipo_servizio: body.tipo_servizio || null,
        visura_data: body.visura_data || null,
        bilancio_data: body.bilancio_data || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Company created successfully:', data.id);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}

// GET: Ottieni tutte le aziende
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('edih_companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
