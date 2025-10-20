'use client';

import { useState } from 'react';

interface CompanyRegistrationFormProps {
  onSuccess?: () => void;
}

export default function CompanyRegistrationForm({
  onSuccess,
}: CompanyRegistrationFormProps) {
  const [jsonInputVisura, setJsonInputVisura] = useState('');
  const [jsonInputBilancio, setJsonInputBilancio] = useState('');
  const [tipoServizio, setTipoServizio] = useState<'formazione' | 'assessment'>('formazione');
  const [visuraData, setVisuraData] = useState<any>(null);
  const [bilancioData, setBilancioData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [allegatiUrls, setAllegatiUrls] = useState<{ nome: string; url: string }[]>([]);

  const handleImportVisura = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonInputVisura);
      if (parsed.tipo_documento !== 'visura') {
        throw new Error('Il JSON deve avere "tipo_documento": "visura"');
      }
      setVisuraData(parsed);
      setJsonInputVisura('');
    } catch (err: any) {
      setError('Errore visura: ' + err.message);
    }
  };

  const handleImportBilancio = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonInputBilancio);
      if (parsed.tipo_documento !== 'bilancio') {
        throw new Error('Il JSON deve avere "tipo_documento": "bilancio"');
      }
      setBilancioData(parsed);
      setJsonInputBilancio('');
    } catch (err: any) {
      setError('Errore bilancio: ' + err.message);
    }
  };

  const handleGenerateContract = async () => {
    if (!visuraData) {
      setError('Importa almeno la visura prima di generare il contratto');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Step 1: Crea l'azienda con i dati estratti
      const companyPayload = {
        denominazione: visuraData.denominazione,
        partita_iva: visuraData.partita_iva,
        codice_fiscale: visuraData.codice_fiscale,
        legale_rappresentante: visuraData.legale_rappresentante,
        titolare_effettivo: visuraData.titolare_effettivo,
        sede_legale: visuraData.sede_legale,
        email: null,
        telefono: null,
        tipo_servizio: tipoServizio,
        visura_data: visuraData,
        bilancio_data: bilancioData,
      };

      const companyResponse = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyPayload),
      });

      if (!companyResponse.ok) {
        const errorData = await companyResponse.json();
        throw new Error(errorData.error || 'Errore durante la registrazione');
      }

      const company = await companyResponse.json();
      console.log('✅ Azienda creata:', company.id);

      // Step 2: Genera il contratto
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.id,
          tipo_contratto: tipoServizio,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Errore durante la generazione');
      }

      const result = await generateResponse.json();
      console.log('✅ Contratto generato:', result);

      setContractUrl(result.contract_url);
      setAllegatiUrls(result.allegati || []);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Sezione Import JSON */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-lg p-8 border-2 border-blue-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📋 Step 1: Importa Dati dal MyGPT
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Usa il MyGPT &quot;EDIH - Estrattore Dati Modulistica&quot; per estrarre i dati da visura e bilancio, poi incolla i JSON qui sotto.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Import Visura */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              JSON Visura Camerale <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jsonInputVisura}
              onChange={(e) => setJsonInputVisura(e.target.value)}
              placeholder='{"tipo_documento": "visura", "denominazione": "...", ...}'
              rows={8}
              disabled={!!visuraData}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {!visuraData ? (
              <button
                type="button"
                onClick={handleImportVisura}
                disabled={!jsonInputVisura.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                Importa Visura
              </button>
            ) : (
              <div className="p-3 bg-green-50 border border-green-300 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-800">
                    <span className="text-xl">✓</span>
                    <span className="font-semibold">Visura importata</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisuraData(null)}
                    className="text-sm text-green-700 hover:text-green-900 underline"
                  >
                    Modifica
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Bilancio */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              JSON Bilancio (opzionale)
            </label>
            <textarea
              value={jsonInputBilancio}
              onChange={(e) => setJsonInputBilancio(e.target.value)}
              placeholder='{"tipo_documento": "bilancio", "anno_riferimento": "2024", ...}'
              rows={8}
              disabled={!!bilancioData}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {!bilancioData ? (
              <button
                type="button"
                onClick={handleImportBilancio}
                disabled={!jsonInputBilancio.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                Importa Bilancio
              </button>
            ) : (
              <div className="p-3 bg-green-50 border border-green-300 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-800">
                    <span className="text-xl">✓</span>
                    <span className="font-semibold">Bilancio importato</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBilancioData(null)}
                    className="text-sm text-green-700 hover:text-green-900 underline"
                  >
                    Modifica
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anteprima Dati Importati */}
      {visuraData && (
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📄 Dati Azienda
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Denominazione:</span>
              <p className="text-gray-900">{visuraData.denominazione}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">P.IVA:</span>
              <p className="text-gray-900">{visuraData.partita_iva}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Legale Rappresentante:</span>
              <p className="text-gray-900">{visuraData.legale_rappresentante}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Sede Legale:</span>
              <p className="text-gray-900">{visuraData.sede_legale}</p>
            </div>
            {bilancioData && (
              <>
                <div>
                  <span className="font-semibold text-gray-700">Anno Bilancio:</span>
                  <p className="text-gray-900">{bilancioData.anno_riferimento}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Fatturato:</span>
                  <p className="text-gray-900">{bilancioData.fatturato?.toLocaleString('it-IT')} €</p>
                </div>
                {bilancioData.numero_ula && (
                  <div>
                    <span className="font-semibold text-gray-700">ULA:</span>
                    <p className="text-gray-900">{bilancioData.numero_ula}</p>
                  </div>
                )}
                {bilancioData.dimensione && (
                  <div className="md:col-span-2">
                    <span className="font-semibold text-gray-700">Dimensione Azienda:</span>
                    <p className="text-gray-900 font-bold text-primary-600">{bilancioData.dimensione}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Selezione Servizio e Generazione */}
      {visuraData && (
        <div className="bg-white shadow-md rounded-lg p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            🎯 Step 2: Seleziona Servizio e Genera Contratto
          </h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo di Servizio EDIH <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTipoServizio('formazione')}
                className={`p-4 border-2 rounded-lg font-medium transition ${
                  tipoServizio === 'formazione'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                }`}
              >
                📚 Formazione
              </button>
              <button
                type="button"
                onClick={() => setTipoServizio('assessment')}
                className={`p-4 border-2 rounded-lg font-medium transition ${
                  tipoServizio === 'assessment'
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                }`}
              >
                🔍 Assessment
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGenerateContract}
              disabled={generating || !visuraData}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition"
            >
              {generating ? '⏳ Generazione in corso...' : '🚀 Genera Contratto e Allegati'}
            </button>
            {!visuraData && (
              <p className="text-xs text-red-600 text-center mt-2">
                ⚠️ Importa la visura prima di generare il contratto
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sezione Download */}
      {contractUrl && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg rounded-lg p-8 border-2 border-green-300">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">✅</span>
            <div>
              <h3 className="text-2xl font-bold text-green-900">
                Contratto Generato con Successo!
              </h3>
              <p className="text-sm text-green-700">
                Scarica il contratto e gli allegati qui sotto
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Contratto Principale */}
            <div className="bg-white rounded-lg p-4 shadow border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <div>
                    <p className="font-bold text-gray-900">Contratto Principale</p>
                    <p className="text-sm text-gray-600">
                      Contratto {tipoServizio === 'formazione' ? 'Formazione' : 'Assessment'} - {visuraData.denominazione}
                    </p>
                  </div>
                </div>
                <a
                  href={contractUrl}
                  download
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium transition"
                >
                  Scarica
                </a>
              </div>
            </div>

            {/* Allegati */}
            {allegatiUrls.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 mb-3">📎 Allegati ({allegatiUrls.length})</h4>
                <div className="space-y-2">
                  {allegatiUrls.map((allegato, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📋</span>
                          <p className="text-sm font-medium text-gray-900">{allegato.nome}</p>
                        </div>
                        <a
                          href={allegato.url}
                          download
                          className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700 font-medium transition"
                        >
                          Scarica
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-green-200">
              <button
                type="button"
                onClick={() => {
                  setContractUrl(null);
                  setAllegatiUrls([]);
                  setVisuraData(null);
                  setBilancioData(null);
                }}
                className="w-full bg-white text-green-700 border-2 border-green-300 py-2 px-4 rounded-md hover:bg-green-50 font-medium transition"
              >
                ✨ Genera Nuovo Contratto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
