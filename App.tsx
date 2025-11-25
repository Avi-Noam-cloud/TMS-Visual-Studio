
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Wand2, Download, RefreshCw, AlertCircle, Key, Settings, Palette } from 'lucide-react';
import { Button } from './components/Button';
import { StrategyDisplay } from './components/StrategyDisplay';
import { BrandConfigModal } from './components/BrandConfigModal';
import { determineStrategy, editImage } from './services/geminiService';
import { saveBrandProfile, loadBrandProfile } from './services/storageService';
import { ProcessingState, BrandStrategy, BrandProfile } from './types';
import { DEFAULT_BRAND_PROFILE } from './constants';

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Brand Configuration State
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(DEFAULT_BRAND_PROFILE);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Load Brand Profile from IndexedDB on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await loadBrandProfile();
        setBrandProfile(profile);
      } catch (e) {
        console.error("Failed to load brand profile:", e);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (newProfile: BrandProfile) => {
    setBrandProfile(newProfile);
    try {
      await saveBrandProfile(newProfile);
    } catch (e) {
      console.error("Failed to save brand profile:", e);
      setError("Failed to save brand configuration.");
    }
  };

  // API Key Selection Logic
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please select an image under 5MB.");
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setResultImage(null);
      setStrategy(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        // Remove data URL prefix for API
        const base64 = result.split(',')[1];
        setBase64Image(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!instruction) return;

    try {
      setError(null);
      
      // Step 1: Strategy
      setProcessingState(ProcessingState.ANALYZING);
      // mimeType is optional now
      const mimeType = selectedFile?.type || null;
      
      // Pass the current brand profile
      const strat = await determineStrategy(instruction, brandProfile, base64Image, mimeType);
      setStrategy(strat);

      // Step 2: Generation
      setProcessingState(ProcessingState.GENERATING);
      const newImage = await editImage(base64Image, mimeType, strat.refinedPrompt, strat.aspectRatio);
      
      setResultImage(newImage);
      setProcessingState(ProcessingState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setProcessingState(ProcessingState.ERROR);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setBase64Image(null);
    setInstruction('');
    setStrategy(null);
    setResultImage(null);
    setProcessingState(ProcessingState.IDLE);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 max-w-md w-full shadow-lg border-t-4 border-brand-gold rounded-sm text-center">
          <div className="w-16 h-16 bg-brand-brown text-brand-gold flex items-center justify-center font-serif font-bold text-2xl rounded-full mx-auto mb-6">TS</div>
          <h1 className="font-serif text-2xl text-brand-brown mb-4">Temple Mount Soil</h1>
          <p className="text-brand-gray mb-8 leading-relaxed font-sans">
            To access the premium generation capabilities of <strong>Gemini 3 Pro</strong>, please select a billing-enabled API key from your Google Cloud project.
          </p>
          <Button onClick={handleSelectKey} className="w-full justify-center">
            <Key size={18} />
            Connect API Key
          </Button>
          <p className="mt-6 text-xs text-brand-gray/60 font-sans">
            See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-brand-brown">Billing Documentation</a> for details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] font-sans text-brand-brown selection:bg-brand-gold selection:text-white">
      {/* Settings Modal */}
      <BrandConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        profile={brandProfile}
        onSave={handleSaveProfile}
      />

      {/* Header */}
      <header className="bg-white border-b border-brand-brown/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-brown text-brand-gold flex items-center justify-center font-serif font-bold text-xl rounded-sm">
              TS
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-brand-brown">Temple Mount Soil</h1>
              <p className="text-xs uppercase tracking-widest text-brand-gray font-sans">Visual Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-brand-brown hover:text-brand-gold transition-colors font-sans px-3 py-2 rounded-sm hover:bg-brand-cream/50"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Configure Brand</span>
            </button>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-brown/60 font-sans border-l border-brand-brown/10 pl-4">
              <span>Gemini 3 Pro Image</span>
              <span className="w-px h-4 bg-brand-brown/20"></span>
              <span className="text-brand-gold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Connected
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 1. Image Upload */}
            <div className="bg-white p-6 shadow-sm border border-brand-brown/5 rounded-sm">
              <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
                <span className="text-brand-gray text-lg">01.</span> Source Material <span className="text-sm text-brand-gray font-sans font-normal ml-auto bg-brand-cream px-2 py-0.5 rounded text-xs tracking-wide">OPTIONAL</span>
              </h2>
              
              {!previewUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-brown/20 rounded-sm p-12 text-center cursor-pointer hover:border-brand-gold hover:bg-brand-cream/50 transition-all group"
                >
                  <Upload className="w-10 h-10 text-brand-gray mx-auto mb-4 group-hover:text-brand-gold transition-colors" />
                  <p className="font-medium text-brand-brown font-sans">Click to upload original photo</p>
                  <p className="text-sm text-brand-gray mt-2 font-sans">Or leave empty to generate from scratch</p>
                </div>
              ) : (
                <div className="relative group">
                  <img src={previewUrl} alt="Source" className="w-full rounded-sm shadow-inner" />
                  <button 
                    onClick={handleReset}
                    className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-brand-brown shadow-md hover:bg-brand-brown hover:text-white transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/png, image/jpeg, image/webp"
              />
            </div>

            {/* 2. Strategy Input */}
            <div className="bg-white p-6 shadow-sm border border-brand-brown/5 rounded-sm">
              <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
                <span className="text-brand-gray text-lg">02.</span> Directive
              </h2>
              
              {brandProfile.name !== DEFAULT_BRAND_PROFILE.name && (
                <div className="mb-3 flex items-center gap-2 text-xs text-brand-gold font-bold uppercase tracking-wider bg-brand-cream/50 p-2 rounded-sm border border-brand-gold/20">
                  <Palette size={12} />
                  Using custom brand: {brandProfile.name}
                </div>
              )}

              <p className="text-sm text-brand-gray mb-3 font-sans">
                Describe your intent (e.g., "Create a moody Instagram post about the Western Wall" or "Remove the tourists from the background").
              </p>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Enter your strategic directive..."
                className="w-full h-32 p-4 bg-brand-cream/30 border border-brand-brown/20 rounded-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none resize-none font-sans text-lg placeholder:text-brand-gray/50"
              />
              
              <div className="mt-6">
                <Button 
                  onClick={handleProcess} 
                  isLoading={processingState === ProcessingState.ANALYZING || processingState === ProcessingState.GENERATING}
                  className="w-full"
                  disabled={!instruction}
                >
                  <Wand2 size={20} />
                  {previewUrl ? 'Edit Content' : 'Generate Content'}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-800 text-sm rounded-sm flex items-start gap-3 font-sans">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
             <div className="sticky top-24">
               {processingState === ProcessingState.IDLE && !resultImage && (
                 <div className="h-[600px] border-2 border-dashed border-brand-brown/10 rounded-sm flex flex-col items-center justify-center text-brand-gray/40">
                   <ImageIcon size={64} className="mb-4 opacity-50" />
                   <p className="font-serif text-xl">Waiting for directive...</p>
                 </div>
               )}

               {strategy && (
                 <StrategyDisplay strategy={strategy} />
               )}

               {processingState === ProcessingState.GENERATING && (
                 <div className="bg-white p-12 text-center rounded-sm shadow-sm border border-brand-brown/5 animate-pulse">
                   <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                   <h3 className="font-serif text-2xl text-brand-brown mb-2">Generating High-Fidelity Imagery</h3>
                   <p className="text-brand-gray font-sans">Creating visuals with Gemini 3 Pro...</p>
                 </div>
               )}

               {resultImage && (
                 <div className="bg-white p-4 shadow-lg border border-brand-brown/10 rounded-sm animate-fade-in-up">
                   <div className="relative group">
                     <img src={resultImage} alt="Generated Content" className="w-full rounded-sm" />
                     <div className="absolute inset-0 bg-brand-brown/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                       <a 
                         href={resultImage} 
                         download="temple-mount-generated.png" 
                         className="bg-brand-gold text-white px-6 py-3 rounded-none font-sans font-bold hover:bg-white hover:text-brand-brown transition-colors flex items-center gap-2"
                       >
                         <Download size={20} />
                         Download High-Res
                       </a>
                     </div>
                   </div>
                   <div className="mt-4 flex justify-between items-center border-t border-brand-brown/10 pt-4">
                     <span className="text-xs font-bold uppercase tracking-widest text-brand-gray font-sans">Generated via Gemini 3 Pro</span>
                     <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-brand-gold"></div>
                       <div className="w-3 h-3 rounded-full bg-brand-brown"></div>
                       <div className="w-3 h-3 rounded-full bg-brand-cream border border-brand-gray/20"></div>
                     </div>
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
