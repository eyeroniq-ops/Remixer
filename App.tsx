import React, { useState, useCallback } from 'react';
import { OriginalImage, PreservedDetails, PreservedDetailKey } from './types';
import { editImage } from './services/geminiService';
import Spinner from './components/Spinner';
import ImageInput from './components/ImageInput';

const preservedDetailOptions: { key: PreservedDetailKey; label: string }[] = [
  { key: 'typography', label: 'Tipografía' },
  { key: 'style', label: 'Estilo' },
  { key: 'color', label: 'Paleta de Colores' },
  { key: 'icon', label: 'Ícono / Forma' },
  { key: 'backgroundColor', label: 'Color de Fondo' },
];

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [changeDetails, setChangeDetails] = useState<string>('');
  const [preservedDetails, setPreservedDetails] = useState<PreservedDetails>({
    typography: true,
    style: true,
    color: true,
    icon: true,
    backgroundColor: true,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreservedDetailChange = (key: PreservedDetailKey) => {
    setPreservedDetails((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  
  const isFormValid = !!originalImage;

  const handleSubmit = useCallback(async () => {
    if (!isFormValid) {
        setError("Por favor, sube un logo para empezar.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultBase64 = await editImage(
        originalImage.base64Data,
        originalImage.mimeType,
        newBrandName,
        industry,
        changeDetails,
        preservedDetails
      );
      setGeneratedImage(resultBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, newBrandName, industry, changeDetails, preservedDetails, isFormValid]);

  return (
    <div className="min-h-screen bg-[#282832] text-[#f3c6ca] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#fc4986] to-[#d12863]">
            Remixer
          </h1>
          <p className="mt-2 text-lg text-[#f3c6ca]/80">
            Remezcla tu logo con IA. Potenciado por Gemini 2.5 Flash Image.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Controls Column */}
          <div className="bg-[#2f2f3a] p-6 rounded-2xl shadow-lg flex flex-col gap-6">
            <h2 className="text-2xl font-bold border-b border-[#d12863] pb-3">1. Configura Tu Logo</h2>
            <ImageInput onImageUpload={setOriginalImage} />
            
            <div>
              <label htmlFor="brand-name" className="block text-sm font-medium text-[#f3c6ca]">Nuevo Nombre de Marca (Opcional)</label>
              <input
                type="text"
                id="brand-name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="p. ej., 'Aperture Labs'"
                className="mt-1 block w-full bg-[#282832] border border-[#d12863] rounded-md shadow-sm py-2 px-3 text-[#f3c6ca] focus:outline-none focus:ring-[#fc4986] focus:border-[#fc4986] sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-[#f3c6ca]">Industria / Sector (Opcional)</label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="p. ej., 'Tecnología', 'Restaurante'"
                className="mt-1 block w-full bg-[#282832] border border-[#d12863] rounded-md shadow-sm py-2 px-3 text-[#f3c6ca] focus:outline-none focus:ring-[#fc4986] focus:border-[#fc4986] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f3c6ca]">Detalles a Conservar</label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {preservedDetailOptions.map(({ key, label }) => (
                  <div key={key} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={key}
                        name={key}
                        type="checkbox"
                        checked={preservedDetails[key]}
                        onChange={() => handlePreservedDetailChange(key)}
                        className="focus:ring-[#fc4986] h-4 w-4 text-[#fc4986] bg-[#282832] border-[#d12863] rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={key} className="font-medium text-[#f3c6ca]">{label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="changes" className="block text-sm font-medium text-[#f3c6ca]">Detalles de los Cambios (Opcional)</label>
              <textarea
                id="changes"
                rows={4}
                value={changeDetails}
                onChange={(e) => setChangeDetails(e.target.value)}
                placeholder="p. ej., 'Hazlo futurista y añade un patrón de circuito en el fondo'"
                className="mt-1 block w-full bg-[#282832] border border-[#d12863] rounded-md shadow-sm py-2 px-3 text-[#f3c6ca] focus:outline-none focus:ring-[#fc4986] focus:border-[#fc4986] sm:text-sm"
              />
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-[#282832] bg-[#fc4986] hover:bg-[#d12863] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fc4986] disabled:bg-[#d12863]/50 disabled:text-[#f3c6ca]/50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <Spinner /> : 'Generar Nuevo Logo'}
            </button>
            {error && <p className="text-[#fc4986] text-center text-sm">{error}</p>}
          </div>

          {/* Results Column */}
          <div className="bg-[#2f2f3a] p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold border-b border-[#d12863] pb-3 mb-6">2. Ver Resultados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-[#f3c6ca]/80 mb-3">Original</h3>
                <div className="w-full h-64 bg-[#282832]/50 rounded-lg flex items-center justify-center border-2 border-dashed border-[#d12863]">
                  {originalImage ? (
                    <img src={`data:${originalImage.mimeType};base64,${originalImage.base64Data}`} alt="Original" className="max-w-full max-h-full object-contain rounded-md" />
                  ) : (
                    <span className="text-[#f3c6ca]/70">Sube una imagen</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-[#f3c6ca]/80 mb-3">Generado</h3>
                <div className="w-full h-64 bg-[#282832]/50 rounded-lg flex items-center justify-center border-2 border-dashed border-[#d12863] relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg text-[#fc4986]">
                        <Spinner />
                        <p className="mt-2 text-sm text-[#f3c6ca]">Generando...</p>
                    </div>
                  )}
                  {generatedImage ? (
                    <img src={`data:image/png;base64,${generatedImage}`} alt="Generated" className="max-w-full max-h-full object-contain rounded-md" />
                  ) : (
                    !isLoading && <span className="text-[#f3c6ca]/70">Esperando generación</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer className="text-center mt-10 py-4 text-sm text-[#f3c6ca]/70">
          <p>&copy; 2025 eyeroniq&reg;</p>
        </footer>
      </div>
    </div>
  );
};

export default App;