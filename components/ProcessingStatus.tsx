
import React from 'react';
import { ProcessingState } from '../types';
import { BrainCircuit, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface ProcessingStatusProps {
  state: ProcessingState;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ state }) => {
  const isAnalyzing = state === ProcessingState.ANALYZING;
  const isGenerating = state === ProcessingState.GENERATING;

  if (!isAnalyzing && !isGenerating) return null;

  return (
    <div className="bg-white p-8 rounded-sm shadow-lg border-t-4 border-brand-gold animate-fade-in my-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-serif text-2xl text-brand-brown mb-1">
            {isAnalyzing ? "Formulating Strategy" : "Production in Progress"}
          </h3>
          <p className="text-xs font-sans text-brand-gray uppercase tracking-widest">
            {isAnalyzing ? "Phase 01: Analysis" : "Phase 02: Generation"}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center text-brand-gold animate-pulse">
           {isAnalyzing ? <BrainCircuit size={20} /> : <Loader2 size={20} className="animate-spin" />}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-10 mx-2">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-brown/10 -translate-y-1/2"></div>
        
        {/* Active Line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-brand-gold -translate-y-1/2 transition-all duration-700 ease-out"
          style={{ width: isAnalyzing ? '50%' : '100%' }}
        ></div>

        <div className="relative flex justify-between w-full">
          {/* Step 1 Indicator */}
          <div className="flex flex-col items-center gap-3 -mt-2">
            <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 z-10 bg-white ${isAnalyzing || isGenerating ? 'border-brand-gold bg-brand-gold' : 'border-brand-gray/30'}`}></div>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isAnalyzing ? 'text-brand-brown' : 'text-brand-gray/50'}`}>
              Strategy
            </span>
          </div>

          {/* Step 2 Indicator */}
          <div className="flex flex-col items-center gap-3 -mt-2">
            <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 z-10 bg-white ${isGenerating ? 'border-brand-gold bg-brand-gold' : 'border-brand-gray/30'}`}></div>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isGenerating ? 'text-brand-brown' : 'text-brand-gray/50'}`}>
              Rendering
            </span>
          </div>

          {/* Step 3 Indicator (Ghost for completion) */}
           <div className="flex flex-col items-center gap-3 -mt-2">
            <div className="w-4 h-4 rounded-full border-2 border-brand-gray/30 bg-white z-10"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gray/50">
              Finalize
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Status Text */}
      <div className="bg-brand-cream/30 p-5 rounded-sm border border-brand-brown/5 text-center transition-all duration-300">
         <div className="flex justify-center mb-3 text-brand-gold">
            {isAnalyzing ? <Sparkles size={20} className="animate-pulse" /> : <Loader2 size={20} className="animate-spin" />}
         </div>
         <p className="text-brand-brown font-medium font-serif text-lg mb-2">
           {isAnalyzing 
             ? "Consulting Brand Guidelines..." 
             : "Synthesizing High-Fidelity Visuals..."}
         </p>
         <p className="text-sm text-brand-gray font-sans max-w-md mx-auto leading-relaxed">
           {isAnalyzing 
             ? "Analyzing your request against specific platform requirements, tone, and visual identity to craft the perfect directive." 
             : "Gemini 3 Pro is applying complex lighting, texture rendering, and composition rules to generate your image."}
         </p>
      </div>
    </div>
  );
};
