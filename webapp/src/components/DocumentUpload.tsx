'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  companyId: string;
  tipoDocumento: 'visura' | 'bilancio';
  onUploadSuccess: (documentId: string) => void;
}

export default function DocumentUpload({
  companyId,
  tipoDocumento,
  onUploadSuccess,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploading(true);
      setError(null);

      try {
        // Upload del file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('company_id', companyId);
        formData.append('tipo_documento', tipoDocumento);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadData = await uploadResponse.json();
        setUploaded(true);
        setUploading(false);

        // Estrazione dati
        setExtracting(true);
        const extractResponse = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_id: uploadData.id }),
        });

        if (!extractResponse.ok) {
          throw new Error('Failed to extract data');
        }

        setExtracting(false);
        onUploadSuccess(uploadData.id);
      } catch (err: any) {
        setError(err.message);
        setUploading(false);
        setExtracting(false);
      }
    },
    [companyId, tipoDocumento, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    disabled: uploading || extracting || uploaded,
  });

  const getTitle = () => {
    return tipoDocumento === 'visura' ? 'Visura Camerale' : 'Bilancio Aziendale';
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Carica {getTitle()}
      </h3>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        } ${
          (uploading || extracting || uploaded) &&
          'opacity-50 cursor-not-allowed'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {uploaded ? (
            <>
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-green-700 font-medium">
                Documento caricato ed elaborato con successo
              </p>
            </>
          ) : extracting ? (
            <>
              <FileText className="w-12 h-12 text-primary-500 animate-pulse" />
              <p className="text-gray-700">Estrazione dati in corso...</p>
            </>
          ) : uploading ? (
            <>
              <Upload className="w-12 h-12 text-primary-500 animate-pulse" />
              <p className="text-gray-700">Caricamento in corso...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-gray-700 font-medium">
                  Trascina qui il file o clicca per selezionare
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, DOC, DOCX, PNG, JPG (max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
