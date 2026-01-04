import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Wand2, Download, RefreshCw, AlertCircle, Key, Settings, Palette, CheckCircle, Type, ChevronDown, ChevronUp, Trash2, Plus, Cloud, ExternalLink } from 'lucide-react';
import { Button } from './components/Button';
import { StrategyDisplay } from './components/StrategyDisplay';
import { BrandConfigModal } from './components/BrandConfigModal';
import { ProcessingStatus } from './components/ProcessingStatus';
import { determineStrategy, editImage } from './services/geminiService';
import { saveBrandProfile, loadBrandProfile } from './services/storageService';
import { initDriveAuth, uploadToDrive } from './services/driveService';
import { ProcessingState, BrandStrategy, BrandProfile } from './types';
import { DEFAULT_BRAND_PROFILE } from './constants';

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

// Helper to convert base64 data URI to Blob for robust downloading
const base64ToBlob = (dataURI: string): Blob => {
  const splitData = dataURI.split(',');
  const byteString = atob(splitData[1]);
  const mimeString = splitData[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isKeyCheckLoading, setIsKeyCheckLoading] = useState(true);
  
  // Multiple Image State
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [instruction, setInstruction] = useState('');
  
  // Text Overlay State
  const [headline, setHeadline] = useState('');
  const [bodyCopy, setBodyCopy] = useState('');
  const [cta, setCta] = useState('');
  const [isTextSectionOpen, setIsTextSectionOpen] = useState(false);

  const [processingState, setProcessingState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Brand Configuration State
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(DEFAULT_BRAND_PROFILE);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Drive Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessLink, setUploadSuccessLink] = useState<string | null>(null);

  // Load Brand Profile from IndexedDB on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await loadBrandProfile();
        setBrandProfile(profile);
        // Initialize Drive if client ID is present
        if (profile.googleDriveClientId) {
          initDriveAuth(profile.googleDriveClientId);
        }
      } catch (e) {
        console.error("Failed to load brand profile:", e);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (newProfile: BrandProfile) => {
    setBrandProfile(newProfile);
    if (newProfile.googleDriveClientId) {
        initDriveAuth(newProfile.googleDriveClientId);
    }
    try {
      await saveBrandProfile(newProfile);
    } catch (e) {
      console.error("Failed to save brand profile:", e);
      setError("Failed to save brand configuration.");
    }
  };

  // API Key Selection Logic with Persistence
  useEffect(() => {
    const checkKey = async () => {
      try {
        // 1. Check if we have previously authorized in this browser
        const storedAuth = localStorage.getItem('gemini_api_key_authorized');
        if (storedAuth === 'true') {
          setHasApiKey(true);
          setIsKeyCheckLoading(false);
          return;
        }

        // 2. Check if API key is injected via environment (e.g. local development)
        if (process.env.API_KEY) {
          setHasApiKey(true);
          localStorage.setItem('gemini_api_key_authorized', 'true');
          setIsKeyCheckLoading(false);
          return;
        }

        // 3. Check AI Studio Platform state
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          setHasApiKey(true);
          localStorage.setItem('gemini_api_key_authorized', 'true');
        }
      } catch (e) {
        console.error("API Key check failed:", e);
      } finally {
        setIsKeyCheckLoading(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
        localStorage.setItem('gemini_api_key_authorized', 'true');
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: UploadedImage[] = [];
      let hasError = false;

      Array.from(files).forEach((file: File) => {
        if (file.size > 5 * 1024 * 1024) {
          hasError = true;
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          setUploadedImages(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            file,
            previewUrl: result,
            base64,
            mimeType: file.type
          }]);
        };
        reader.readAsDataURL(file);
      });

      if (hasError) {
        setError("One or more files were skipped because they exceed the 5MB limit.");
      } else {
        setError(null);
      }
      
      setResultImage(null);
      setStrategy(null);
      setUploadSuccessLink(null);
      
      // Reset input to allow selecting the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleProcess = async () => {
    if (!instruction && !headline && !bodyCopy && !cta && uploadedImages.length === 0) return;

    try {
      setError(null);
      setResultImage(null);
      setStrategy(null);
      setUploadSuccessLink(null);
      
      // Step 1: Strategy
      setProcessingState(ProcessingState.ANALYZING);
      
      // Prepare images for service
      const inputImages = uploadedImages.map(img => ({
        data: img.base64,
        mimeType: img.mimeType
      }));
      
      // Construct detailed instruction including text requirements
      let fullInstruction = instruction;
      if (headline || bodyCopy || cta) {
        fullInstruction += `\n\n[TEXT OVERLAY REQUIREMENTS]\nThe generated image MUST include the following text elements rendered directly into the visual:\n`;
        if (headline) fullInstruction += `- Headline/Title: "${headline}"\n`;
        if (bodyCopy) fullInstruction += `- Body Text: "${bodyCopy}"\n`;
        if (cta) fullInstruction += `- CTA/Button: "${cta}"\n`;
      }

      // Pass the current brand profile
      const strat = await determineStrategy(fullInstruction, brandProfile, inputImages);
      setStrategy(strat);

      // Step 2: Generation
      setProcessingState(ProcessingState.GENERATING);
      const newImage = await editImage(inputImages, strat.refinedPrompt, strat.aspectRatio);
      
      setResultImage(newImage);
      setProcessingState(ProcessingState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      
      // Handle Authentication/API Key Errors
      const isAuthError = 
        err.message?.includes('API key') || 
        err.message?.includes('403') || 
        err.status === 403;

      if (isAuthError) {
        setHasApiKey(false);
        localStorage.removeItem('gemini_api_key_authorized');
        setError("API Key authorization failed or expired. Please connect your key again.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
      
      setProcessingState(ProcessingState.ERROR);
    }
  };

  const handleReset = () => {
    setUploadedImages([]);
    setInstruction('');
    setHeadline('');
    setBodyCopy('');
    setCta('');
    setStrategy(null);
    setResultImage(null);
    setProcessingState(ProcessingState.IDLE);
    setError(null);
    setUploadSuccessLink(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getDownloadFilename = (mimeType: string = 'image/png') => {
    const parts: string[] = ['tms'];

    // 1. Platform (e.g. facebook, instagram)
    if (strategy?.platform) {
      parts.push(strategy.platform);
    }

    // 2. Featured Product (e.g. silver-ring, soil-vial)
    if (strategy?.featuredProduct) {
      // Filter out generic terms if desired, or just include them
      const cleanProduct = strategy.featuredProduct.toLowerCase();
      if (!cleanProduct.includes('unknown') && !cleanProduct.includes('n/a')) {
         parts.push(strategy.featuredProduct);
      }
    }

    // 3. User Context (Headline or Instruction)
    let descriptor = '';
    if (headline) descriptor = headline;
    else if (instruction) descriptor = instruction;

    if (descriptor) {
      const slug = descriptor
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/[\s_-]+/g, '-') // Normalize spaces/dashes
        .substring(0, 15); // Truncate
      if (slug) parts.push(slug);
    }

    // 4. Timestamp
    parts.push(Date.now().toString().slice(-4));

    // Cleanup final string
    const filename = parts
      .join('-')
      .toLowerCase()
      .replace(/\s+/g, '-') // Ensure no spaces
      .replace(/-+/g, '-') // No double dashes
      .replace(/^-|-$/g, ''); // Trim

    // Extension
    const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';

    return `${filename}.${ext}`;
  };

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (resultImage) {
      let blob: Blob;
      let filename: string;

      // 1. Prepare Blob and Filename
      try {
        blob = base64ToBlob(resultImage);
        filename = getDownloadFilename(blob.type);
      } catch (err) {
         console.error("Blob conversion failed", err);
         return; // Can't proceed without blob
      }

      // 2. Trigger Local Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);

      // 3. Auto-Upload to Drive (if enabled)
      if (brandProfile.autoUploadToDrive && brandProfile.googleDriveClientId) {
          setIsUploading(true);
          try {
              const result = await uploadToDrive(blob, filename);
              setUploadSuccessLink(result.webViewLink);
          } catch (uploadErr: any) {
              console.error("Drive upload failed", uploadErr);
              // We don't block the UI, just maybe show error? 
              // We already logged it.
              setError(`Download successful, but Drive upload failed: ${uploadErr.message}`);
          } finally {
              setIsUploading(false);
          }
      }
    }
  };

  // Loading state for initial key check
  if (isKeyCheckLoading) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-brand-brown border-t-transparent rounded-full mb-4"></div>
        <p className="text-brand-brown font-serif animate-pulse">Initializing Visual Studio...</p>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 max-w-md w-full shadow-lg border-t-4 border-brand-gold rounded-sm text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-brand-brown text-brand-gold flex items-center justify-center font-serif font-bold text-2xl rounded-full mx-auto mb-6">TS</div>
          <h1 className="font-serif text-2xl text-brand-brown mb-4">Temple Mount Soil</h1>
          <p className="text-brand-gray mb-8 leading-relaxed font-sans">
            To access the premium generation capabilities of <strong>Gemini 3 Pro</strong>, please select a billing-enabled API key from your Google Cloud project.
          </p>
          <Button onClick={handleSelectKey} className="w-full justify-center">
            <Key size={18} />
            Connect Google Cloud API Key
          </Button>
          <p className="text-xs text-brand-gray mt-6">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-brand-brown">
              Learn about Gemini API billing
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] font-sans text-brand-brown pb-20">
      <header className="bg-white shadow-sm border-b border-brand-brown/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-brown text-brand-gold flex items-center justify-center font-serif font-bold rounded-sm">TS</div>
            <h1 className="font-serif text-xl tracking-wide hidden sm:block">Temple Mount <span className="text-brand-gold">Soil</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsConfigOpen(true)}
               className="p-2 text-brand-gray hover:text-brand-brown hover:bg-brand-cream rounded-sm transition-colors flex items-center gap-2"
               title="Configure Brand Identity"
             >
               <Settings size={20} />
               <span className="text-sm font-medium hidden sm:inline">Brand Config</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Input Section */}
        <div className="bg-white p-6 shadow-sm border-t-4 border-brand-brown rounded-sm mb-8 animate-fade-in-up">
          {/* ... Inputs ... */}
          
          {/* 1. Visual Reference */}
          <div className="mb-6">
            <label className="block text-sm font-bold uppercase tracking-wider text-brand-gray mb-2">
              1. Visual Reference (Optional)
            </label>
            
            {/* Image Grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 animate-fade-in">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img src={img.previewUrl} alt="Reference" className="w-full h-full object-cover rounded-sm border border-brand-brown/10" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                      className="absolute top-1 right-1 bg-white text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-brown/10 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:bg-brand-cream/50 hover:border-brand-gold transition-all aspect-square group"
                >
                  <Plus size={24} className="text-brand-gray group-hover:text-brand-gold mb-1" />
                  <span className="text-xs text-brand-gray group-hover:text-brand-brown">Add Image</span>
                </div>
              </div>
            )}

            {uploadedImages.length === 0 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-brown/20 rounded-sm p-8 text-center cursor-pointer transition-all hover:border-brand-brown hover:bg-brand-cream"
              >
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="p-3 bg-brand-cream rounded-full text-brand-brown">
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-brand-brown">Upload reference images</p>
                    <p className="text-xs text-brand-gray mt-1">For context, style, or editing (Max 5MB each)</p>
                  </div>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*"
              multiple
            />
            
            {uploadedImages.length > 0 && (
               <div className="flex justify-between items-center mt-2 text-xs">
                 <span className="text-brand-gold font-medium flex items-center gap-1">
                   <CheckCircle size={12} /> {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} attached
                 </span>
                 <button 
                    onClick={(e) => { e.stopPropagation(); handleReset(); }} 
                    className="text-red-500 hover:underline"
                 >
                   Clear All
                 </button>
               </div>
            )}
          </div>

          {/* 2. Text Overlays */}
          <div className="mb-6">
            <button 
              onClick={() => setIsTextSectionOpen(!isTextSectionOpen)}
              className="w-full flex justify-between items-center text-left mb-2 group"
            >
              <label className="block text-sm font-bold uppercase tracking-wider text-brand-gray cursor-pointer group-hover:text-brand-brown transition-colors">
                2. Text Overlays (Optional)
              </label>
              <div className="text-brand-gray group-hover:text-brand-brown">
                {isTextSectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            
            {isTextSectionOpen && (
              <div className="bg-brand-cream/20 p-4 rounded-sm border border-brand-brown/10 space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1 flex items-center gap-2">
                    <Type size={12} /> Headline / Title
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="E.g., SACRED EARTH"
                    className="w-full p-2 border border-brand-brown/20 rounded-sm font-serif focus:border-brand-gold outline-none"
                  />
                  <p className="text-[10px] text-brand-gray mt-1">Font: Fedra Serif H+L</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">Body Copy</label>
                  <textarea
                    value={bodyCopy}
                    onChange={(e) => setBodyCopy(e.target.value)}
                    placeholder="E.g., Authenticated soil from the Temple Mount."
                    rows={2}
                    className="w-full p-2 border border-brand-brown/20 rounded-sm font-sans focus:border-brand-gold outline-none resize-none"
                  />
                  <p className="text-[10px] text-brand-gray mt-1">Font: Heebo</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-brown mb-1">CTA / Button</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    placeholder="E.g., SHOP COLLECTION"
                    className="w-full p-2 border border-brand-brown/20 rounded-sm font-sans uppercase focus:border-brand-gold outline-none"
                  />
                   <p className="text-[10px] text-brand-gray mt-1">Font: Heebo (Uppercase)</p>
                </div>
              </div>
            )}
            {!isTextSectionOpen && (headline || bodyCopy || cta) && (
              <div className="flex gap-2 text-xs text-brand-gold mt-1">
                <CheckCircle size={12} />
                <span>Text configured: {headline && 'Headline'} {bodyCopy && 'Body'} {cta && 'CTA'}</span>
              </div>
            )}
          </div>

          {/* 3. Your Directive */}
          <div className="mb-6">
            <label className="block text-sm font-bold uppercase tracking-wider text-brand-gray mb-2">
              3. Strategy & Context
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Describe the mood, setting, or specific strategy. E.g. 'Show this product on a stone pedestal during golden hour'."
              className="w-full p-4 border border-brand-brown/20 rounded-sm font-sans focus:border-brand-gold outline-none min-h-[100px] resize-y text-lg"
            />
          </div>

          <div className="flex justify-end gap-3">
             <Button 
               variant="outline" 
               onClick={handleReset} 
               disabled={!instruction && uploadedImages.length === 0 && !headline && !bodyCopy && !cta}
             >
               <RefreshCw size={18} /> Reset
             </Button>
             <Button 
               onClick={handleProcess} 
               isLoading={processingState === ProcessingState.ANALYZING || processingState === ProcessingState.GENERATING}
               disabled={(!instruction && !headline && !bodyCopy && !cta && uploadedImages.length === 0) || processingState !== ProcessingState.IDLE}
             >
               <Wand2 size={18} /> 
               {uploadedImages.length > 0 ? 'Refine Image(s)' : 'Generate'}
             </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 rounded-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <ProcessingStatus state={processingState} />

        {strategy && <StrategyDisplay strategy={strategy} />}

        {resultImage && (
          <div className="bg-white p-6 shadow-sm border-t-4 border-green-600 rounded-sm animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-2xl text-brand-brown flex items-center gap-2">
                    <span className="text-green-600">✦</span> Final Result
                </h3>
                {/* Result Actions */}
                <div className="flex flex-col items-end gap-2">
                     <div className="flex gap-2">
                         <Button 
                           variant="outline" 
                           onClick={handleProcess} 
                           className="py-2 px-4 text-sm"
                           title="Regenerate with same settings"
                         >
                           <RefreshCw size={16} /> Regenerate
                         </Button>
                         <a 
                           href="#" 
                           onClick={handleDownload}
                           className="bg-brand-brown text-brand-cream hover:bg-brand-gold hover:text-white border-2 border-transparent px-6 py-2 rounded-none font-sans font-bold tracking-wide transition-all duration-300 flex items-center gap-2 text-sm"
                           title={brandProfile.autoUploadToDrive ? "Download & Upload to Drive" : "Download Image"}
                         >
                           {isUploading ? (
                               <>
                                 <div className="animate-spin w-4 h-4 border-2 border-white/50 border-t-white rounded-full"></div>
                                 Uploading...
                               </>
                           ) : (
                               <>
                                 <Download size={16} /> 
                                 {brandProfile.autoUploadToDrive && brandProfile.googleDriveClientId ? "Download & Drive" : "Download"}
                               </>
                           )}
                         </a>
                     </div>
                     {uploadSuccessLink && (
                         <a href={uploadSuccessLink} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline flex items-center gap-1">
                             <Cloud size={10} /> View on Drive <ExternalLink size={10}/>
                         </a>
                     )}
                </div>
             </div>
             
             <div className="relative group bg-[#F5F2EB] rounded-sm overflow-hidden flex justify-center items-center min-h-[300px] border border-brand-brown/5">
                <img src={resultImage} alt="Generated" className="max-w-full shadow-lg" />
             </div>
          </div>
        )}
      </main>

      <BrandConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        profile={brandProfile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default App;