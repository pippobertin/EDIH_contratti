'use client';

import { useRouter } from 'next/navigation';
import CompanyRegistrationForm from '@/components/CompanyRegistrationForm';
import { Company } from '@/types';

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = (company: Company) => {
    // Reindirizza alla dashboard con l'ID dell'azienda
    router.push(`/dashboard?company_id=${company.id}`);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Genera Contratto EDIH
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Usa il MyGPT per estrarre i dati da visura e bilancio, poi genera automaticamente il contratto compilato e tutti gli allegati in pochi secondi.
        </p>
      </div>
      <CompanyRegistrationForm />
    </div>
  );
}
