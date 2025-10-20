'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DocumentUpload from '@/components/DocumentUpload';
import { Company, TipoContratto } from '@/types';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company_id');

  const [company, setCompany] = useState<Company | null>(null);
  const [visuraUploaded, setVisuraUploaded] = useState(false);
  const [bilancioUploaded, setBilancioUploaded] = useState(false);
  const [selectedService, setSelectedService] = useState<TipoContratto | null>(
    null
  );
  const [generating, setGenerating] = useState(false);
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [allegatiUrls, setAllegatiUrls] = useState<
    { nome: string; url: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchCompany(companyId);
    }
  }, [companyId]);

  const fetchCompany = async (id: string) => {
    try {
      const response = await fetch(`/api/companies/${id}`);
      if (!response.ok) throw new Error('Failed to fetch company');
      const data = await response.json();
      setCompany(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateContract = async () => {
    if (!companyId || !selectedService) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          tipo_contratto: selectedService,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate contract');
      }

      const data = await response.json();
      setContractUrl(data.contract_url);
      setAllegatiUrls(data.allegati || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!companyId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Nessuna azienda selezionata</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Caricamento...</p>
      </div>
    );
  }

  const canGenerateContract = visuraUploaded && bilancioUploaded && selectedService;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Dashboard - {company.denominazione}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold">P. IVA:</span> {company.partita_iva}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Legale Rappresentante:</span>{' '}
              {company.legale_rappresentante}
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-semibold">Titolare Effettivo:</span>{' '}
              {company.titolare_effettivo}
            </p>
            {company.sede_legale && (
              <p className="text-gray-600">
                <span className="font-semibold">Sede:</span> {company.sede_legale}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <DocumentUpload
          companyId={companyId}
          tipoDocumento="visura"
          onUploadSuccess={() => setVisuraUploaded(true)}
        />
        <DocumentUpload
          companyId={companyId}
          tipoDocumento="bilancio"
          onUploadSuccess={() => setBilancioUploaded(true)}
        />
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Seleziona Tipo di Servizio
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedService('formazione')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              selectedService === 'formazione'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <div className="flex items-center mb-2">
              <FileText className="w-6 h-6 text-primary-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Formazione AI</h4>
            </div>
            <p className="text-sm text-gray-600">
              Contratto per corsi di formazione sull'intelligenza artificiale
            </p>
          </button>

          <button
            onClick={() => setSelectedService('assessment')}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              selectedService === 'assessment'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <div className="flex items-center mb-2">
              <FileText className="w-6 h-6 text-primary-600 mr-2" />
              <h4 className="font-semibold text-gray-900">
                Assessment Maturità Digitale
              </h4>
            </div>
            <p className="text-sm text-gray-600">
              Contratto per servizio di valutazione maturità digitale
            </p>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Genera Contratto
        </h3>

        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm">
            {visuraUploaded ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
            )}
            <span className={visuraUploaded ? 'text-green-700' : 'text-gray-600'}>
              Visura camerale caricata
            </span>
          </div>
          <div className="flex items-center text-sm">
            {bilancioUploaded ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
            )}
            <span className={bilancioUploaded ? 'text-green-700' : 'text-gray-600'}>
              Bilancio aziendale caricato
            </span>
          </div>
          <div className="flex items-center text-sm">
            {selectedService ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-2" />
            )}
            <span className={selectedService ? 'text-green-700' : 'text-gray-600'}>
              Tipo di servizio selezionato
            </span>
          </div>
        </div>

        {!contractUrl ? (
          <button
            onClick={handleGenerateContract}
            disabled={!canGenerateContract || generating}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {generating
              ? 'Generazione in corso...'
              : 'Genera Contratto e Allegati'}
          </button>
        ) : (
          <div>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium mb-2">
                Documenti generati con successo!
              </p>
              <p className="text-sm text-green-700">
                Contratto principale e {allegatiUrls.length} allegati pronti per il
                download.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={contractUrl}
                download
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium inline-flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Scarica Contratto Principale (DOCX)
              </a>

              {allegatiUrls.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Allegati:</h4>
                  <div className="space-y-2">
                    {allegatiUrls.map((allegato, index) => (
                      <a
                        key={index}
                        href={allegato.url}
                        download
                        className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm inline-flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {allegato.nome}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Caricamento...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
