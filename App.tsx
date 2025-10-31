import React, { useState, useCallback } from 'react';
import { OriginalImage, PreservedDetails, PreservedDetailKey } from './types';
import { editImage } from './services/geminiService';
import Spinner from './components/Spinner';
import ImageInput from './components/ImageInput';

const preservedDetailOptions: { key: PreservedDetailKey; label: string }[] = [
  { key: 'typography', label: 'Typography' },
  { key: 'style', label: 'Style' },
  { key: 'color', label: 'Color Palette' },
  { key: 'icon', label: 'Icon / Shape' },
  { key: 'backgroundColor', label: 'Background Color' },
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
        setError("Please upload a logo to get started.");
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
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, newBrandName, industry, changeDetails, preservedDetails, isFormValid]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Logo Style Cloner
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Remix your logo with AI. Powered by Gemini 2.5 Flash Image.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Controls Column */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col gap-6">
            <h2 className="text-2xl font-bold border-b border-gray-700 pb-3">1. Configure Your Logo</h2>
            <ImageInput onImageUpload={setOriginalImage} />
            
            <div>
              <label htmlFor="brand-name" className="block text-sm font-medium text-gray-300">New Brand Name (Optional)</label>
              <input
                type="text"
                id="brand-name"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="e.g., 'Aperture Labs'"
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-300">Industry / Business Sector (Optional)</label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., 'Technology', 'Restaurant'"
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Details to Preserve</label>
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
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={key} className="font-medium text-gray-300">{label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="changes" className="block text-sm font-medium text-gray-300">Details of Changes (Optional)</label>
              <textarea
                id="changes"
                rows={4}
                value={changeDetails}
                onChange={(e) => setChangeDetails(e.target.value)}
                placeholder="e.g., 'Make it futuristic and add a circuit board pattern in the background'"
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={!isFormValid || isLoading}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? <Spinner /> : 'Generate New Logo'}
            </button>
            {error && <p className="text-red-400 text-center text-sm">{error}</p>}
          </div>

          {/* Results Column */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold border-b border-gray-700 pb-3 mb-6">2. View Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-400 mb-3">Original</h3>
                <div className="w-full h-64 bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                  {originalImage ? (
                    <img src={`data:${originalImage.mimeType};base64,${originalImage.base64Data}`} alt="Original" className="max-w-full max-h-full object-contain rounded-md" />
                  ) : (
                    <span className="text-gray-500">Upload an image</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold text-gray-400 mb-3">Generated</h3>
                <div className="w-full h-64 bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg">
                        <Spinner />
                        <p className="mt-2 text-sm text-gray-300">Generating...</p>
                    </div>
                  )}
                  {generatedImage ? (
                    <img src={`data:image/png;base64,${generatedImage}`} alt="Generated" className="max-w-full max-h-full object-contain rounded-md" />
                  ) : (
                    !isLoading && <span className="text-gray-500">Awaiting generation</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;