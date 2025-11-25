
import React, { useState, useRef } from 'react';
import { X, Save, RotateCcw, Image as ImageIcon, Sparkles, Trash2, Upload } from 'lucide-react';
import { BrandProfile, ReferenceImage } from '../types';
import { Button } from './Button';
import { DEFAULT_BRAND_PROFILE } from '../constants';
import { analyzeBrandAssets } from '../services/geminiService';

interface BrandConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BrandProfile;
  onSave: (profile: BrandProfile) => void;
}

export const BrandConfigModal: React.FC<BrandConfigModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState<BrandProfile>(profile);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (confirm("Reset to default Temple Mount Soil branding?")) {
      setFormData(DEFAULT_BRAND_PROFILE);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file.size > 4 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Max 4MB.`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          const newImage: ReferenceImage = {
            data: base64,
            mimeType: file.type
          };
          setFormData(prev => ({
            ...prev,
            styleReferenceImages: [...(prev.styleReferenceImages || []), newImage]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      styleReferenceImages: prev.styleReferenceImages.filter((_, i) => i !== index)
    }));
  };

  const handleAnalyze = async () => {
    if (!formData.styleReferenceImages || formData.styleReferenceImages.length === 0) {
      alert("Please upload at least one reference image to analyze.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeBrandAssets(formData.styleReferenceImages);
      setFormData(prev => ({
        ...prev,
        visualStyle: result.visualStyle,
        productDescription: result.productDescription
      }));
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-sm flex flex-col">
        
        <div className="p-6 border-b border-brand-brown/10 flex justify-between items-center bg-brand-cream/30 sticky top-0 z-10">
          <div>
            <h2 className="font-serif text-2xl text-brand-brown">Brand Identity & Training</h2>
            <p className="text-brand-gray text-xs font-sans uppercase tracking-wider">Embed your visual language</p>
          </div>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-brown">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Visual Assets */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-brown mb-4 flex items-center gap-2">
                <ImageIcon size={16} /> Reference Images
              </h3>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-brown/20 rounded-sm p-6 text-center cursor-pointer hover:border-brand-gold hover:bg-brand-cream/50 transition-all mb-4"
              >
                <Upload className="w-8 h-8 text-brand-gray mx-auto mb-2" />
                <p className="text-sm font-medium text-brand-brown font-sans">Upload Brand Assets</p>
                <p className="text-xs text-brand-gray mt-1">Product shots, style examples</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                multiple
                accept="image/png, image/jpeg, image/webp"
              />

              {formData.styleReferenceImages?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {formData.styleReferenceImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img 
                        src={`data:${img.mimeType};base64,${img.data}`} 
                        alt="Reference" 
                        className="w-full h-full object-cover rounded-sm border border-brand-brown/10"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-brand-cream/30 p-4 rounded-sm border border-brand-brown/10">
              <h4 className="font-bold text-brand-brown text-sm mb-2">Training</h4>
              <p className="text-xs text-brand-gray mb-4 leading-relaxed">
                Click analyze to have Gemini inspect your uploaded images and automatically write the detailed visual style and product descriptions below.
              </p>
              <Button 
                type="button" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !formData.styleReferenceImages?.length}
                variant="secondary"
                className="w-full text-sm py-2"
                isLoading={isAnalyzing}
              >
                <Sparkles size={16} />
                {isAnalyzing ? "Learning Style..." : "Analyze & Embed Style"}
              </Button>
            </div>
          </div>

          {/* Right Column: Text Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Brand Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-brand-brown/20 rounded-sm font-sans focus:border-brand-gold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Tone</label>
                <input
                  type="text"
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="w-full p-2 border border-brand-brown/20 rounded-sm font-sans focus:border-brand-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Colors</label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleChange}
                  className="w-full p-2 border border-brand-brown/20 rounded-sm font-sans focus:border-brand-gold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1 flex items-center justify-between">
                <span>Visual Style</span>
                <span className="text-[10px] font-normal text-green-600 bg-green-50 px-2 rounded-full">{formData.visualStyle.length} chars</span>
              </label>
              <textarea
                name="visualStyle"
                value={formData.visualStyle}
                onChange={handleChange}
                rows={5}
                className="w-full p-2 border border-brand-brown/20 rounded-sm font-sans focus:border-brand-gold outline-none resize-none bg-yellow-50/50 text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Product Details</label>
              <textarea
                name="productDescription"
                value={formData.productDescription}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-brand-brown/20 rounded-sm font-sans focus:border-brand-gold outline-none resize-none text-sm leading-relaxed"
              />
            </div>
          </div>

        </form>

        <div className="p-6 border-t border-brand-brown/10 bg-gray-50 flex justify-between items-center sticky bottom-0">
          <button 
            type="button" 
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-brand-gray hover:text-red-600 transition-colors"
          >
            <RotateCcw size={14} /> Reset Default
          </button>
          <div className="flex gap-3">
             <Button variant="outline" onClick={onClose} className="py-2 px-4 text-sm">Cancel</Button>
             <Button onClick={handleSubmit} className="py-2 px-4 text-sm"><Save size={16} className="mr-2"/> Save Configuration</Button>
          </div>
        </div>

      </div>
    </div>
  );
};