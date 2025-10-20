'use client';

import { useRouter } from 'next/navigation';
import { FileText, TrendingUp, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Benvenuto nel Sistema di Gestione Modulistica EDIH
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Compila automaticamente contratti e documenti utilizzando l'intelligenza
          artificiale
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-primary-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">
              Formazione AI
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Gestisci contratti e modulistica per i corsi di formazione sull'intelligenza
            artificiale per imprenditori.
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Contratto di formazione</li>
            <li>• Allegati automatici</li>
            <li>• Conformità normativa UE</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 text-primary-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">
              Assessment Maturità Digitale
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Genera documentazione per servizi di valutazione della maturità digitale
            aziendale.
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Contratto di assessment</li>
            <li>• Report personalizzati</li>
            <li>• Analisi automatica</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Come funziona</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center mb-3 font-bold">
              1
            </div>
            <h4 className="font-semibold mb-2">Registra l'azienda</h4>
            <p className="text-sm text-primary-50">
              Inserisci i dati principali e il titolare effettivo
            </p>
          </div>
          <div>
            <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center mb-3 font-bold">
              2
            </div>
            <h4 className="font-semibold mb-2">Carica i documenti</h4>
            <p className="text-sm text-primary-50">
              Visura camerale e bilancio aziendale
            </p>
          </div>
          <div>
            <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center mb-3 font-bold">
              3
            </div>
            <h4 className="font-semibold mb-2">Genera i contratti</h4>
            <p className="text-sm text-primary-50">
              L'AI compila automaticamente la modulistica
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/register')}
          className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center"
        >
          Inizia ora
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>

      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 className="font-semibold text-amber-900 mb-2">
          Progetto finanziato UE
        </h4>
        <p className="text-sm text-amber-800">
          Questo servizio è parte dei programmi di digitalizzazione finanziati
          dall'Unione Europea attraverso il progetto EDIH (European Digital Innovation
          Hub).
        </p>
      </div>
    </div>
  );
}
